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
        self.session = self.Session()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.session.close()

    def execute_query(self, query: str):
        try:
            self.session.execute(text(query))
            self.session.commit()
            logger.info("Query executed successfully")
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            self.session.rollback()

    def execute_query_return_df(self, query: str, schema: list = None):
        try:
            result = self.session.execute(text(query))
            rows = result.fetchall()
            logger.info("Query results fetched successfully")
            df = pl.DataFrame(rows, schema=schema, orient="row")
            return df
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            return None

    def update_table(self, schema_name: str, table_name: str, df: pl.DataFrame, columns_dtype: dict, new_table: bool = False):
        logger.info(f"Updating table {schema_name}.{table_name}")

        # Fail if the table doesn't exist and new_table is False
        if not new_table:
            try:
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
            except Exception as e:
                logger.error(f"Error checking if table exists: {e}")
                return

        # Update the table
        try:
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
        except Exception as e:
            logger.error(f"Error updating table: {e}")
