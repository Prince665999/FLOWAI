import re
from app.core.exceptions import PromptInjectionDetectedError, ToolAbuseError

SUSPICIOUS_PATTERNS = [
    r"ignore (all )?previous instructions",
    r"disregard (all )?prior rules",
    r"you are now in developer mode",
    r"bypass (safety|guardrails)",
    r"system prompt reveal",
    r"exfiltrate database credentials",
    r"drop table (users|customers|workflows)",
]


class SecurityGuardrails:
    @staticmethod
    def sanitize_untrusted_input(text: str) -> str:
        if not text:
            return ""
        lowered = text.lower()
        for pattern in SUSPICIOUS_PATTERNS:
            if re.search(pattern, lowered):
                raise PromptInjectionDetectedError(
                    f"Blocked potential prompt injection pattern matching: '{pattern}'"
                )
        return text.strip()

    @staticmethod
    def wrap_with_delimiters(untrusted_content: str, tag: str = "UNTRUSTED_BUSINESS_DATA") -> str:
        safe_content = SecurityGuardrails.sanitize_untrusted_input(untrusted_content)
        return f"<{tag}>\n{safe_content}\n</{tag}>"

    @staticmethod
    def validate_tool_output(tool_name: str, output: dict) -> dict:
        if not isinstance(output, dict):
            return {"data": str(output)}
        # Scrub secret keys if leaked in output
        scrubbed = {}
        for k, v in output.items():
            if any(secret_term in k.lower() for secret_term in ["password", "jwt", "secret_key", "api_key"]):
                scrubbed[k] = "[REDACTED_SECRET]"
            else:
                scrubbed[k] = v
        return scrubbed


security_guardrails = SecurityGuardrails()
