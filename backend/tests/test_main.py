from unittest.mock import patch
from fastapi.testclient import TestClient
import inspect
import polars as pl
import os
import sys

# Allow imports from the parent directories
parent_dir_abspath = os.path.dirname(os.path.dirname(__file__))
sys.path.append(parent_dir_abspath)
grandparent_dir_abspath = os.path.dirname(parent_dir_abspath)
sys.path.append(grandparent_dir_abspath)

from shared.environments_utils import load_env_from_dir
from shared.environments_utils import get_env_var
from ..main import app


# Load the .env of the current service of the monorepo
load_env_from_dir(parent_dir_abspath)

ENVIRONMENT_NAME = get_env_var("ENVIRONMENT_NAME")


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
                        "cpi_id": [1],
                        "cpi_name": ["CPI 1"],
                        "country_name": ["Country 1"],
                        "institution_name": ["Institution 1"],
                        "currency_symbol": ["$"],
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


@patch("backend.routers.get_cpis.PsqlConnector", new=MockPsqlConnector)
def test_get_cpis():
    """
    Test the get_cpis path operation.

    get_cpis() only fetches data from the DB and returns it as a JSON.
    This test checks the structure of the JSON response and the correctness of the data.
    """

    response = client.get(
        f"/cpis",
        headers={
            "x-api-key": get_env_var("API_KEYS", ENVIRONMENT_NAME).split(",")[
                0
            ],
        },
    )
    json_response = response.json()

    assert response.status_code == 200
    assert isinstance(response.json(), dict)
    expected_data = {
        "1": {"cpi_name": "CPI 1", "country_name": "Country 1"},
        "2": {"cpi_name": "CPI 2", "country_name": "Country 2"},
        "3": {"cpi_name": "CPI 3", "country_name": "Country 3"},
    }
    assert json_response == expected_data


@patch("backend.routers.get_cpi.PsqlConnector", new=MockPsqlConnector)
def test_get_cpi():
    """
    Test the get_cpis/{cpi_id} path operation.

    get_cpi() only fetches data from the DB and returns it as a JSON.
    This test checks the structure of the JSON response and the correctness of the data.
    """

    cpi_id = 1
    response = client.get(
        f"/cpis/{cpi_id}",
        headers={
            "x-api-key": get_env_var("API_KEYS", ENVIRONMENT_NAME).split(",")[
                0
            ],
        },
    )
    json_response = response.json()

    assert response.status_code == 200
    assert json_response == {
        "cpi_id": 1,
        "cpi_name": "CPI 1",
        "country_name": "Country 1",
        "institution_name": "Institution 1",
        "currency_symbol": "$",
        "documentation_link": "http://example.com",
        "legal_mentions": "Legal mentions",
        "cpi_values": {"2020": 100.0, "2021": 110.0},
        "annual_inflation_rates": {"2021": 10.0},
    }


@patch(
    "backend.routers.get_cpi_correction.PsqlConnector", new=MockPsqlConnector
)
def test_get_cpi_correction():
    """
    Test the logic of the get_cpis/{cpi_id}/correction path operation.

    get_cpi_correction() fetches data from the DB, performs a calculation and returns it as a JSON.
    This test checks the JSON's structure and the correctness of the calculation.
    """

    cpi_id = 1
    year_a = 2020
    year_b = 2021
    amount = 100.0

    response = client.get(
        f"/cpis/{cpi_id}/correction?year_a={year_a}&year_b={year_b}&amount={amount}",
        headers={
            "x-api-key": get_env_var("API_KEYS", ENVIRONMENT_NAME).split(",")[
                0
            ],
        },
    )
    json_response = response.json()

    assert response.status_code == 200
    assert json_response == {
        "corrected_amount": 110.0,
        "inflation_rate": 10.0,
        "currency": "USD",
    }


def test_project_personal_finances():
    initial_amount_invested = 0
    recurring_investment_frequency = "monthly"
    recurring_investment_amount = 1000
    investment_duration_yrs = 26
    annual_gross_yield = 8
    annual_inflation_rate = 2
    investment_buy_in_fee_pct = 0.35
    annual_custody_fee_pct = 0.2
    investment_sell_out_fee_pct = 0.5
    tax_on_gains_pct = 17.2

    response = client.get(
        f"/project_personal_finances?initial_amount_invested={initial_amount_invested}&recurring_investment_frequency={recurring_investment_frequency}&recurring_investment_amount={recurring_investment_amount}&investment_duration_yrs={investment_duration_yrs}&annual_gross_yield={annual_gross_yield}&annual_inflation_rate={annual_inflation_rate}&investment_buy_in_fee_pct={investment_buy_in_fee_pct}&annual_custody_fee_pct={annual_custody_fee_pct}&investment_sell_out_fee_pct={investment_sell_out_fee_pct}&tax_on_gains_pct={tax_on_gains_pct}",
        headers={
            "x-api-key": get_env_var("API_KEYS", ENVIRONMENT_NAME).split(",")[
                0
            ],
        },
    )

    json_response = response.json()
    assert response.status_code == 200

    expected_response = {
        "summary": {
            "total_spending": 312000,
            "net_post_tax_final_value": 874703.49,
            "net_post_tax_inflation_corrected_final_value": 522704.68,
            "net_post_tax_final_gain": 562703.49,
            "net_post_tax_inflation_corrected_final_gain": 336259.95,
            "total_inflation_pct": 67.34,
            "net_post_tax_yield": 180.35,
            "net_post_tax_inflation_corrected_yield": 107.78,
        },
        "details": {
            "initial_amount_invested": 0,
            "recurring_investment_frequency": "monthly",
            "recurring_investment_amount": 1000,
            "total_spending": 312000,
            "buy_in_fees": 1092.0,
            "annual_gross_yield": 8.0,
            "total_custodian_fees": 24.93,
            "sell_out_fees": 4983.01,
            "inflation_corrected_sell_out_fees": 2977.74,
            "net_pre_tax_final_value": 991594.08,
            "net_pre_tax_inflation_corrected_final_value": 592556.08,
            "net_pre_tax_final_gain": 679594.08,
            "net_pre_tax_inflation_corrected_final_gain": 406111.35,
            "tax_on_gains": 116890.59,
            "inflation_corrected_tax_on_gains": 69851.4,
            "net_post_tax_final_gain": 562703.49,
            "net_post_tax_inflation_corrected_final_gain": 336259.95,
            "inflation_corrected_total_spending": 186444.74,
            "net_post_tax_final_value": 874703.49,
            "net_post_tax_inflation_corrected_final_value": 522704.68,
        },
    }

    assert json_response == expected_response
