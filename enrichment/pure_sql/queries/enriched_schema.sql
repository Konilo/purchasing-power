DROP TABLE IF EXISTS "enriched"."fact_cpi_values";
DROP TABLE IF EXISTS "enriched"."dim_cpis";
DROP TABLE IF EXISTS "enriched"."dim_countries";

CREATE TABLE "enriched"."fact_cpi_values" (
  "id" integer PRIMARY KEY,
  "cpi_id" integer,
  "year" integer,
  "value" double precision
);

CREATE INDEX idx_fact_cpi_values_cpi_id ON "enriched"."fact_cpi_values" ("cpi_id");

CREATE TABLE "enriched"."dim_cpis" (
  "id" integer PRIMARY KEY,
  "name" varchar,
  "institution_name" varchar,
  "documentation_link" varchar,
  "legal_mentions" varchar,
  "country_id" integer
);

CREATE INDEX idx_dim_cpis_name ON "enriched"."dim_cpis" ("name");
CREATE INDEX idx_dim_cpis_country_id ON "enriched"."dim_cpis" ("country_id");

CREATE TABLE "enriched"."dim_countries" (
  "id" integer PRIMARY KEY,
  "iso_code" varchar,
  "currency_symbol" varchar,
  "name" varchar
);

CREATE INDEX idx_dim_countries_name ON "enriched"."dim_countries" ("name");
