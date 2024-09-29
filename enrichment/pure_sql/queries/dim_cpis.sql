DROP SEQUENCE IF EXISTS enriched.dim_cpis_id_seq;

CREATE SEQUENCE enriched.dim_cpis_id_seq;

TRUNCATE enriched.dim_cpis;

INSERT INTO enriched.dim_cpis (id, name, institution_name, documentation_link, legal_mentions, country_id)
SELECT
	NEXTVAL('enriched.dim_cpis_id_seq') AS id,
	'Harmonized Index of Consumer Prices - All-items' AS name,
    'Eurostat' AS institution_name,
    'https://ec.europa.eu/eurostat/cache/metadata/en/prc_hicp_esms.htm' AS documentation_link,
    'https://doi.org/10.2908/PRC_HICP_AIND' AS legal_mentions,
    dc.id AS country_id
FROM (
	SELECT DISTINCT geo
	FROM raw.eurostat
) AS e
JOIN 
    enriched.dim_countries AS dc ON e.geo = dc.iso_code

UNION ALL

SELECT
	NEXTVAL('enriched.dim_cpis_id_seq') AS id,
	'Consumer Price Index for All Urban Consumers' AS name,
    'U.S. Bureau of Labor Statistics' AS institution_name,
    'https://data.bls.gov/timeseries/CUUR0000SA0' AS documentation_link,
    'BLS.gov cannot vouch for the data or analyses derived from these data after the data have been retrieved from BLS.gov.' AS legal_mentions,
	(
		SELECT id
		FROM enriched.dim_countries
		WHERE iso_code = 'US'
	) AS country_id;
