import os
from .pdf_ingest import structured_pdf_ingest, ocr_ingest, extract_images_from_pdf
from .video_ingest import video_ingest


def ingest(path):
    ext = os.path.splitext(path)[1].lower()

    if ext in [".jpg", ".jpeg", ".png"]:
        return ocr_ingest(path)

    if ext in [".mp4", ".mov", ".avi"]:
        return video_ingest(path)

    if ext == ".pdf":
        chunks = structured_pdf_ingest(path)

        if len(chunks) < 3:
            chunks = ocr_ingest(path)

        chunks += extract_images_from_pdf(path)
        return chunks

    return []