import whisper
import subprocess
import os

from .chunking import chunk_text
from .vision import vision_extract

whisper_model = whisper.load_model("base")


def extract_audio(video_path):
    audio_path = "temp_audio.wav"

    subprocess.run([
        "ffmpeg", "-i", video_path,
        "-ar", "16000",
        "-ac", "1",
        "-y",
        audio_path
    ])

    return audio_path


def video_ingest(path):
    chunks = []

    audio_path = extract_audio(path)
    result = whisper_model.transcribe(audio_path)

    for idx, piece in enumerate(chunk_text(result["text"])):
        chunks.append({
            "id": f"audio_{idx}",
            "text": piece,
            "type": "video_transcript",
            "page": 0
        })

    return chunks