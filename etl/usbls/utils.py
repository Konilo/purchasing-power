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


def fetch_usbls_json(series_id: str, start_year: int, end_year: int, registration_key: str, max_years_per_request: int = 19):
    # At most 19 years of data can be requested at a time with a key and 9 without
    logger.info(f"Fetching USBLS JSON data for series {series_id} from {start_year} to {end_year}")
    headers = {"Content-type": "application/json"}
    year_chunks = [[year, min(year + max_years_per_request, end_year)] for year in range(start_year, end_year, max_years_per_request)]
    jsons = []
    for years in year_chunks:
        logger.info(f"Requesting data for years {min(years)}-{max(years)}")

        data = json.dumps(
            {
                "seriesid": [
                    series_id,
                ],
                "startyear": str(min(years)),
                "endyear": str(max(years)),
                "annualaverage": True,
                "registrationkey": registration_key,
            }
        )
        url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
        response = req.post(
            url=url,
            data=data,
            headers=headers,
        )

        if json.loads(response.text)["message"]:
            messages = SEPARATOR.join(json.loads(response.text)["message"])
            logger.info(f"Request message: {messages}")
            if "range has been reduced" in messages or "could not be serviced" in messages:
                raise Exception("Unexpected response, stopping to avoid fetching incomplete data")

        if response.status_code != 200:
            raise Exception(f"Request failed with status code {response.status_code}")

        jsons.append(json.loads(response.text))

    logger.info("Fetching USBLS JSON data complete")
    return jsons


def parse_usbls_json(jsons: list):
    logger.info("Parsing USBLS JSON data")
    data = []
    for json_data in jsons:
        for series in json_data["Results"]["series"]:
            seriesId = series["seriesID"]
            for item in series["data"]:
                year = item["year"]
                period = item["period"]
                period_name = item["periodName"]
                value = item["value"]
                footnotes = ", ".join(footnote["text"] for footnote in item["footnotes"] if footnote)
                row = {
                    "series_id": seriesId,
                    "year": year,
                    "period": period,
                    "value": value,
                    "footnotes": footnotes,
                }
                data.append(row)
    df = pl.DataFrame(data)
    df = df.with_columns(pl.col("year").cast(pl.Int32))
    df = df.with_columns(pl.col("value").cast(pl.Float64))
    logger.info("Parsing USBLS JSON data complete")
    return df
