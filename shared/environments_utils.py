import logging
import os
import dotenv


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def load_env_from_dir(dir_abspath: str):
    env_path = os.path.join(dir_abspath, ".env")
    if os.path.exists(env_path):
        logger.info(f"Loading environment variables from {env_path}")
    else:
        logger.info(f"No .env file found in {dir_abspath}")
    dotenv.load_dotenv(env_path)


def get_env_var(env_name: str, var_name: str) -> str:
    env_var_name = f"{env_name.upper()}_{var_name.upper()}"
    env_var = os.getenv(env_var_name)
    if not env_var:
        raise ValueError(f"Environment variable {env_var_name} not found")
    return env_var
