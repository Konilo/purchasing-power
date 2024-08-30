from eurostat.utils import fetch_eurostat_xml, parse_eurostat_xml
from shared.psql_connector import PsqlConnector
from shared.environments_utils import get_env_var
from sqlalchemy import Integer, Text, Float


# PRC: price
# HICP: Harmonized Index of Consumer Prices
# AIND: annual indices
# +: latest version
# coicop: classification of individual consumption by purpose
# CP00: "All-items (or total)"
# unit: INX_A_AVG = annual average index; RCH_A_AVG = annual average rate of change
# https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm#stat_process1724055079363


COLUMNS_DTYPE = {
    "coicop": Text,
    "freq": Text,
    "geo": Text,
    "unit": Text,
    "time_period": Integer,
    "obs_value": Float,
}


def eurostat(environment: str, db_schema: str, table_name: str, new_table: bool = False) -> None:
    xml = fetch_eurostat_xml()
    df = parse_eurostat_xml(xml)
    with PsqlConnector(
        dbname=get_env_var(environment, "PSQL_DB_NAME"),
        user=get_env_var(environment, "PSQL_DB_DATAFLOW_USER"),
        password=get_env_var(environment, "PSQL_DB_DATAFLOW_PASSWORD"),
        host=get_env_var(environment, "PSQL_DB_HOST"),
        port=get_env_var(environment, "PSQL_DB_PORT"),
    ) as psql_conn:
        psql_conn.update_table(db_schema, table_name, df, COLUMNS_DTYPE, new_table)
