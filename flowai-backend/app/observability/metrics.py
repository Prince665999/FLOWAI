from collections import defaultdict
import time
from typing import Any


class MetricsRegistry:
    def __init__(self) -> None:
        self.counters: dict[str, int] = defaultdict(int)
        self.latencies: dict[str, list[float]] = defaultdict(list)

    def increment(self, metric_name: str, value: int = 1) -> None:
        self.counters[metric_name] += value

    def record_latency(self, metric_name: str, duration_seconds: float) -> None:
        self.latencies[metric_name].append(duration_seconds)
        if len(self.latencies[metric_name]) > 500:
            self.latencies[metric_name].pop(0)

    def get_summary(self) -> dict[str, Any]:
        summary = {"counters": dict(self.counters), "average_latencies_ms": {}}
        for key, vals in self.latencies.items():
            if vals:
                summary["average_latencies_ms"][key] = round((sum(vals) / len(vals)) * 1000, 2)
        return summary


metrics_registry = MetricsRegistry()
