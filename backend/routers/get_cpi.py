import os
import sys
from typing_extensions import Annotated
from fastapi import Depends, APIRouter, Path

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.environments_utils import load_env_from_dir
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var
from .common import Common

# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)

ENVIRONMENT_NAME = get_env_var("ENVIRONMENT_NAME")


router = APIRouter()


@router.get("/cpis/{cpi_id}")
async def get_cpi(
    common: Annotated[Common, Depends()],
    cpi_id: Annotated[int, Path(gt=0)],
) -> dict:
    with PsqlConnector(
        dbname=get_env_var("PSQL_DB_NAME", ENVIRONMENT_NAME),
        user=get_env_var("PSQL_DB_READ_ONLY_USER", ENVIRONMENT_NAME),
        password=get_env_var("PSQL_DB_READ_ONLY_PASSWORD", ENVIRONMENT_NAME),
        host=get_env_var("PSQL_DB_HOST", ENVIRONMENT_NAME),
        port=get_env_var("PSQL_DB_PORT", ENVIRONMENT_NAME),
    ) as psql_conn:
        cpi_values_df = psql_conn.execute_query_return_df(
            query=f"""
                SELECT
                    year,
                    value
                FROM
                    enriched.fact_cpi_values
                WHERE
                    cpi_id = {cpi_id}
            """,
        )
        cpi_df = psql_conn.execute_query_return_df(
            query=f"""
                SELECT
                    cpis.id as cpi_id,
                    cpis.name AS cpi_name,
                    countries.name AS country_name,
                    cpis.institution_name,
                    countries.currency_symbol,
                    cpis.documentation_link,
                    cpis.legal_mentions
                FROM
                    enriched.dim_cpis AS cpis
                JOIN
                    enriched.dim_countries AS countries ON countries.id = cpis.country_id
                WHERE
                    cpis.id = {cpi_id}
            """,
        )

    values_dict = {}
    for row in cpi_values_df.iter_rows(named=True):
        values_dict.update(
            {
                row["year"]: row["value"],
            }
        )
    final_dict = {
        "cpi_id": cpi_df[0, "cpi_id"],
        "cpi_name": cpi_df[0, "cpi_name"],
        "country_name": cpi_df[0, "country_name"],
        "institution_name": cpi_df[0, "institution_name"],
        "currency_symbol": cpi_df[0, "currency_symbol"],
        "documentation_link": cpi_df[0, "documentation_link"],
        "legal_mentions": cpi_df[0, "legal_mentions"],
        "values": values_dict,
    }
    return final_dict
