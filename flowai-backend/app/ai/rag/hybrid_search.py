from app.ai.rag.query_rewriting import rewrite_query
from app.ai.rag.reranker import rerank
def hybrid_search(query:str,documents:list[dict],limit:int=5)->list[dict]: return rerank(rewrite_query(query),documents,limit)
