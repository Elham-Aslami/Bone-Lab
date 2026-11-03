"""Package the app for download and manual upload to a new GitHub repository."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
APP_ARCHIVE = ROOT / "dist" / "Bone-Lab-Source.zip"
EXPORT_DIRECTORY = ROOT / "exports"
GITHUB_ARCHIVE = EXPORT_DIRECTORY / "Bone-Lab-GitHub.zip"
TEST_ARCHIVE = EXPORT_DIRECTORY / "Bone-Lab-Test.zip"
ROOT_FILES = [
    ".gitignore",
    "README.md",
    "GITHUB-PAGES-SETUP.md",
    "Start-Bone-Lab.bat",
    "start-local.py",
    "start-local.mjs",
    "TEST-BEFORE-DEPLOYING.md",
    "verify.mjs",
    "verify-camera.mjs",
    "package-github.py",
]


def write_archive(destination, wrapper, files):
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
        for path in sorted(files):
            if path.is_symlink():
                raise ValueError(f"Unexpected symbolic link: {path}")
            archive.write(path, f"{wrapper}/{path.relative_to(ROOT).as_posix()}")
    with ZipFile(destination) as archive:
        if archive.testzip() is not None:
            raise RuntimeError(f"Archive validation failed: {destination}")
        print(f"{destination.name}: {len(archive.namelist())} files, {destination.stat().st_size:,} bytes")


if __name__ == "__main__":
    files = [ROOT / name for name in ROOT_FILES]
    files += [p for p in (ROOT / ".github").rglob("*") if p.is_file()]
    files += [p for p in (ROOT / "dist").rglob("*") if p.is_file() and p != APP_ARCHIVE]
    # Only these portable files are included; .git and .openai are never copied.
    write_archive(APP_ARCHIVE, "Bone-Lab", files)
    EXPORT_DIRECTORY.mkdir(exist_ok=True)
    write_archive(GITHUB_ARCHIVE, "Bone-Lab-GitHub", files + [APP_ARCHIVE])
    write_archive(TEST_ARCHIVE, "Bone-Lab-Test", files + [APP_ARCHIVE])
