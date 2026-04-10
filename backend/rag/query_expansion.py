from groq import Groq
import os

client_llm = Groq(api_key=os.getenv("GROQ_API_KEY"))


def expand_query(query):
    response = client_llm.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Expand abbreviations only."
            },
            {
                "role": "user",
                "content": query
            }
        ],
        temperature=0
    )

    expanded = response.choices[0].message.content.strip()

    if len(expanded) > len(query) * 2:
        return query

    return expanded