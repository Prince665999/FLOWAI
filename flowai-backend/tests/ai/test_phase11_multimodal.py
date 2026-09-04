import pytest
from app.ai.vision import vision_service
from app.ai.speech_to_text import speech_to_text_service
from app.ai.text_to_speech import text_to_speech_service
from app.workflow_engine.nodes.trigger_node import TriggerNode


@pytest.mark.asyncio
async def test_vision_and_ocr_services():
    res = await vision_service.analyze_image("sample_base64_invoice", prompt="Extract invoice amount")
    assert "analysis" in res
    assert res.get("image_size_bytes") is not None

    ocr_text = await vision_service.extract_text_ocr("sample_scanned_receipt_image")
    assert isinstance(ocr_text, str)
    assert len(ocr_text) > 0


@pytest.mark.asyncio
async def test_speech_to_text_and_tts():
    stt_res = await speech_to_text_service.transcribe(b"fake_audio_bytes")
    assert "text" in stt_res
    assert len(stt_res["text"]) > 0

    tts_res = await text_to_speech_service.synthesize("Report processed successfully.")
    assert tts_res["status"] == "ready"
    assert "audio_base64" in tts_res


@pytest.mark.asyncio
async def test_multimodal_trigger_node():
    node = TriggerNode()
    result = await node.execute(
        config={"event": "inbound_image"},
        data={"image_base64": "fake_img_bytes", "file_type": "image"},
        context=None,
    )
    assert result.output["multimodal_type"] == "image_scan"
    assert "extracted_text" in result.output
