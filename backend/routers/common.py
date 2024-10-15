import os
import sys
from fastapi import Header, HTTPException
from typing_extensions import Annotated

from shared.environments_utils import load_env_from_dir, get_env_var

# Load the .env of the current service of the monorepo
parent_dir_abspath = os.path.dirname(os.path.dirname(__file__))
load_env_from_dir(parent_dir_abspath)

ENVIRONMENT_NAME = get_env_var("ENVIRONMENT_NAME")


class Common:
    def __init__(self, x_api_key: Annotated[str, Header(...)]):
        self.x_api_key = x_api_key
        if self.x_api_key not in get_env_var(
            "API_KEYS", ENVIRONMENT_NAME
        ).split(","):
            raise HTTPException(status_code=403, detail="Invalid API Key")
