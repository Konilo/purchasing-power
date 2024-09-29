import logging
import os
import dotenv
from enum import Enum


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class Environments(str, Enum):
    local = "local"
    production = "production"


def load_env_from_dir(dir_abspath: str) -> None:
    env_path = os.path.join(dir_abspath, ".env")
    if os.path.exists(env_path):
        logger.info(f"Loading environment variables from {env_path}")
    else:
        logger.info(f"No .env file found in {dir_abspath}")
    dotenv.load_dotenv(env_path)


def get_env_var(var_name: str, env_name: str = "") -> str:
    if env_name != "":
        if env_name not in Environments.__members__:
            raise ValueError(f"Invalid environment name: {env_name}")
        env_var_name = f"{var_name.upper()}_{env_name.upper()}"
    else:
        env_var_name = var_name.upper()
    env_var = os.getenv(env_var_name)
    if not env_var:
        raise ValueError(f"Environment variable {env_var_name} not found")
    return env_var
