import os
import sys
from typing_extensions import Annotated
from fastapi import FastAPI, Depends, Query, Path, Header, HTTPException
from datetime import datetime
import polars as pl
from fastapi.middleware.cors import CORSMiddleware

# import uvicorn  # Uncomment this for debugging

# Allow imports from the parent directory
dir_abspath = os.path.dirname(__file__)
parent_dir_abspath = os.path.dirname(dir_abspath)
sys.path.append(parent_dir_abspath)

from shared.environments_utils import load_env_from_dir
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var

# Load the .env of the current service of the monorepo
load_env_from_dir(dir_abspath)

ENVIRONMENT_NAME = get_env_var("ENVIRONMENT_NAME")


class Common:
    def __init__(self, x_api_key: Annotated[str, Header(...)]):
        self.x_api_key = x_api_key
        if self.x_api_key not in get_env_var("API_KEYS", ENVIRONMENT_NAME).split(","):
            raise HTTPException(status_code=403, detail="Invalid API Key")


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/cpis")
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


@app.get("/cpis/{cpi_id}")
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


@app.get("/cpis/{cpi_id}/correction")
async def get_cpi_correction(
    common: Annotated[Common, Depends()],
    cpi_id: Annotated[int, Path(gt=0)],
    year_a: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    year_b: Annotated[int, Query(gt=1900, le=datetime.today().year)],
    amount: Annotated[float, Query(gt=0)],
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
    inflation_rate = round((year_b_cpi_value - year_a_cpi_value) / year_a_cpi_value * 100, 2)
    final_dict = {
        "corrected_amount": corrected_amount,
        "inflation_rate": inflation_rate,
        "currency": currency,
    }
    return final_dict


# Uncomment this for debugging
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
