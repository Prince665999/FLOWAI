from typing import Any
from app.ai.vision import vision_service
from app.ai.speech_to_text import speech_to_text_service
from app.workflow_engine.nodes.base import NodeResult, WorkflowNodeHandler


class TriggerNode(WorkflowNodeHandler):
    async def execute(self, config: dict[str, Any], data: dict[str, Any], context: Any) -> NodeResult:
        event_type = config.get("event", "manual")
        result_data = dict(data)

        # Multimodal handling: Image / Scanned document trigger
        if "image_base64" in data or "image_url" in data or data.get("file_type") in ("image", "pdf_scan"):
            image_payload = data.get("image_base64") or data.get("image_url") or ""
            ocr_text = await vision_service.extract_text_ocr(image_payload)
            result_data["extracted_text"] = ocr_text
            result_data["multimodal_type"] = "image_scan"

        # Multimodal handling: Audio / Voice trigger
        if "audio_base64" in data or data.get("file_type") == "audio":
            audio_payload = data.get("audio_base64", "")
            transcript_res = await speech_to_text_service.transcribe(audio_payload)
            result_data["transcription"] = transcript_res.get("text", "")
            result_data["multimodal_type"] = "voice_audio"

        return NodeResult({"trigger": event_type, "data": result_data, **result_data})
