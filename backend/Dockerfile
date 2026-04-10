# Base image
FROM python:3.10

# Set working directory
WORKDIR /app

# Install system dependencies (VERY IMPORTANT for your project)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Upgrade pip + install CPU torch first
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir torch==2.2.2 --index-url https://download.pytorch.org/whl/cpu \
 && pip install openai-whisper \
 && pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]