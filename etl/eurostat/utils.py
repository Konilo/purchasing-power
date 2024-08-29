import logging
import requests as req
import gzip
import io
from lxml import etree
import polars as pl


logging.basicConfig(
    format="%(asctime)s %(levelname)-8s %(message)s",
    level=logging.INFO,
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def fetch_eurostat_xml():
    logger.info("Fetching Eurostat XML data")
    url = "https://ec.europa.eu/eurostat/api/dissemination/sdmx/3.0/data/dataflow/ESTAT/prc_hicp_aind/+"
    payload = {}
    headers = {}
    response = req.get(url, headers=headers, data=payload)

    if response.status_code != 200:
        raise Exception(f"Request failed with status code {response.status_code}")

    # Decompress the gzipped response content in-memory
    with gzip.GzipFile(fileobj=io.BytesIO(response.content)) as gz:
        xml_content = gz.read()

    # Use lxml.iterparse to parse the XML incrementally
    xml = etree.iterparse(
        io.BytesIO(xml_content),
        events=("end",),
        tag="Series",
    )

    logger.info("Fetching Eurostat XML data done")

    return xml


def parse_eurostat_xml(xml):
    logger.info("Parsing Eurostat XML data")
    data = []
    for _, series in xml:
        coicop = series.get("coicop")
        freq = series.get("freq")
        geo = series.get("geo")
        unit = series.get("unit")
        for obs in series.findall("Obs"):
            row = {
                "coicop": coicop,
                "freq": freq,
                "geo": geo,
                "unit": unit,
                "time_period": obs.get("TIME_PERIOD"),
                "obs_value": obs.get("OBS_VALUE"),
            }
            data.append(row)
        # Clear the element to free memory
        series.clear()

    df = pl.DataFrame(data)
    df = df.with_columns(pl.col("time_period").cast(pl.Int32))
    df = df.with_columns(pl.col("obs_value").cast(pl.Float64))
    logger.info("Parsing Eurostat XML data done")
    return df
