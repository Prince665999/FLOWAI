import logging
import smtplib
from email.message import EmailMessage

from app.config import settings
from app.integrations.email.provider import EmailProvider

logger = logging.getLogger("flowai.email")


class SmtpEmailProvider(EmailProvider):
    def send(self, to: str, subject: str, body: str) -> dict:
        if not settings.SMTP_HOST:
            logger.info("email[dev] to=%s subject=%s", to, subject)
            return super().send(to, subject, body)
        message = EmailMessage()
        message["From"] = settings.SMTP_FROM
        message["To"] = to
        message["Subject"] = subject
        message.set_content(body)
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            if settings.SMTP_STARTTLS:
                smtp.starttls()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            smtp.send_message(message)
        return super().send(to, subject, body)


smtp_email_provider = SmtpEmailProvider()
