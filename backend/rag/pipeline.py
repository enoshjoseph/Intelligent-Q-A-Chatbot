from .retriever import hybrid_retrieve, retrieve
from .generator import generate_answer
from .query_expansion import expand_query


def aske(query):
    query = expand_query(query)

    title_keywords = ["title", "name of this", "what is this document", "document called"]
    is_title_query = any(kw in query.lower() for kw in title_keywords)

    if is_title_query:
        retrieved = retrieve(query, k=3)
    else:
        retrieved = hybrid_retrieve(query, k=5)

    return generate_answer(query, retrieved)