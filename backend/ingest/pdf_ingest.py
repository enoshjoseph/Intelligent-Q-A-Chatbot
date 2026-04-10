from unstructured.partition.pdf import partition_pdf
from pdf2image import convert_from_path
from PIL import Image
import fitz
import os
import io

from .chunking import chunk_text
from .vision import vision_extract

# Write all temp images to the temp/ subfolder (not the CWD)
TEMP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "temp"))
os.makedirs(TEMP_DIR, exist_ok=True)


def structured_pdf_ingest(path):
    elements = partition_pdf(
    path,
    strategy="fast",
    infer_table_structure=False
)
    chunks = []
    idx = 0

    for el in elements:
        if el.text and el.text.strip():
            page_number = getattr(el.metadata, "page_number", None)
            text = el.text.strip()
            refined_type = el.category

            if el.category == "Title":
                if page_number == 1:
                    refined_type = "main_title"
                else:
                    refined_type = "section_title"

            chunks.append({
                "id": str(idx),
                "text": text,
                "type": refined_type,
                "page": page_number
            })
            idx += 1

    return chunks


def ocr_ingest(path):
    chunks = []
    pages = convert_from_path(
    path,
    dpi=300,
    poppler_path=r"C:\poppler-25.12.0\Library\bin"
)

    for page_num, page_img in enumerate(pages, start=1):
        temp_path = os.path.join(TEMP_DIR, f"temp_page_{page_num}.jpg")
        page_img.save(temp_path)

        text = vision_extract(temp_path).strip()

        for idx, piece in enumerate(chunk_text(text)):
            chunks.append({
                "id": f"ocr_{page_num}_{idx}",
                "text": piece,
                "type": "ocr_text",
                "page": page_num
            })

    return chunks


def extract_images_from_pdf(path):
    chunks = []
    doc = fitz.open(path)

    for page_num, page in enumerate(doc, start=1):
        for img in page.get_images(full=True):
            xref = img[0]
            base_image = doc.extract_image(xref)

            temp_path = os.path.join(TEMP_DIR, f"temp_img_{page_num}.jpg")
            with open(temp_path, "wb") as f:
                f.write(base_image["image"])

            text = vision_extract(temp_path).strip()

            for idx, piece in enumerate(chunk_text(text)):
                chunks.append({
                    "id": f"img_{page_num}_{idx}",
                    "text": piece,
                    "type": "image_ocr",
                    "page": page_num
                })

    return chunks   