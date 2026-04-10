import os
from .pdf_ingest import structured_pdf_ingest, ocr_ingest, extract_images_from_pdf
from .video_ingest import video_ingest
# 🔥 TEMP DIRECTORY (ABSOLUTE PATH)
TEMP_DIR = os.path.join(os.path.dirname(__file__), "..", "temp")
TEMP_DIR = os.path.abspath(TEMP_DIR)

# Ensure temp folder exists
os.makedirs(TEMP_DIR, exist_ok=True)


def cleanup_temp():
    if not os.path.exists(TEMP_DIR):
        return

    for file in os.listdir(TEMP_DIR):
        file_path = os.path.join(TEMP_DIR, file)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Cleanup error: {e}")


def ingest(path):
    ext = os.path.splitext(path)[1].lower()

    try:
        if ext in [".jpg", ".jpeg", ".png"]:
            return ocr_ingest(path)

        if ext in [".mp4", ".mov", ".avi"]:
            return video_ingest(path)

        if ext == ".pdf":
            chunks = structured_pdf_ingest(path)
            chunks += ocr_ingest(path)
            chunks += extract_images_from_pdf(path)
            return chunks

        return []

    finally:
        # 🔥 ALWAYS CLEAN TEMP FILES
        cleanup_temp()