import os
import sys
from typing_extensions import Annotated
from fastapi import Depends, APIRouter

from shared.environments_utils import load_env_from_dir, get_env_var
from shared.psql_connector import PsqlConnector
from .common import Common

# Load the .env of the current service of the monorepo
parent_dir_abspath = os.path.dirname(os.path.dirname(__file__))
load_env_from_dir(parent_dir_abspath)

ENVIRONMENT_NAME = get_env_var("ENVIRONMENT_NAME")


router = APIRouter()


@router.get("/cpis")
async def get_cpis(
    common: Annotated[Common, Depends()],
) -> dict:
    with PsqlConnector(
        dbname=get_env_var("PSQL_DB_NAME", ENVIRONMENT_NAME),
        user=get_env_var("PSQL_DB_READ_ONLY_USER", ENVIRONMENT_NAME),
        password=get_env_var("PSQL_DB_READ_ONLY_PASSWORD", ENVIRONMENT_NAME),
        host=get_env_var("PSQL_DB_HOST", ENVIRONMENT_NAME),
        port=get_env_var("PSQL_DB_PORT", ENVIRONMENT_NAME),
    ) as psql_conn:
        df = psql_conn.execute_query_return_df(
            query="""
                SELECT
                    cpis.id AS cpi_id,
                    cpis.name AS cpi_name,
                    countries.name AS country_name
                FROM
                    enriched.dim_cpis AS cpis
                JOIN
                    enriched.dim_countries AS countries ON countries.id = cpis.country_id
            """,
        )
    cpis_dict = {}
    for row in df.iter_rows(named=True):
        cpis_dict.update(
            {
                row["cpi_id"]: {
                    "cpi_name": row["cpi_name"],
                    "country_name": row["country_name"],
                }
            }
        )
    return cpis_dict
