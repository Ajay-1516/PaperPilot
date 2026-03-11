from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
from typing import List, Optional, Union
import main

app = FastAPI()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Allow CORS for local React dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://paperpilot-1.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.post("/analyze")
async def analyze(
    files: Union[List[UploadFile], UploadFile, None] = File(default=None),
    dois: Optional[str] = Form(None),
    urls: Optional[str] = Form(None),
    topic_list: Optional[str] = Form(None),
):
    # Normalize files to a list
    if files is None:
        files_list = []
    elif isinstance(files, list):
        files_list = files
    else:
        files_list = [files]

    # Save uploaded PDFs
    pdf_paths = []
    if files_list:
        for file in files_list:
            file_id = str(uuid.uuid4())
            file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
            with open(file_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            pdf_paths.append(file_path)

    # Parse DOIs and topics
    doi_list = [d.strip() for d in dois.split(",") if d.strip()] if dois else []
    topics = [t.strip() for t in topic_list.split(",") if t.strip()] if topic_list else []

    # Parse URLs into a list
    urls_list = [u.strip() for u in urls.split(",") if u.strip()] if urls else []

    # Call main.py's run_system
    result = main.run_system(
        pdf_files=pdf_paths,
        topic_list=topics,
        doi_list=doi_list,
        urls=urls_list
    )

    # Build response for frontend
    # Synthesize paper info for Results.js
    papers = []
    for citation in result.get("citations", []):
        papers.append({
            "title": os.path.basename(citation["source"]).replace(".pdf", "") if citation["source"].endswith(".pdf") else citation["source"],
            "authors": [],  # main.py does not return authors per citation
            "topic": citation.get("topic", "Unspecified"),
            "summary": citation.get("summary", ""),
            "audio_file": os.path.basename(citation.get("audio", "")) if citation.get("audio") else None,
            "source": citation["source"],
        })

    # Add synthesis info
    synthesis = {
        "text": result.get("synthesis", ""),
        "num_papers": len(papers),
        "type": "cross-paper synthesis"
    }
    audio = {
        "podcast_file": os.path.basename(result.get("synthesis_audio", "")) if result.get("synthesis_audio") else None
    }
    statistics = {
        "total_papers": len(papers),
        "successful_summaries": len(papers),
        "successful_audio_files": sum(1 for p in papers if p["audio_file"]),
        "podcast_created": bool(audio["podcast_file"])
    }
    response = {
        "session_id": str(uuid.uuid4()),
        "papers": papers,
        "synthesis": synthesis,
        "audio": audio,
        "statistics": statistics,
        "citations": result.get("citations", [])
    }
    return JSONResponse(content=response)

@app.get("/audio/{filename}")
def get_audio(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="audio/mpeg", filename=filename)
    return JSONResponse(status_code=404, content={"detail": "File not found"}) 
