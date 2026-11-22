import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const config = JSON.parse(await readFile(new URL('src-tauri/tauri.conf.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
if (config.version !== manifest.version) {
  throw new Error('The Tauri and npm versions must match.');
}

const release = new URL(`releases/v${config.version}/`, root);
const target = process.env.CARGO_TARGET_DIR
  ? pathToFileURL(resolve(process.env.CARGO_TARGET_DIR) + sep)
  : new URL('src-tauri/target/', root);
await mkdir(release, { recursive: true });

async function stage(source, name) {
  const executable = new URL(name, release);
  const staged = new URL(`.typing-cat-${randomUUID()}.exe`, release);
  try {
    await copyFile(source, staged);
    await rename(staged, executable);
  } finally {
    await rm(staged, { force: true });
  }
  console.log(`Release ready: ${fileURLToPath(executable)}`);
}

if (process.argv.includes('--installer')) {
  const installerDir = new URL('release/bundle/nsis/', target);
  const prefix = `${config.productName}_${config.version}_`;
  const installers = (await readdir(installerDir))
    .filter(name => name.startsWith(prefix) && name.endsWith('-setup.exe'));
  if (installers.length === 0) throw new Error('No installer found for this version.');
  for (const name of installers) {
    await stage(new URL(encodeURIComponent(name), installerDir), `typing-cat-${name.slice(prefix.length)}`);
  }
} else {
  await stage(new URL('release/typing-cat-app.exe', target), 'typing-cat.exe');
}
