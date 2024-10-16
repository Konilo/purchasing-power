# Backend
## Setting up the production backend server
### Creation of the EC2 instance

Create an AWS EC2 instance within the Free Tier boundaries.
- Choose Ubuntu as the Amazon Machine Image.
- Choose "Create security group" and allow SSH traffic from "My IP" (or leave "Anywhere" if you want to access the instance from anywhere).
- Use a key pair (choose an RSA one) and store the resulting .pem file at the root of Backend service.
- Use the default values for the rest.


### Connection to the instance

In the AWS console, go to the page of the new EC2 instance and choose "Connect" and open the "SSH client" tab.

- If you're on a Linux/Mac machine, just run the "Example" command at the bottom.
- If you're in WSL2, run this below in the backend service directory. This is necessary because WSL's `chmod` won't work on files outside from WSL, and AWS enforces proper permissions on the PEM file for EC2 SSH access.
```bash
# Create a directory in the WSL filesystem
mkdir -p ~/aws_keys

# Move the .pem file to the WSL filesystem
mv "<name of the key pair>.pem" ~/aws_keys/

# Set the correct permissions
chmod 400 ~/aws_keys/"<name of the key pair>.pem"

# Verify the permissions. We're looking for -r--------
ls -l ~/aws_keys/"<name of the key pair>.pem"

# Connect to the EC2 instance using
# Same as the "Example" command but the PEM file path points to the new ~/aws_keys directory
ssh -i ~/aws_keys/"<name of the key pair>.pem" <username>@<Public IPv4 DNS>
```


### Installing Docker

Install Docker in the Ubuntu EC2 following those [instructions](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository).

For convenience, add the current user to the `docker` group and exit and reconnect to the EC2 instance to apply the changes.
```bash
sudo usermod -a -G docker $(whoami)
```

A little upgrade won't do no harm.
```bash
sudo apt upgrade
```


### Installing Make

If it's not already installed, install `make`.
```bash
sudo apt install make
```


### Cloning the repo

Create SSH keys in the EC2.
```bash
# Don't enter anything after "Enter file in which to save the key (/home/ubuntu/.ssh/id_rsa):, just press Enter
# No passphrase either
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Check that the SSH agent is running
eval "$(ssh-agent -s)"

# Add the SSH key to the agent
ssh-add ~/.ssh/id_rsa
```

Display and copy the public key.
```bash
cat ~/.ssh/id_rsa.pub
```

In the GitHub repo's settings, create a deploy key and paste the public key there.

Test the connection.
```bash
ssh -T git@github.com
```

Finally, clone the repo.
```bash
git clone git@github.com:Konilo/purchasing-power.git
```


## Launching the backend

From your local machine's terminal, from the root of the repo, copy the backend service's .env file to the EC2 instance.
Make sure to have set the correct production environment variables in the .env file.
You can find the Public IPv4 DNS in the EC2 instance's page in the AWS console. And username should be `ubuntu`, by default.
```bash
scp -i ~/aws_keys/"<name of the key pair>.pem" .env
scp -i <path to the pem file> backend/.env <username>@<Public IPv4 DNS>:~/purchasing-power/backend/.env
```

Back in the EC2 instance, at the root of the cloned repo in the EC2 instance, run this:
```bash
make run_backend_production
```

To test the backend:
- in the security group of the EC2 instance, add an inbound rule to allow traffic on port 8000 from your IP address:
    - Type: Custom TCP
    - Port Range: 8000
    - Source: My IP
- and go to `https://<Public IPv4 DNS>:8000/docs` in your browser.

Inside the EC2 instance, you can run this to see the logs:
```bash
docker logs purchasing_power_backend_prod
```

Finally, add an inbound rule to the EC2 instance's security group to allow the frontend to access the backend:
- Type: Custom TCP
- Port Range: 8000
- Source: Anywhere-IPv4

