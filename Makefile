guard-%:
	@ if [ "${${*}}" = "" ]; then \
        echo "Environment variable $* not set"; \
        exit 1; \
    fi

run-etl-dev-env:
	bash etl/bin/run_dev_env.sh
