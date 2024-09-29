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


@app.callback()
def dummy_to_force_subcommand() -> None:
    """
    This function exists because Typer won't let you force a single subcommand.
    Since we know we will add other subcommands in the future and don't want to
    break the interface, we have to use this workaround.

    Delete this when a second subcommand is added.

    https://github.com/fastapi/typer/issues/315#issuecomment-1142593959
    """
    pass


# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)

if __name__ == "__main__":
    app()
