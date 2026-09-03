from dataclasses import dataclass, field


@dataclass
class CalendarProvider:
	events: list[dict] = field(default_factory=list)

	def availability(self, start: str, end: str) -> dict:
		return {"available": True, "start": start, "end": end}

	def create_event(self, data: dict) -> dict:
		event = {"id": f"event-{len(self.events) + 1}", **data}
		self.events.append(event)
		return event

	def update_event(self, event_id: str, data: dict) -> dict | None:
		for event in self.events:
			if event["id"] == event_id:
				event.update(data)
				return event
		return None

	def cancel_event(self, event_id: str) -> bool:
		before = len(self.events)
		self.events[:] = [event for event in self.events if event["id"] != event_id]
		return len(self.events) < before
