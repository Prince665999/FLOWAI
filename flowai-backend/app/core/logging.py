import logging

logger = logging.getLogger("flowai")


def get_logger(name: str = "flowai") -> logging.Logger:
    return logging.getLogger(name)
