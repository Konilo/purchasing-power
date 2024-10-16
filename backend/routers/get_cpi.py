from typing_extensions import Annotated
from fastapi import Depends, APIRouter, Path

from shared.environments_utils import get_env_var
from shared.psql_connector import PsqlConnector
from backend.routers.common import Common


router = APIRouter()


@router.get("/cpis/{cpi_id}")
async def get_cpi(
    common: Annotated[Common, Depends()],
    cpi_id: Annotated[int, Path(gt=0)],
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

    cpi_values_dict = {}
    for row in cpi_values_df.iter_rows(named=True):
        cpi_values_dict.update(
            {
                row["year"]: row["value"],
            }
        )

    annual_inflation_rates_dict = {}
    for year, value in cpi_values_dict.items():
        if year - 1 in cpi_values_dict:
            annual_inflation_rates_dict.update(
                {
                    year: round(
                        (value - cpi_values_dict[year - 1])
                        / cpi_values_dict[year - 1]
                        * 100,
                        2,
                    ),
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
        "cpi_values": cpi_values_dict,
        "annual_inflation_rates": annual_inflation_rates_dict,
    }
    return final_dict
