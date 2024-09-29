import logging
import polars as pl
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import urllib.parse


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


class PsqlConnector:
    def __init__(self, dbname: str, user: str, password: str, host: str, port: str):
        self.dbname = dbname
        self.user = user
        self.password = urllib.parse.quote_plus(password)
        self.host = host
        self.port = port
        self.engine = create_engine(f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.dbname}")
        self.Session = sessionmaker(bind=self.engine)

    def __enter__(self):
        self.session = self.Session(autobegin=False)
        self.session.begin()  # Explicit transaction
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is None:
            # Commit the transaction if no exceptions occurred in the context block
            self.session.commit()
        else:
            # Otherwise, rollback
            logger.info("An exception occured, rolling back")
            self.session.rollback()
        self.session.close()

    def execute_query(self, query: str):
        self.session.execute(text(query))
        logger.info("Query executed successfully")

    def execute_query_from_file(self, query_file_abspath: str):
        logger.info(f"Executing query from file {query_file_abspath}")
        with open(query_file_abspath, "r") as query_file:
            query = query_file.read()
        self.execute_query(query)

    def execute_query_return_df(self, query: str, schema: list | dict | None = None):
        result = self.session.execute(text(query))
        rows = result.fetchall()
        logger.info("Query results fetched successfully")
        column_names = result.keys()
        data = [dict(zip(column_names, row)) for row in rows]
        df = pl.DataFrame(data, schema=schema)
        return df

    def update_table(self, schema_name: str, table_name: str, df: pl.DataFrame, columns_dtype: dict, new_table: bool = False):
        logger.info(f"Updating table {schema_name}.{table_name}")

        # Raise exception if the table doesn't exist AND new_table is False
        if not new_table:
            result = self.session.execute(
                text(
                    f"""
                    SELECT *
                    FROM information_schema.tables
                    WHERE
                        table_schema = '{schema_name}'
                        AND table_name = '{table_name}'
                    """
                )
            )
            if not result.fetchone():
                raise Exception(f"Table {schema_name}.{table_name} doesn't exist and new_table is False")

        # Update the table
        df.to_pandas(
            use_pyarrow_extension_array=True,
        ).to_sql(
            table_name,
            self.engine,
            schema=schema_name,
            if_exists="replace",
            index=False,
            dtype=columns_dtype,
        )
        logger.info(f"Table {schema_name}.{table_name} updated successfully")
