use reqwest::blocking::Client;
use semver::Version;
use sha2::{Digest, Sha256};
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::{Emitter, Manager};

const LATEST_RELEASE_API: &str = "https://api.github.com/repos/996wuxian/typing-cat/releases/latest";
const RELEASE_PAGE_PREFIX: &str = "https://github.com/996wuxian/typing-cat/releases/tag/";
const ASSET_URL_PREFIX: &str = "https://github.com/996wuxian/typing-cat/releases/download/";
const DOWNLOAD_PROGRESS_EVENT: &str = "typing-cat-update-download-progress";

#[derive(Default)]
pub struct UpdateState {
    checked: Mutex<Option<CheckedRelease>>,
    downloading: Mutex<()>,
}

#[derive(Clone, serde::Deserialize)]
struct ReleaseAsset {
    name: String,
    size: u64,
    browser_download_url: String,
    digest: Option<String>,
}

#[derive(serde::Deserialize)]
struct Release {
    tag_name: String,
    html_url: String,
    published_at: Option<String>,
    draft: bool,
    prerelease: bool,
    assets: Vec<ReleaseAsset>,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    current_version: String,
    latest_version: String,
    has_update: bool,
    release_url: String,
    published_at: Option<String>,
    asset_name: Option<String>,
    asset_size: Option<u64>,
}

#[derive(Clone)]
struct CheckedRelease {
    info: UpdateInfo,
    asset: Option<ReleaseAsset>,
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadProgress {
    downloaded_bytes: u64,
    total_bytes: u64,
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadedUpdate {
    file_name: String,
    file_path: String,
}

fn http_client(timeout: Duration) -> Result<Client, String> {
    Client::builder()
        .user_agent(concat!("typing-cat/", env!("CARGO_PKG_VERSION")))
        .connect_timeout(Duration::from_secs(15))
        .timeout(timeout)
        .https_only(true)
        .build()
        .map_err(|_| "无法创建更新连接，请前往 GitHub 下载。".into())
}

fn fetch_latest_release() -> Result<Release, String> {
    let response = http_client(Duration::from_secs(25))?
        .get(LATEST_RELEASE_API)
        .header("Accept", "application/vnd.github+json")
        .send()
        .map_err(|_| "无法连接 GitHub，请检查网络或前往发布页查看。".to_string())?;
    match response.status().as_u16() {
        403 | 429 => return Err("GitHub 暂时限制了更新检查，请稍后重试或前往发布页。".into()),
        404 => return Err("尚未找到可用的正式版本，请前往 GitHub 发布页查看。".into()),
        _ => {}
    }
    response
        .error_for_status()
        .map_err(|_| "GitHub 暂时无法提供版本信息，请稍后重试。".to_string())?
        .json()
        .map_err(|_| "无法读取最新版本信息，请前往 GitHub 发布页查看。".into())
}

fn installer_rank(name: &str, os: &str, arch: &str) -> Option<u8> {
    let name = name.to_ascii_lowercase();
    let architectures: &[(&str, &[&str])] = &[
        ("x86_64", &["x64", "x86_64", "amd64"]),
        ("aarch64", &["arm64", "aarch64"]),
        ("x86", &["x86", "i686", "i386"]),
    ];
    let asset_arch = architectures
        .iter()
        .find(|(_, aliases)| {
            aliases.iter().any(|alias| {
                name.contains(&format!("_{alias}-"))
                    || name.contains(&format!("_{alias}_"))
                    || name.contains(&format!("_{alias}."))
                    || name.contains(&format!("-{alias}."))
                    || name.contains(&format!("-{alias}-"))
            })
        })
        .map(|(arch, _)| *arch);
    if asset_arch.is_none() && os == "windows" && arch == "x86_64" && name == "typing-cat.exe" {
        return Some(2);
    }
    if asset_arch != Some(arch) {
        return None;
    }
    match os {
        "windows" if name.ends_with("-setup.exe") => Some(0),
        "windows" if name.ends_with(".msi") => Some(1),
        "windows" if name.ends_with(".exe") => Some(2),
        "macos" if name.ends_with(".dmg") => Some(0),
        "linux" if name.ends_with(".appimage") => Some(0),
        "linux" if name.ends_with(".deb") => Some(1),
        _ => None,
    }
}

fn safe_asset(asset: &ReleaseAsset) -> bool {
    !asset.name.is_empty()
        && asset
            .name
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"._-".contains(&byte))
        && asset.size > 0
        && asset.browser_download_url.starts_with(ASSET_URL_PREFIX)
}

fn inspect_release(
    release: Release,
    current: &Version,
    os: &str,
    arch: &str,
) -> Result<CheckedRelease, String> {
    let latest = Version::parse(release.tag_name.trim().trim_start_matches('v'))
        .map_err(|_| "发布版本号格式无法识别，请前往 GitHub 发布页查看。".to_string())?;
    if release.draft
        || release.prerelease
        || !latest.pre.is_empty()
        || !release.html_url.starts_with(RELEASE_PAGE_PREFIX)
    {
        return Err("未找到可用的正式版本，请前往 GitHub 发布页查看。".into());
    }
    let asset = release
        .assets
        .into_iter()
        .filter(safe_asset)
        .filter_map(|asset| installer_rank(&asset.name, os, arch).map(|rank| (rank, asset)))
        .min_by_key(|(rank, _)| *rank)
        .map(|(_, asset)| asset);
    Ok(CheckedRelease {
        info: UpdateInfo {
            current_version: current.to_string(),
            latest_version: latest.to_string(),
            has_update: latest.cmp_precedence(current).is_gt(),
            release_url: release.html_url,
            published_at: release.published_at,
            asset_name: asset.as_ref().map(|asset| asset.name.clone()),
            asset_size: asset.as_ref().map(|asset| asset.size),
        },
        asset,
    })
}

#[tauri::command]
pub async fn check_for_updates(app: tauri::AppHandle) -> Result<UpdateInfo, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let checked = inspect_release(
            fetch_latest_release()?,
            &app.package_info().version,
            std::env::consts::OS,
            std::env::consts::ARCH,
        )?;
        let info = checked.info.clone();
        *app.state::<UpdateState>()
            .checked
            .lock()
            .map_err(|error| error.to_string())? = Some(checked);
        Ok(info)
    })
    .await
    .map_err(|_| "更新检查未能完成，请重试。".to_string())?
}

fn download_directory(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .download_dir()
        .map(|directory| directory.join("typing-cat"))
        .map_err(|_| "无法访问下载目录，请前往 GitHub 手动下载。".into())
}

fn copy_installer(
    mut reader: impl Read,
    mut writer: impl Write,
    asset: &ReleaseAsset,
    mut progress: impl FnMut(DownloadProgress),
) -> Result<(), String> {
    let mut buffer = [0u8; 64 * 1024];
    let mut downloaded = 0;
    let mut hash = Sha256::new();
    let mut last_progress = Instant::now();
    progress(DownloadProgress {
        downloaded_bytes: 0,
        total_bytes: asset.size,
    });
    loop {
        let count = reader
            .read(&mut buffer)
            .map_err(|_| "下载中断，请重试或前往 GitHub 下载。".to_string())?;
        if count == 0 {
            break;
        }
        downloaded += count as u64;
        if downloaded > asset.size {
            return Err("下载文件大小与发布信息不一致，请重试。".into());
        }
        writer
            .write_all(&buffer[..count])
            .map_err(|_| "无法保存安装包，请检查下载目录和可用空间。".to_string())?;
        hash.update(&buffer[..count]);
        if last_progress.elapsed() >= Duration::from_millis(200) {
            progress(DownloadProgress {
                downloaded_bytes: downloaded,
                total_bytes: asset.size,
            });
            last_progress = Instant::now();
        }
    }
    if downloaded != asset.size {
        return Err("安装包未下载完整，请重试或前往 GitHub 下载。".into());
    }
    if let Some(digest) = &asset.digest {
        let actual = format!("sha256:{:x}", hash.finalize());
        if !actual.eq_ignore_ascii_case(digest) {
            return Err("安装包校验失败，请重试或前往 GitHub 下载。".into());
        }
    }
    writer
        .flush()
        .map_err(|_| "无法保存安装包，请检查可用空间。".to_string())?;
    progress(DownloadProgress {
        downloaded_bytes: downloaded,
        total_bytes: asset.size,
    });
    Ok(())
}

fn download_installer(
    asset: &ReleaseAsset,
    directory: &Path,
    progress: impl FnMut(DownloadProgress),
) -> Result<DownloadedUpdate, String> {
    let response = http_client(Duration::from_secs(30 * 60))?
        .get(&asset.browser_download_url)
        .send()
        .and_then(|response| response.error_for_status())
        .map_err(|_| "无法下载 GitHub 安装包，请重试或前往发布页下载。".to_string())?;
    fs::create_dir_all(directory)
        .map_err(|_| "无法创建下载目录，请前往 GitHub 手动下载。".to_string())?;
    let mut partial = None;
    for index in 0..1000 {
        let stem = Path::new(&asset.name)
            .file_stem()
            .unwrap_or_default()
            .to_string_lossy();
        let extension = Path::new(&asset.name)
            .extension()
            .unwrap_or_default()
            .to_string_lossy();
        let name = if index == 0 {
            asset.name.clone()
        } else {
            format!("{stem}-{index}.{extension}")
        };
        let final_path = directory.join(&name);
        if final_path.exists() {
            continue;
        }
        let partial_path = directory.join(format!("{name}.part"));
        match OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&partial_path)
        {
            Ok(file) => {
                partial = Some((name, final_path, partial_path, file));
                break;
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => continue,
            Err(_) => return Err("无法保存安装包，请检查下载目录权限。".into()),
        }
    }
    let (name, final_path, partial_path, file) =
        partial.ok_or("无法创建下载文件，请清理下载目录后重试。")?;
    let result = copy_installer(response, &file, asset, progress);
    drop(file);
    if let Err(error) = result {
        let _ = fs::remove_file(&partial_path);
        return Err(error);
    }
    if fs::hard_link(&partial_path, &final_path).is_err() {
        let _ = fs::remove_file(&partial_path);
        return Err("无法保存完整安装包，请重试或前往 GitHub 下载。".into());
    }
    let _ = fs::remove_file(&partial_path);
    Ok(DownloadedUpdate {
        file_name: name,
        file_path: final_path.to_string_lossy().into_owned(),
    })
}

#[tauri::command]
pub async fn download_update(
    app: tauri::AppHandle,
    window: tauri::Window,
) -> Result<DownloadedUpdate, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let state = app.state::<UpdateState>();
        let _download_guard = state
            .downloading
            .try_lock()
            .map_err(|_| "安装包正在下载，请等待完成。".to_string())?;
        let checked = state
            .checked
            .lock()
            .map_err(|error| error.to_string())?
            .clone()
            .ok_or("请先检查版本更新。")?;
        if !checked.info.has_update {
            return Err("当前版本无需更新。".into());
        }
        let asset = checked
            .asset
            .ok_or("此版本没有适合当前系统的安装包，请前往 GitHub 下载。")?;
        download_installer(&asset, &download_directory(&app)?, |progress| {
            let _ = window.emit(DOWNLOAD_PROGRESS_EVENT, progress);
        })
    })
    .await
    .map_err(|_| "下载未能完成，请重试或前往 GitHub 下载。".to_string())?
}

#[tauri::command]
pub fn open_update_download_directory(app: tauri::AppHandle) -> Result<(), String> {
    let directory = download_directory(&app)?;
    #[cfg(windows)]
    let result = Command::new("explorer").arg(&directory).spawn();
    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(&directory).spawn();
    #[cfg(all(unix, not(target_os = "macos")))]
    let result = Command::new("xdg-open").arg(&directory).spawn();
    result
        .map(|_| ())
        .map_err(|_| "无法打开下载目录，请在系统下载目录中的 typing-cat 文件夹查看安装包。".into())
}
