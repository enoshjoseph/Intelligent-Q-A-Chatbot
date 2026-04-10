import pickle
import os
import chromadb

# 🔥 Lazy load model
model = None

def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model


# 🔥 Chroma DB — lazy loaded to avoid locking the file at startup
client = None
collection = None


def get_collection():
    """Return the Chroma collection, opening the client only when needed."""
    global client, collection
    if client is None:
        client = chromadb.PersistentClient(path="./vector_store")
        collection = client.get_or_create_collection("pdf_chunks")
    return collection


def reset_chroma_client():
    """Release the Chroma client so the vector_store directory can be deleted."""
    global client, collection
    client = None
    collection = None


# 🔥 BM25
bm25 = None
chunked = None

def load_bm25():
    global bm25, chunked

    if not os.path.exists("db/bm25.pkl") or not os.path.exists("db/chunks.pkl"):
        return None, None

    with open("db/bm25.pkl", "rb") as f:
        bm25 = pickle.load(f)

    with open("db/chunks.pkl", "rb") as f:
        chunked = pickle.load(f)

    return bm25, chunked


# 🔍 KEYWORD SEARCH
def keyword_search(query, k=5):
    bm25, chunked = load_bm25()

    if bm25 is None:
        return []

    tokenized_query = query.split()
    scores = bm25.get_scores(tokenized_query)

    ranked = sorted(
        list(zip(chunked, scores)),
        key=lambda x: x[1],
        reverse=True
    )

    return [(chunk["text"], score, chunk) for chunk, score in ranked[:k]]


# 🔍 VECTOR SEARCH
def retrieve(query, k=5):
    model = get_model()
    col = get_collection()

    q_emb = model.encode(query, normalize_embeddings=True).tolist()

    results = col.query(
        query_embeddings=[q_emb],
        n_results=k,
        include=["documents", "metadatas", "distances"]
    )

    docs = results["documents"][0]
    distances = results["distances"][0]
    metas = results["metadatas"][0]

    return list(zip(docs, distances, metas))


# 🔥 HYBRID SEARCH
def hybrid_retrieve(query, k=5):
    query = query.lower()
    vector_results = retrieve(query, k * 3)
    keyword_results = keyword_search(query, k * 3)

    # fallback if BM25 missing
    if not keyword_results:
        return vector_results[:k]

    max_v = max([d for _, d, _ in vector_results]) if vector_results else 1
    if max_v == 0:
        max_v = 1

    max_k = max([s for _, s, _ in keyword_results]) if keyword_results else 1

    merged = []

    for doc, dist, meta in vector_results:
        v_score = 1 - (dist / max_v)
        merged.append((doc, v_score, meta))

    for doc, score, meta in keyword_results:
        k_score = score / max_k
        merged.append((doc, k_score, meta))

    merged.sort(key=lambda x: x[1], reverse=True)

    return merged[:k]