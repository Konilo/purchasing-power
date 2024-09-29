# ETL
## Setting up a PostgreSQL server for development
### Install PostgreSQL

- Install PSQL server (port 5432 as usual for PSQL), cf. [here](https://www.codecademy.com/article/installing-and-using-postgresql-locally).
- Check that it works:
    - Windows: `"C:\Program Files\PostgreSQL\<version>\bin\psql.exe" --username postgres`
    - Linux and Mac: `psql --username postgres`


### Configure PostgreSQL for remote access
#### On the server

- Get the IP address of the machine where the PSQL server is running:
    - Windows: in powershell, run `ipconfig` and look for the IPv4 address of the network adapter you're using ("Carte Ethernet vEthernet (WSL (Hyper-V firewall))", in my case).
    - Linux and Mac: `hostname -I`.
- Leave `postgresql.conf` as is if you find `listen_addresses = '*'`. Otherwise, change it to `listen_addresses = 'localhost, <IPv4 from above>'`.
- In `pg_hba.conf`, add `host    all             all             <IPv4 from above>/32           md5`.
    - `/32` marks the IP address as exact, by opposition to an IP address range.
- Restart PSQL:
    - Windows: cf. "Restart PostgreSQL from the command line" [here](https://www.postgresqltutorial.com/postgresql-administration/restart-postgresql-windows/).
    - Linux and Mac: `sudo systemctl restart postgresql`.


#### In the docker container

- In the python interpreter, to test the remote access, run `psycopg2.connect(host=<>, port=<x>, dbname=<x>, user=<x>, password=<x>)`.
- For Windows: if the above command fails, in the Windows firewall, try adding an inbound rule to allow inbound connections via the 5432 port, cf. [here](https://stackoverflow.com/a/41455744).


### Prepare the database
#### Create the database

- Connect to PSQL CLI with the default superuser:
    ```shell
    <PSQL executable> --username postgres
    ```
- Create the database:
    ```sql
    CREATE DATABASE purchasing_power;
    ```


#### Create an admin user for the database

- Create an admin user for the database:
    ```sql
    CREATE USER admin WITH PASSWORD '<password>';
    ```
- Grant the admin user all privileges on the database:
    ```sql
    GRANT ALL PRIVILEGES ON DATABASE purchasing_power TO admin;
    ```


#### Create a dataflow user for the database

- Create the dataflow user:
    ```sql
    CREATE USER dataflow WITH PASSWORD '<password>';
    ```


#### Create the schemas

- Reconnect to the purchasing_power database with the admin user via the PSQL CLI.
    ```sql
    exit
    ```
    ```shell
    <PSQL executable> --username admin --dbname purchasing_power
    ```
- Create the schemas:
    ```sql
    CREATE SCHEMA raw;
    CREATE SCHEMA enriched;
    ```
- Grant all privileges on the schemas to the admin user:
    ```sql
    GRANT ALL PRIVILEGES ON SCHEMA raw TO admin;
    GRANT ALL PRIVILEGES ON SCHEMA enriched TO admin;
    ```
- Grant necessary privileges to the dataflow user:
    ```sql
    -- raw schema
    GRANT USAGE ON SCHEMA raw TO dataflow;
    GRANT CREATE ON SCHEMA raw TO dataflow;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA raw TO dataflow;
    ALTER DEFAULT PRIVILEGES IN SCHEMA raw GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dataflow;

    -- enriched schema
    GRANT USAGE ON SCHEMA enriched TO dataflow;
    GRANT CREATE ON SCHEMA enriched TO dataflow;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA enriched TO dataflow;
    ALTER DEFAULT PRIVILEGES IN SCHEMA enriched GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO dataflow;
    ```


#### Create a read-only user for the enriched schema

- Reconnect to the purchasing_power database with the default superuser via the PSQL CLI.
    ```sql
    exit
    ```
    ```shell
    <PSQL executable> --username postgres --dbname purchasing_power
    ```
- Create the read-only user:
    ```sql
    CREATE USER read_only WITH PASSWORD '<password>';
    ```
- Grant necessary privileges to the read-only user:
    ```sql
    GRANT USAGE ON SCHEMA enriched TO read_only;
    GRANT SELECT ON ALL TABLES IN SCHEMA enriched TO read_only;
    ALTER DEFAULT PRIVILEGES IN SCHEMA enriched GRANT SELECT ON TABLES TO read_only;
    ```


## Setting up a PostgreSQL server for production
### Creating the AWS RDS instance

On AWS, create a PSQL RDS instance using the default values for the Free Tier. (Use the default VPC and default security group, and don't create a database in the instance, we'll do that later.)


### Setting it up

To setup the database, you can connect to it from your local machine.

Browse to the default security group and add an inbound to allow your machine's IP to send requests to PSQL in RDS, see [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_SettingUp.html#CHAP_SettingUp.SecurityGroup).

Then, connect to the PSQL server (guide [here](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.psql.html)).

For a Ubuntu or WSL machine, run this:
```bash
sudo apt install postgresql-client

psql \
   --host=<DB instance endpoint> \
   --port=<port> \
   --username=<master username> \
   --password <password>
```

Now, follow the steps describe in the "Prepare the database" subsection of the "PostgreSQL server for development" section above. Specify the host and port, like in the code chunk above, when connecting to the PSQL in RDS. Otherwise, `psql` will target the local, development server.


## Running the ETLs on production

The tables in the database are not meant to change frequently (since the values we're interested in are yearly). Hence, I propose to run the ETLs on the local machine -- via the production-grade Docker image. Run this below at the root of the repo and that's it.
```bash
make run_etls_production
```
