def template() -> dict:
 return {"name":"Low stock alert","definition":{"nodes":[{"id":"trigger","type":"trigger","config":{}},{"id":"notify","type":"notification","config":{"message":"Inventory is at or below reorder level"}}],"edges":[{"source":"trigger","target":"notify"}]}}
