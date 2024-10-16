from typing_extensions import Annotated
from fastapi import Depends, APIRouter

from shared.environments_utils import get_env_var
from shared.psql_connector import PsqlConnector
from .common import Common


router = APIRouter()


@router.get("/cpis")
async def get_cpis(
    common: Annotated[Common, Depends()],
) -> dict:
    with PsqlConnector(
        dbname=get_env_var("PSQL_DB_NAME", get_env_var("ENVIRONMENT_NAME")),
        user=get_env_var(
            "PSQL_DB_READ_ONLY_USER", get_env_var("ENVIRONMENT_NAME")
        ),
        password=get_env_var(
            "PSQL_DB_READ_ONLY_PASSWORD", get_env_var("ENVIRONMENT_NAME")
        ),
        host=get_env_var("PSQL_DB_HOST", get_env_var("ENVIRONMENT_NAME")),
        port=get_env_var("PSQL_DB_PORT", get_env_var("ENVIRONMENT_NAME")),
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
