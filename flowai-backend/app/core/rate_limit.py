from collections import defaultdict
import time
from fastapi import Request
from app.core.exceptions import RateLimitExceededError


class RateLimiter:
    def __init__(self, requests_limit: int = 120, time_window_seconds: int = 60) -> None:
        self.requests_limit = requests_limit
        self.time_window_seconds = time_window_seconds
        self.history: dict[str, list[float]] = defaultdict(list)

    def check(self, key: str) -> None:
        now = time.time()
        timestamps = self.history[key]
        # Prune old timestamps
        valid_timestamps = [t for t in timestamps if now - t < self.time_window_seconds]
        if len(valid_timestamps) >= self.requests_limit:
            raise RateLimitExceededError(
                f"Rate limit exceeded: max {self.requests_limit} requests per {self.time_window_seconds}s"
            )
        valid_timestamps.append(now)
        self.history[key] = valid_timestamps


rate_limiter = RateLimiter()


def rate_limit_dependency(request: Request) -> None:
    client_ip = request.client.host if request.client else "127.0.0.1"
    rate_limiter.check(client_ip)
