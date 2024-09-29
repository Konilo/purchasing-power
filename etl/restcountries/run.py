from restcountries.utils import fetch_restcountries_json, parse_restcountries_json
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var
from sqlalchemy import Integer, Text


COLUMNS_DTYPE = {
    "common_name": Text,
    "official_name": Text,
    "cca2": Text,
    "status": Text,
    "currencies_code": Text,
    "currencies_name": Text,
    "currencies_symbol": Text,
    "currencies_count": Integer,
}


def restcountries(environment: str, db_schema: str, table_name: str, new_table: bool = False) -> None:
    json = fetch_restcountries_json()
    df = parse_restcountries_json(json)
    with PsqlConnector(
        dbname=get_env_var("PSQL_DB_NAME", environment),
        user=get_env_var("PSQL_DB_DATAFLOW_USER", environment),
        password=get_env_var("PSQL_DB_DATAFLOW_PASSWORD", environment),
        host=get_env_var("PSQL_DB_HOST", environment),
        port=get_env_var("PSQL_DB_PORT", environment),
    ) as psql_conn:
        psql_conn.update_table(db_schema, table_name, df, COLUMNS_DTYPE, new_table)
