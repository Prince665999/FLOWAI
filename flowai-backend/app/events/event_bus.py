from collections import defaultdict
from collections.abc import Callable
from sqlalchemy.orm import Session
from app.models.domain_event import DomainEvent

class EventBus:
    def __init__(self): self._handlers: dict[str,list[Callable]] = defaultdict(list)
    def subscribe(self,event_type:str,handler:Callable)->None: self._handlers[event_type].append(handler)
    def publish(self,db:Session,*,event_type:str,aggregate_type:str,aggregate_id:str,idempotency_key:str,payload:dict)->DomainEvent:
        event=db.query(DomainEvent).filter_by(idempotency_key=idempotency_key).first()
        if event:return event
        event=DomainEvent(event_type=event_type,aggregate_type=aggregate_type,aggregate_id=str(aggregate_id),idempotency_key=idempotency_key,payload=payload)
        db.add(event); db.flush()
        for handler in self._handlers[event_type]: handler(db,event)
        return event
event_bus=EventBus()
