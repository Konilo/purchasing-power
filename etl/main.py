import typer
import os
import sys

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.cli_utils import load_and_register_commands
from shared.environments_utils import load_env_from_dir


app = typer.Typer()
load_and_register_commands(app, dir_abspath)

# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)

if __name__ == "__main__":
    app()
