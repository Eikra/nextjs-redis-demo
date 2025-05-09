#!/bin/bash

# Stop and remove all containers
docker stop $(docker ps -q)    # Stop all running containers
docker rm $(docker ps -aq)     # Remove all containers, including stopped ones

# Remove stopped containers
docker container prune -f

rm -rf /home/iecharak/data/mariadb/*
rm -rf /home/iecharak/data/wordpress/*


# Remove unused images (both dangling and tagged)
docker image prune -af

# docker rmi mariadb:42  nginx:42  wordpress:42 mariadb:latest  nginx:latest  wordpress:latest

# Clean up Docker cache (if needed)
# # Be cautious with this step
# rm -rf /var/lib/docker/*

# Remove builder cache
docker builder prune -f

# Remove unused volumes
docker volume prune -f

docker volume ls -q | xargs -r docker volume rm

# Remove unused networks
docker network prune -f

docker network ls -q | xargs -r docker network rm
# Remove dangling images
docker image prune -af

# Alternatively, use docker system prune to remove all unused data
docker system prune -f

# Remove all unused data (containers, images, volumes, networks)
docker system prune -af