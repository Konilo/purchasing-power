from fastapi import Header, HTTPException
from typing_extensions import Annotated

from shared.environments_utils import get_env_var


class Common:
    def __init__(self, x_api_key: Annotated[str, Header(...)]):
        self.x_api_key = x_api_key
        if self.x_api_key not in get_env_var(
            "API_KEYS", get_env_var("ENVIRONMENT_NAME")
        ).split(","):
            raise HTTPException(status_code=403, detail="Invalid API Key")
