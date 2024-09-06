import os
import sys
from typing_extensions import Annotated
from fastapi import FastAPI, Depends, Query, Path
from datetime import datetime
import polars as pl

# import uvicorn  # Uncomment this for debugging

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.environments_utils import load_env_from_dir
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var


# Load the .env in the current subdirectory of the monorepo
load_env_from_dir(dir_abspath)


class CommonQueryParams:
    def __init__(self, environment_name: Annotated[str, Query(...)]):
        self.environment_name = environment_name


app = FastAPI()


@app.get("/cpis")
async def get_cpis(
    common: Annotated[CommonQueryParams, Depends()],
) -> dict:
    with PsqlConnector(
        dbname=get_env_var(common.environment_name, "PSQL_DB_NAME"),
        user=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_USER"),
        password=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_PASSWORD"),
        host=get_env_var(common.environment_name, "PSQL_DB_HOST"),
        port=get_env_var(common.environment_name, "PSQL_DB_PORT"),
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


@app.get("/cpis/{cpi_id}")
async def get_cpi(
    cpi_id: Annotated[int, Path(gt=0)],
    common: Annotated[CommonQueryParams, Depends()],
):
    with PsqlConnector(
        dbname=get_env_var(common.environment_name, "PSQL_DB_NAME"),
        user=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_USER"),
        password=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_PASSWORD"),
        host=get_env_var(common.environment_name, "PSQL_DB_HOST"),
        port=get_env_var(common.environment_name, "PSQL_DB_PORT"),
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
        "institution_name": cpi_df[0, "institution_name"],
        "currency_symbol": cpi_df[0, "currency_symbol"],
        "documentation_link": cpi_df[0, "documentation_link"],
        "legal_mentions": cpi_df[0, "legal_mentions"],
        "values": values_dict,
    }
    return final_dict


@app.get("/cpis/{cpi_id}/correction")
async def get_cpi_correction(
    cpi_id: Annotated[int, Path(gt=0)],
    year_a: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    year_b: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    amount: Annotated[float, Query(gt=0)],
    common: Annotated[CommonQueryParams, Depends()],
) -> dict:
    with PsqlConnector(
        dbname=get_env_var(common.environment_name, "PSQL_DB_NAME"),
        user=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_USER"),
        password=get_env_var(common.environment_name, "PSQL_DB_READ_ONLY_PASSWORD"),
        host=get_env_var(common.environment_name, "PSQL_DB_HOST"),
        port=get_env_var(common.environment_name, "PSQL_DB_PORT"),
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
    year_a_cpi_value = cpi_values_df.filter(pl.col("year") == year_a).select(pl.col("value"))[0, 0]
    year_b_cpi_value = cpi_values_df.filter(pl.col("year") == year_b).select(pl.col("value"))[0, 0]
    corrected_amount = round(amount / year_a_cpi_value * year_b_cpi_value, 2)
    final_dict = {
        "corrected_amount": corrected_amount,
        "currency": currency,
    }
    return final_dict


# Uncomment this for debugging
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
