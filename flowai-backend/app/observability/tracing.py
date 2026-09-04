import time
import uuid
from contextlib import contextmanager
from typing import Any, Generator

from app.observability.metrics import metrics_registry


class Span:
    def __init__(self, name: str, trace_id: str | None = None) -> None:
        self.name = name
        self.trace_id = trace_id or str(uuid.uuid4())
        self.span_id = str(uuid.uuid4())[:8]
        self.start_time = 0.0
        self.end_time = 0.0
        self.duration_seconds = 0.0
        self.metadata: dict[str, Any] = {}

    def set_tag(self, key: str, value: Any) -> None:
        self.metadata[key] = value


@contextmanager
def trace_span(name: str, trace_id: str | None = None) -> Generator[Span, None, None]:
    span = Span(name=name, trace_id=trace_id)
    span.start_time = time.time()
    try:
        yield span
    finally:
        span.end_time = time.time()
        span.duration_seconds = span.end_time - span.start_time
        metrics_registry.record_latency(f"span.{name}", span.duration_seconds)
