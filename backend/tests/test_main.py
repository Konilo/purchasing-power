from unittest.mock import patch
from fastapi.testclient import TestClient
import inspect
import polars as pl
import os
import sys

# Allow imports from the parent directory
parent_dir_abspath = os.path.dirname(os.path.dirname(__file__))
sys.path.append(parent_dir_abspath)

from main import app


client = TestClient(app)


class MockPsqlConnector:
    """
    Mocked PsqlConnector class used for testing to control the DB query results returned to each path operation function.
    """

    def __init__(self, *args, **kwargs):
        pass

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def execute_query_return_df(self, query: str):
        caller_function = inspect.stack()[1].function

        if caller_function == "get_cpi_correction":
            if "fact_cpi_values" in query:
                return pl.DataFrame(
                    {
                        "year": [2020, 2021],
                        "value": [100.0, 110.0],
                    }
                )
            elif "dim_countries" in query:
                return pl.DataFrame(
                    {
                        "currency_symbol": ["USD"],
                    }
                )
        elif caller_function == "get_cpis":
            if "cpis.id AS cpi_id," in query:
                return pl.DataFrame(
                    {
                        "cpi_id": [1, 2, 3],
                        "cpi_name": ["CPI 1", "CPI 2", "CPI 3"],
                        "country_name": ["Country 1", "Country 2", "Country 3"],
                    }
                )
        elif caller_function == "get_cpi":
            if "dim_cpis" in query:
                return pl.DataFrame(
                    {
                        "institution_name": ["Institution 1"],
                        "currency_symbol": ["USD"],
                        "documentation_link": ["http://example.com"],
                        "legal_mentions": ["Legal mentions"],
                    }
                )
            elif "fact_cpi_values" in query:
                return pl.DataFrame(
                    {
                        "year": [2020, 2021],
                        "value": [100.0, 110.0],
                    }
                )
        return pl.DataFrame()


@patch("main.PsqlConnector", new=MockPsqlConnector)
def test_get_cpis():
    """
    Test the get_cpis path operation.

    get_cpis() only fetches data from the DB and returns it as a JSON.
    This test checks the structure of the JSON response and the correctness of the data.
    """

    response = client.get(f"/cpis?environment_name=local")
    json_response = response.json()

    assert response.status_code == 200
    assert isinstance(response.json(), dict)
    expected_data = {
        "1": {"cpi_name": "CPI 1", "country_name": "Country 1"},
        "2": {"cpi_name": "CPI 2", "country_name": "Country 2"},
        "3": {"cpi_name": "CPI 3", "country_name": "Country 3"},
    }
    assert json_response == expected_data


@patch("main.PsqlConnector", new=MockPsqlConnector)
def test_get_cpi():
    """
    Test the get_cpis/{cpi_id} path operation.

    get_cpi() only fetches data from the DB and returns it as a JSON.
    This test checks the structure of the JSON response and the correctness of the data.
    """

    cpi_id = 1
    response = client.get(f"/cpis/{cpi_id}?environment_name=local")
    json_response = response.json()

    assert response.status_code == 200
    assert json_response == {
        "institution_name": "Institution 1",
        "currency_symbol": "USD",
        "documentation_link": "http://example.com",
        "legal_mentions": "Legal mentions",
        "values": {"2020": 100.0, "2021": 110.0},
    }


@patch("main.PsqlConnector", new=MockPsqlConnector)
def test_get_cpi_correction_calculation():
    """
    Test the logic of the get_cpis/{cpi_id}/correction path operation.

    get_cpi_correction() fetches data from the DB, performs a calculation and returns it as a JSON.
    This test checks the JSON's structure and the correctness of the calculation.
    """

    cpi_id = 1
    year_a = 2020
    year_b = 2021
    amount = 100.0

    response = client.get(f"/cpis/{cpi_id}/correction?year_a={year_a}&year_b={year_b}&amount={amount}&environment_name=local")
    json_response = response.json()

    assert response.status_code == 200
    assert json_response == {"corrected_amount": 110.0, "currency": "USD"}
