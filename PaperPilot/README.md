# PaperPilot 

<a href="https://paperpilot-1.onrender.com" target="_blank">
  <img src="https://img.shields.io/badge/CLick to vist-PaperPilot-1abc9c?style=for-the-badge&logo=rocket" alt="Visit PaperPilot">
</a>

<p>
  <a href="https://drive.google.com/file/d/12HvIsuqHeQxQc9DXt6BgidqYq1Vp1Oo0/view?usp=sharing"><img src="https://img.shields.io/badge/Demo-Watch%20Now-blue?style=for-the-badge&logo=linkedin" alt="Demo Video"/></a>
</p>

## 📸 Preview

<p align="center">
  <img src="Screenshot 1.png" width="700" alt="Mimesta UI Preview"/>
  <img src="Screenshot 2.png" width="700" alt="Mimesta UI Preview"/>
  <img src="Screenshot 3.png" width="700" alt="Mimesta UI Preview"/>
  <img src="Screenshot 4.png" width="700" alt="Mimesta UI Preview"/>
  <img src="Screenshot 5.png" width="700" alt="Mimesta UI Preview"/>
  
  <br/>
  <i>*Modern, mobile-friendly interface with live PaperPilot*</i>
</p>

## Overview
This project is a multi-agent system that processes research papers (PDFs, DOIs, or URLs), generates AI-powered summaries, and converts them into podcast-style audio. The system features a React frontend and a FastAPI backend, leveraging NLP and TTS models for summarization and audio synthesis.

---

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js & npm (for frontend)
- (Recommended) Virtual environment for Python

### Backend Setup
1. **Clone the repository** and navigate to the project root.
2. **Install Python dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
   (Make sure `transformers`, `gtts`, `PyPDF2`, `fastapi`, `uvicorn`, `bs4`, and `requests` are included.)
3. **Start the backend server:**
   ```sh
   uvicorn api:app --reload --port 8004
   ```

### Frontend Setup
1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```
2. **Install frontend dependencies:**
   ```sh
   npm install
   ```
3. **Start the React app:**
   ```sh
   npm start
   ```
4. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## System Architecture

- **Frontend:** React app for user interaction, file upload, and results display.
- **Backend:** FastAPI server for orchestrating paper processing, summarization, and audio generation.
- **NLP Model:** Uses HuggingFace Transformers for summarization.
- **TTS Model:** Uses Google Text-to-Speech (gTTS) for audio synthesis.
- **Data Flow:**
  1. User uploads PDFs/enters DOIs/URLs and topics via the frontend.
  2. Frontend sends data to `/analyze` endpoint (FastAPI).
  3. Backend extracts text, summarizes, classifies topics, and generates audio.
  4. Results (summaries, audio, citations) are returned to the frontend for display and playback.

---

## Multi-Agent Design and Coordination Approach

- **Agents:**
  - **Text Extraction Agent:** Extracts text from PDFs, DOIs, and URLs.
  - **Summarization Agent:** Generates concise summaries using a transformer model.
  - **Topic Classification Agent:** Classifies papers into user-specified topics.
  - **Audio Synthesis Agent:** Converts summaries into audio using gTTS.
  - **Synthesis Agent:** Produces a cross-paper synthesis summary and podcast.
- **Coordination:**
  - The backend orchestrates agents in sequence for each input.
  - Agents communicate via function calls and shared data structures (lists/dicts).
  - Results from each agent are aggregated and returned as a unified response.

---

## Paper Processing Methodology

1. **Input Handling:** Accepts PDFs, DOIs, URLs, and optional topic list.
2. **Text Extraction:**
   - PDFs: Extracts text using PyPDF2.
   - DOIs: Fetches metadata and abstracts via CrossRef API.
   - URLs: Scrapes main content using BeautifulSoup.
3. **Summarization:**
   - Splits text into paragraphs.
   - Uses a transformer model (DistilBART) to generate summaries for each chunk.
   - Aggregates chunk summaries into a final summary.
4. **Topic Classification:**
   - Matches summary content to user-provided topics.
5. **Audio Generation:**
   - Converts each summary and the cross-paper synthesis into MP3 audio using gTTS.
6. **Response Construction:**
   - Returns all summaries, audio file paths, and citation info to the frontend.

---

## Audio Generation Implementation

- **Library:** [gTTS (Google Text-to-Speech)](https://pypi.org/project/gTTS/)
- **Process:**
  - Receives summary text and filename.
  - Synthesizes speech and saves as MP3 in the `outputs/` directory.
  - Audio files are served to the frontend via a FastAPI endpoint.
- **Frontend:**
  - Uses HTML5 `<audio>` or a React audio player to play the generated MP3 files.

---

## Limitations and Future Improvements

### Limitations
- **PDF Extraction:** May fail on scanned/image-based PDFs (no OCR).
- **Summarization:** Quality depends on the transformer model and input text quality.
- **Audio Quality:** gTTS is cloud-based and may have rate limits or require internet access.
- **Scalability:** Not optimized for large-scale or concurrent processing.
- **Citation Extraction:** Only basic citation info is provided; no advanced citation formatting.

### Future Improvements
- **Add OCR support** for scanned PDFs (e.g., using Tesseract).
- **Support more languages and voices** for audio synthesis.
- **Improve topic classification** with more advanced NLP models.
- **Add user authentication and session management.**
- **Enable batch processing and progress tracking.**
- **Enhance citation formatting and export options.**
- **Deploy as a cloud service with persistent storage.**

---

## Contact
For questions or contributions, please open an issue or submit a pull request.
