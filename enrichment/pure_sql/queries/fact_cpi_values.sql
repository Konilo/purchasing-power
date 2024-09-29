DROP SEQUENCE IF EXISTS enriched.fact_cpi_values_id_seq;

CREATE SEQUENCE enriched.fact_cpi_values_id_seq;

TRUNCATE enriched.fact_cpi_values;

INSERT INTO enriched.fact_cpi_values (id, cpi_id, year, value)

SELECT
    nextval('enriched.fact_cpi_values_id_seq') AS id,
    cpis_and_coutries.id AS cpi_id,
    e.time_period AS year,
    e.obs_value AS value
FROM raw.eurostat e
INNER JOIN (
	SELECT
        dim_cpis.id,
        dim_cpis.name,
        dim_cpis.institution_name,
        dim_countries.iso_code
	FROM enriched.dim_cpis
	INNER JOIN enriched.dim_countries ON dim_cpis.country_id = dim_countries.id
) AS cpis_and_coutries ON (
	e.geo = cpis_and_coutries.iso_code
	AND cpis_and_coutries.name = 'Harmonized Index of Consumer Prices - All-items'
	AND cpis_and_coutries.institution_name = 'Eurostat'
)
WHERE
	e.coicop = 'CP00' -- CP00 is the all-items index
	AND e.unit = 'INX_A_AVG' -- INX_A_AVG is the annual average index, RCH_A_AVG is the annual average rate of change

UNION ALL

SELECT
	nextval('enriched.fact_cpi_values_id_seq') AS id,
    (
		SELECT id
		FROM enriched.dim_cpis
		WHERE
			name = 'Consumer Price Index for All Urban Consumers'
    		AND institution_name = 'U.S. Bureau of Labor Statistics'
	) AS cpi_id,
    u.year,
    u.value AS value
FROM raw.usbls as u
WHERE
	series_id = 'CUUR0000SA0'
	AND period = 'M13'; -- M13 is the annual average
