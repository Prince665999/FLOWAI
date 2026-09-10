import pytest
from app.models.user import User
from app.services.analytics_service import analytics_service
from app.services.cost_service import cost_service
from app.services.notification_service import notification_service


def test_cost_calculation_and_recording(db_session):
    cost = cost_service.calculate_cost("gemini-1.5-flash", input_tokens=10000, output_tokens=2000)
    assert cost > 0

    record = cost_service.record_cost(
        db=db_session,
        user_id=1,
        model_name="gemini-1.5-flash",
        input_tokens=10000,
        output_tokens=2000,
    )
    assert record.id is not None
    assert record.estimated_cost_usd > 0


def test_analytics_empty_state_uses_real_zero_values(db_session):
    user = db_session.query(User).filter(User.id == 1).first()
    overview = analytics_service.get_business_overview(db_session, user)

    assert overview["hours_saved"] == 0
    assert overview["ai_cost_usd"] == 0
    assert overview["customers_processed"] == 0
    assert analytics_service.get_cost_breakdown(db_session, user) == []


def test_analytics_and_notifications(db_session):
    user = db_session.query(User).filter(User.id == 1).first()
    overview = analytics_service.get_business_overview(db_session, user)
    assert "hours_saved" in overview
    assert "ai_cost_usd" in overview

    notif = notification_service.create(
        db=db_session,
        user_id=1,
        data={"title": "Test Alert", "body": "Workflow completed", "channel": "workflow"},
    )
    assert notif.id is not None
    assert notif.is_read is False

    notification_service.mark_as_read(db_session, user_id=1, notification_id=notif.id)
    assert notif.is_read is True
