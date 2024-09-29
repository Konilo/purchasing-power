guard-%:
	@ if [ "${${*}}" = "" ]; then \
        echo "Environment variable $* not set"; \
        exit 1; \
    fi

run_etl_dev_env:
	bash etl/bin/run_dev_env.sh

run_enrichment_dev_env:
	bash enrichment/bin/run_dev_env.sh

run_backend_dev_env:
	bash backend/bin/run_dev_env.sh

run_frontend_dev_env:
	bash frontend/bin/run_dev_env.sh

run_etls_production:
	bash etl/bin/run_etls_production.sh

run_enrichments_production:
	bash enrichment/bin/run_enrichments_production.sh

run_backend_production:
	bash backend/bin/run_backend_production.sh
