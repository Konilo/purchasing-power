from datetime import datetime
from typing_extensions import Annotated
from fastapi import Depends, APIRouter, Query, Path
import polars as pl

from shared.environments_utils import get_env_var
from shared.psql_connector import PsqlConnector
from backend.routers.common import Common


router = APIRouter()


@router.get("/cpis/{cpi_id}/correction")
async def get_cpi_correction(
    common: Annotated[Common, Depends()],
    cpi_id: Annotated[int, Path(gt=0)],
    year_a: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    year_b: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    amount: Annotated[float, Query(gt=0)],
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
                    AND (year = {year_a} OR year = {year_b})
            """,
        )
        currency_df = psql_conn.execute_query_return_df(
            query=f"""
                SELECT
                    countries.currency_symbol
                FROM
                    enriched.dim_cpis AS cpis
                JOIN
                    enriched.dim_countries AS countries ON countries.id = cpis.country_id
                WHERE
                    cpis.id = {cpi_id}
            """,
        )
    currency = currency_df[0, 0]
    year_a_cpi_value = cpi_values_df.filter(pl.col("year") == year_a).select(
        pl.col("value")
    )[0, 0]
    year_b_cpi_value = cpi_values_df.filter(pl.col("year") == year_b).select(
        pl.col("value")
    )[0, 0]
    corrected_amount = round(amount / year_a_cpi_value * year_b_cpi_value, 2)
    inflation_rate = round(
        (year_b_cpi_value - year_a_cpi_value) / year_a_cpi_value * 100, 2
    )
    final_dict = {
        "corrected_amount": corrected_amount,
        "inflation_rate": inflation_rate,
        "currency": currency,
    }
    return final_dict
