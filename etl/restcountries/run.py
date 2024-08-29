from restcountries.utils import fetch_restcountries_json, parse_restcountries_json
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var


def restcountries(environment: str, db_schema: str, table_name: str, new_table: bool = False):
    json = fetch_restcountries_json()
    df = parse_restcountries_json(json)
    with PsqlConnector(
        dbname=get_env_var(environment, "PSQL_DB_NAME"),
        user=get_env_var(environment, "PSQL_DB_DATAFLOW_USER"),
        password=get_env_var(environment, "PSQL_DB_DATAFLOW_PASSWORD"),
        host=get_env_var(environment, "PSQL_DB_HOST"),
        port=get_env_var(environment, "PSQL_DB_PORT"),
    ) as psql_conn:
        psql_conn.update_table(db_schema, table_name, df, new_table=new_table)
