import hashlib
import hmac


class WebhookVerifier:
    @staticmethod
    def verify_signature(
        payload_bytes: bytes,
        signature: str,
        secret: str,
        header_prefix: str = "sha256=",
    ) -> bool:
        if not secret:
            from app.config import settings

            if settings.ENVIRONMENT == "production":
                return False
            return True
        if not signature:
            return False

        expected_sig = hmac.new(
            secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256,
        ).hexdigest()

        cleaned_signature = signature.replace(header_prefix, "").strip()
        return hmac.compare_digest(expected_sig, cleaned_signature)


webhook_verifier = WebhookVerifier()
