from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
load_dotenv()
from rag.pipeline import aske
from db.chroma_client import ingest_and_store


app = FastAPI()

# ✅ CORS (important for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# temp folder
os.makedirs("temp", exist_ok=True)


# 🔥 Upload API
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    path = f"temp/{file.filename}"

    with open(path, "wb") as f:
        f.write(await file.read())

    ingest_and_store(path)

    return {"message": "File processed successfully"}


# 🔥 Request model
class Query(BaseModel):
    query: str


# 🔥 Ask API
@app.post("/ask")
async def ask_question(q: Query):
    return {"response": aske(q.query)}