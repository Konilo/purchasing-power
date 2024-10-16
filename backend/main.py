import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import uvicorn  # Uncomment this for debugging

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.environments_utils import load_env_from_dir, get_env_var

# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)

from .routers import (
    get_cpis,
    get_cpi,
    get_cpi_correction,
    project_personal_finances,
)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=get_env_var(
        "ALLOW_ORIGINS", get_env_var("ENVIRONMENT_NAME")
    ).split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(get_cpis.router)
app.include_router(get_cpi.router)
app.include_router(get_cpi_correction.router)
app.include_router(project_personal_finances.router)


# Uncomment this for debugging
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
