import hashlib
import json


def build_idempotency_key(job_type: str, user_id: int, payload: dict) -> str:
	canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
	digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
	return f"{job_type}:{user_id}:{digest}"
