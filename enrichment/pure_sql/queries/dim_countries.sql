DROP SEQUENCE IF EXISTS enriched.dim_countries_id_seq;

CREATE SEQUENCE enriched.dim_countries_id_seq;

TRUNCATE enriched.dim_countries;

INSERT INTO enriched.dim_countries (id, iso_code, currency_symbol, name)
SELECT DISTINCT
	NEXTVAL('enriched.dim_countries_id_seq') AS id,
	cca2 AS iso_code,
	currencies_symbol AS currency_symbol,
	common_name AS name
FROM
	raw.restcountries
WHERE
	currencies_count = 1;
