from groq import Groq
import os

client_llm = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_answer(query, retrieved_chunks):
    context = "\n\n".join([doc for doc, _, _ in retrieved_chunks])

    prompt = f"""You are a helpful assistant answering questions based on a document.

    Instructions:
    - Use ONLY the provided context.
    - If the answer is partially available, provide the best possible answer.
    - Do NOT say "not provided" unless absolutely no relevant information exists.
    - Be concise and clear.
    - If listing items, use bullet points.

Context:
{context}

Question:
{query}

Answer:"""

    response = client_llm.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Answer based on the context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    return response.choices[0].message.content