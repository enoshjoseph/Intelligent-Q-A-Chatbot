from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

from rag.pipeline import aske
from db.chroma_client import ingest_and_store
from ingest import cleanup_temp   # 🔥 IMPORT THIS

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ TEMP folder
TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)


# 🔥 CLEANUP ON STARTUP (VERY IMPORTANT)
@app.on_event("startup")
def startup_cleanup():
    cleanup_temp()


# 🔥 Upload API
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    path = os.path.join(TEMP_DIR, file.filename)

    try:
        with open(path, "wb") as f:
            f.write(await file.read())

        ingest_and_store(path)

        return {"message": "File processed successfully"}

    finally:
        # 🔥 ALWAYS CLEAN AFTER REQUEST
        cleanup_temp()


# 🔥 Request model
class Query(BaseModel):
    query: str


# 🔥 Ask API
@app.post("/ask")
async def ask_question(q: Query):
    return {"response": aske(q.query)}