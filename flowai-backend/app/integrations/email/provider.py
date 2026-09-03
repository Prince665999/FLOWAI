from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class EmailProvider:
	messages: list[dict] = field(default_factory=list)

	def read(self, limit: int = 20) -> list[dict]:
		return self.messages[-limit:]

	def draft(self, to: str, subject: str, body: str) -> dict:
		message = {"id": f"draft-{len(self.messages) + 1}", "to": to, "subject": subject, "body": body, "status": "draft"}
		self.messages.append(message)
		return message

	def send(self, to: str, subject: str, body: str) -> dict:
		message = {"id": f"email-{len(self.messages) + 1}", "to": to, "subject": subject, "body": body, "status": "sent", "sent_at": datetime.now(timezone.utc).isoformat()}
		self.messages.append(message)
		return message

	def search(self, query: str) -> list[dict]:
		lowered = query.lower()
		return [message for message in self.messages if lowered in str(message).lower()]
