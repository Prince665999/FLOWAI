import redis

from app.config import settings


redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)


def check_redis() -> bool:
	try:
		return bool(redis_client.ping())
	except redis.RedisError:
		return False
