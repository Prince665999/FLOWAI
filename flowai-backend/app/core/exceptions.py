class FLOWAIError(Exception):
    """Base exception for all FLOWAI errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class PermissionDeniedError(FLOWAIError):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, status_code=403)


class RateLimitExceededError(FLOWAIError):
    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(message, status_code=429)


class PromptInjectionDetectedError(FLOWAIError):
    def __init__(self, message: str = "Potential prompt injection or malicious input detected"):
        super().__init__(message, status_code=400)


class ToolAbuseError(FLOWAIError):
    def __init__(self, message: str = "Tool invocation blocked due to security policy"):
        super().__init__(message, status_code=403)
