const BASE_URL = "http://localhost:8000";

/**
 * Upload a file to the backend for ingestion.
 * @param {File} file
 * @param {function} onProgress - callback(percent)
 * @returns {Promise<{message: string}>}
 */
export async function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/upload`);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}

/**
 * Ask the chatbot a question.
 * @param {string} query
 * @returns {Promise<{response: string}>}
 */
export async function askQuestion(query) {
  const res = await fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Ask failed: ${res.statusText}`);
  }

  return res.json();
}
