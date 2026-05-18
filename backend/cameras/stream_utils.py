"""RTSP → MJPEG helpers (ffmpeg must be on PATH or FFMPEG_PATH in .env)."""

from __future__ import annotations

import os
import re
import shutil
import subprocess
from typing import Iterator


def resolve_ffmpeg_path() -> str | None:
    from django.conf import settings

    custom = getattr(settings, "FFMPEG_PATH", "").strip()
    if custom and os.path.isfile(custom):
        return custom
    found = shutil.which("ffmpeg")
    if found:
        return found
    if os.name == "nt":
        import glob

        local = os.environ.get("LOCALAPPDATA", "")
        if local:
            pattern = os.path.join(
                local,
                "Microsoft",
                "WinGet",
                "Packages",
                "Gyan.FFmpeg_*",
                "ffmpeg-*-full_build",
                "bin",
                "ffmpeg.exe",
            )
            for path in sorted(glob.glob(pattern), reverse=True):
                if os.path.isfile(path):
                    return path
    return None


def ffmpeg_available() -> bool:
    return resolve_ffmpeg_path() is not None


def ffmpeg_path() -> str:
    path = resolve_ffmpeg_path()
    if not path:
        raise FileNotFoundError(
            "ffmpeg not found. Install ffmpeg (e.g. winget install Gyan.FFmpeg) "
            "or set FFMPEG_PATH in backend/.env to the full path to ffmpeg.exe."
        )
    return path


def camera_label_from_url(url: str, index: int) -> str:
    match = re.search(r"@([\d.]+)", url)
    if match:
        return f"Camera {index + 1} ({match.group(1)})"
    return f"Camera {index + 1}"


def generate_mjpeg_frames(rtsp_url: str) -> Iterator[bytes]:
    """Yield multipart MJPEG chunks from an RTSP source via ffmpeg."""
    exe = ffmpeg_path()
    cmd = [
        exe,
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-rtsp_transport",
        "tcp",
        "-i",
        rtsp_url,
        "-an",
        "-vf",
        "fps=10,scale=640:-1",
        "-f",
        "mjpeg",
        "-q:v",
        "8",
        "-",
    ]
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            bufsize=0,
        )
    except FileNotFoundError:
        return
    if not proc.stdout:
        proc.kill()
        return

    buffer = b""
    try:
        while True:
            chunk = proc.stdout.read(4096)
            if not chunk:
                break
            buffer += chunk
            start = buffer.find(b"\xff\xd8")
            end = buffer.find(b"\xff\xd9")
            if start == -1 or end == -1 or end < start:
                continue
            jpg = buffer[start : end + 2]
            buffer = buffer[end + 2 :]
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"
            )
    finally:
        proc.kill()
        try:
            proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            proc.kill()
