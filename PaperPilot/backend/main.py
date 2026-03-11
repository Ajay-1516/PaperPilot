import os
from functools import lru_cache
from typing import List

import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI
from gtts import gTTS
from PyPDF2 import PdfReader
from transformers import pipeline

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@lru_cache(maxsize=1)
def get_summarizer():
    return pipeline("summarization", model="t5-small")


def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text = "\n".join(page.extract_text() for page in reader.pages if page.extract_text())
    return text


def resolve_doi(doi):
    url = f"https://api.crossref.org/works/{doi}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()["message"]
        return {
            "title": data.get("title", [""])[0],
            "authors": [a.get("family") for a in data.get("author", [])],
            "journal": data.get("container-title", [""])[0],
            "date": data.get("published-print", {}).get("date-parts", [[None]])[0][0],
            "link": data.get("URL"),
            "abstract": data.get("abstract", ""),
        }
    return {"error": "DOI not found"}


def fetch_url_text(url):
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style"]):
            tag.extract()

        meta_desc = soup.find("meta", attrs={"name": "description"})
        meta_og_desc = soup.find("meta", property="og:description")
        description = meta_desc.get("content", "") if meta_desc else (
            meta_og_desc.get("content", "") if meta_og_desc else ""
        )

        content_tags = [
            soup.find("article"),
            soup.find("main"),
            soup.find("div", class_="article-body"),
            soup.find("div", id="content"),
            soup.find("div", {"class": "abstract"}),
            soup.find("section", {"class": "Abstract"}),
        ]

        main_content = []
        for tag in content_tags:
            if tag:
                main_content.append(tag.get_text(separator="\n", strip=True))

        if not main_content and not description:
            paragraphs = soup.find_all("p")
            main_content.append(
                "\n".join(
                    p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)
                )
            )

        combined = "\n\n".join(filter(None, [description] + main_content)).strip()
        return combined or soup.get_text(separator="\n", strip=True)
    except Exception as e:
        print(f"[ERROR] Failed to fetch or parse {url}: {e}")
        return ""


def classify_topic(text: str, topics: List[str]):
    return max(topics, key=lambda t: text.lower().count(t.lower())) if topics else "Unspecified"


def generate_summary(text: str):
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 100]
    try:
        summarizer = get_summarizer()
        summaries = summarizer(paragraphs, truncation=True, max_length=200, min_length=50)
        return " ".join([s["summary_text"] for s in summaries])
    except Exception as e:
        print("[WARN] Summarization failed:", e)
        return "Summary unavailable."


def synthesize_across_papers(summaries: List[str]):
    return generate_summary(" ".join(summaries))


def generate_audio(text: str, filename: str):
    if not text or text.strip() in ["", "Summary unavailable."]:
        print(f"[AUDIO] Skipped: No valid text for {filename}")
        return None
    tts = gTTS(text=text, lang="en")
    safe_filename = "".join(c for c in filename if c.isalnum() or c in ("_", "-")).rstrip("_")[:50]
    output_path = os.path.join(OUTPUT_DIR, f"{safe_filename}.mp3")
    tts.save(output_path)
    return output_path


def run_system(pdf_files=None, topic_list=None, doi_list=None, urls=None):
    pdf_files = pdf_files or []
    topic_list = topic_list or []
    doi_list = doi_list or []
    urls = urls or []

    all_summaries = []
    citations = []

    for pdf_path in pdf_files:
        print(f"[PDF] {pdf_path}")
        text = extract_text_from_pdf(pdf_path)
        summary = generate_summary(text)
        topic = classify_topic(summary, topic_list)
        audio = generate_audio(summary, os.path.basename(pdf_path).replace(".pdf", ""))
        all_summaries.append(summary)
        citations.append({"source": pdf_path, "topic": topic, "audio": audio, "summary": summary})

    for doi in doi_list:
        print(f"[DOI] {doi}")
        meta = resolve_doi(doi)
        if "error" not in meta:
            abstract = meta.get("abstract", "").replace("<jats:p>", "").replace("</jats:p>", "")
            meta_text = f"{meta['title']} by {', '.join(meta['authors'])} in {meta['journal']}\n\n{abstract}"
            summary = generate_summary(meta_text)
            topic = classify_topic(summary, topic_list)
            audio = generate_audio(summary, doi.replace("/", "_"))
            all_summaries.append(summary)
            citations.append({"source": doi, "topic": topic, "audio": audio, "summary": summary})
        else:
            print("[ERROR] Invalid DOI.")

    for url in urls:
        print(f"[URL] {url}")
        content = fetch_url_text(url)
        if not content.strip():
            print("[WARN] Skipped empty content.")
            continue
        summary = generate_summary(content)
        topic = classify_topic(summary, topic_list)
        filename = "".join(c for c in url if c.isalnum())[:50]
        audio = generate_audio(summary, filename)
        all_summaries.append(summary)
        citations.append({"source": url, "topic": topic, "audio": audio, "summary": summary})

    final_summary = synthesize_across_papers(all_summaries) if all_summaries else ""
    final_audio = generate_audio(final_summary, "final_synthesis") if final_summary else None

    return {
        "synthesis": final_summary,
        "synthesis_audio": final_audio,
        "citations": citations,
    }


if __name__ == "__main__":
    print("Research Paper Podcast CLI")
    print("Choose input: 1=PDFs, 2=DOIs, 3=URLs, 4=Exit")
    choice = input("Enter choices (e.g., 1,2): ")
    topic_input = input("Topics (comma-separated or blank): ").strip()
    topics = [t.strip() for t in topic_input.split(",")] if topic_input else []

    pdfs, dois, input_urls = [], [], []

    if "1" in choice:
        pdfs = [p.strip() for p in input("Enter PDF paths: ").split(",")]
    if "2" in choice:
        dois = [d.strip() for d in input("Enter DOIs: ").split(",")]
    if "3" in choice:
        input_urls = [u.strip() for u in input("Enter URLs: ").split(",")]
    if "4" in choice:
        print("Exit.")
        raise SystemExit(0)

    result = run_system(pdfs, topics, dois, input_urls)
    print("\nDONE. Summary:\n")
    print(result["synthesis"] or "No synthesis.")
    if result["synthesis_audio"]:
        print(f"\nAudio: {result['synthesis_audio']}")
    print("\nCITATIONS:\n")
    for citation in result["citations"]:
        print(f"- {citation['source']}\n  Topic: {citation['topic']}\n  Audio: {citation['audio']}")


@app.get("/")
def home():
    return {"message": "Backend running successfully on Render!"}
