from io import BytesIO
from pathlib import Path
from struct import pack

from PIL import Image, ImageFilter, ImageOps


def fit_icon(image, size, margin):
    content = ImageOps.contain(image, (size - 2 * margin,) * 2, Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (size, size))
    frame.alpha_composite(content, ((size - content.width) // 2, (size - content.height) // 2))
    if size <= 64:
        sharpened = frame.convert("RGB").filter(ImageFilter.UnsharpMask(radius=.55, percent=125, threshold=2))
        sharpened.putalpha(frame.getchannel("A"))
        return sharpened
    return frame


def write_ico(path, frames):
    offset = 6 + 16 * len(frames)
    directory = bytearray(pack("<HHH", 0, 1, len(frames)))
    images = []
    for size, frame in frames:
        buffer = BytesIO()
        frame.save(buffer, format="PNG")
        image = buffer.getvalue()
        # ICO stores 256 as zero in its one-byte width and height fields.
        dimension = size % 256
        directory.extend(pack("<BBBBHHII", dimension, dimension, 0, 0, 1, 32, len(image), offset))
        images.append(image)
        offset += len(image)
    path.write_bytes(directory + b"".join(images))


def main():
    folder = Path(__file__).resolve().parents[1] / "src-tauri" / "icons"
    with Image.open(folder / "icon-source.png") as original:
        image = original.convert("RGBA")

    full = image.crop(image.getchannel("A").point(lambda alpha: 255 if alpha >= 32 else 0).getbbox())
    # Tauri uses the first ICO frame for the live window. Use a 64 px master there.
    sizes = (64, 16, 20, 24, 32, 40, 48, 96, 128, 256)
    frames = [(size, fit_icon(full, size, size // 32)) for size in sizes]
    write_ico(folder / "icon.ico", frames)
    frames[-1][1].save(folder / "icon.png")


if __name__ == "__main__":
    main()
