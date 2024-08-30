from usbls.utils import fetch_usbls_json, parse_usbls_json
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var
from sqlalchemy import Integer, Text, Float


# CUUR0000SA0: "Consumer Price Index for All Urban Consumers (CPI-U)"
# https://data.bls.gov/timeseries/CUUR0000SA0


COLUMNS_DTYPE = {
    "series_id": Text,
    "year": Integer,
    "period": Text,
    "value": Float,
    "footnotes": Text,
}


def usbls(environment: str, series_id: str, start_year: int, end_year: int, db_schema: str, table_name: str, new_table: bool = False) -> None:
    jsons = fetch_usbls_json(series_id, start_year, end_year, get_env_var(environment, "USBLS2_API_KEY"))
    df = parse_usbls_json(jsons)
    with PsqlConnector(
        dbname=get_env_var(environment, "PSQL_DB_NAME"),
        user=get_env_var(environment, "PSQL_DB_DATAFLOW_USER"),
        password=get_env_var(environment, "PSQL_DB_DATAFLOW_PASSWORD"),
        host=get_env_var(environment, "PSQL_DB_HOST"),
        port=get_env_var(environment, "PSQL_DB_PORT"),
    ) as psql_conn:
        psql_conn.update_table(db_schema, table_name, df, COLUMNS_DTYPE, new_table)
