import logging
import json
import requests as req
import polars as pl


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

SEPARATOR = ", "


def fetch_restcountries_json():
    logger.info(f"Fetching REST Countries JSON data")

    url = "https://restcountries.com/v3.1/all"
    response = req.get(url)

    if response.status_code != 200:
        raise Exception(f"Request failed with status code {response.status_code}")

    json_ = json.loads(response.text)

    logger.info("Fetching REST Countries JSON data complete")
    return json_


def parse_restcountries_json(json: dict):
    logger.info("Parsing REST Countries JSON data")

    data = []
    for object in json:
        common_name = object["name"]["common"]
        official_name = object["name"]["official"]
        cca2 = object["cca2"]
        status = object["status"]

        if "currencies" in object.keys():
            currencies_code = SEPARATOR.join(object["currencies"].keys())
            currencies_name = SEPARATOR.join(currency_object["name"] for currency_object in object["currencies"].values())
            currencies_symbol = SEPARATOR.join(currency_object["symbol"] for currency_object in object["currencies"].values())
            currencies_count = len(object["currencies"])
        else:
            currencies_code = None
            currencies_name = None
            currencies_symbol = None
            currencies_count = 0

        row = {
            "common_name": common_name,
            "official_name": official_name,
            "cca2": cca2,
            "status": status,
            "currencies_code": currencies_code,
            "currencies_name": currencies_name,
            "currencies_symbol": currencies_symbol,
            "currencies_count": currencies_count,
        }
        data.append(row)

    df = pl.DataFrame(data)
    logger.info("Parsing REST Countries JSON data complete")
    return df
