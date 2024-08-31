import os
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var


def pure_sql(environment: str, query_file_names: str) -> None:
    with PsqlConnector(
        dbname=get_env_var(environment, "PSQL_DB_NAME"),
        user=get_env_var(environment, "PSQL_DB_DATAFLOW_USER"),
        password=get_env_var(environment, "PSQL_DB_DATAFLOW_PASSWORD"),
        host=get_env_var(environment, "PSQL_DB_HOST"),
        port=get_env_var(environment, "PSQL_DB_PORT"),
    ) as psql_conn:
        query_file_names_list = [name.strip() for name in query_file_names.split(",")]
        for query_file_name in query_file_names_list:
            query_file_abspath = os.path.join(os.path.dirname(__file__), "queries", query_file_name)
            psql_conn.execute_query_from_file(query_file_abspath)
