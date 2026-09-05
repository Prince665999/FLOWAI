def rerank(query:str,documents:list[dict],limit:int=5)->list[dict]:
    terms=set(query.lower().split())
    return sorted(documents,key=lambda item:len(terms & set(str(item).lower().split())),reverse=True)[:limit]
