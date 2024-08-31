-- Declaring keys separately at the end to allow TRUNCATE and avoid the following error:
-- "cannot truncate a table referenced in a foreign key constraint"
ALTER TABLE "enriched"."fact_cpi_values" ADD FOREIGN KEY ("cpi_id") REFERENCES "enriched"."dim_cpis" ("id");
ALTER TABLE "enriched"."dim_cpis" ADD FOREIGN KEY ("country_id") REFERENCES "enriched"."dim_countries" ("id");
