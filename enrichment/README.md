# Running the ETLs on production

First go through the README of ETL service.

The tables in the database are not meant to changes frequently (since the values we're interested in are yearly). Hence, I propose to run the enrichments on the local machine -- via the production-grade Docker image. Run this below at the root of the repo and that's it.
```bash
make run_enrichments_production
```
