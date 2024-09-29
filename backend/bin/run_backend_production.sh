#!/usr/bin/env bash

# Define variables
CONTAINER_NAME="purchasing_power_backend_prod"
IMAGE_NAME="purchasing_power_backend:prod"
DOCKERFILE="backend/Dockerfile.prod"

# Stop and remove the container if it already exists
if docker ps --all --format '{{.Names}}' | grep --extended-regexp --quiet "^${CONTAINER_NAME}\$"; then
    echo "Stopping and removing existing container..."
    docker stop ${CONTAINER_NAME} || echo "Failed to stop container."
    docker rm ${CONTAINER_NAME} || echo "Failed to remove container."
fi

# Build the Docker image
echo "Building Docker image..."
docker build \
    --tag ${IMAGE_NAME} \
    --file ${DOCKERFILE} \
    . \
    || { echo "Failed to build Docker image."; exit 1; }

# Run the Docker container
# --detach flag runs the container in the background, so that the terminal is not blocked
echo "Running the image..."
docker run \
    --name ${CONTAINER_NAME} \
    --detach \
    -p 8000:8000 \
    ${IMAGE_NAME} \
    || { echo "Failed to start Docker container."; exit 1; }
echo "Image ran successfully."
