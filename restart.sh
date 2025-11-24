#!/bin/bash

echo "🔻 Stopping and removing all Docker Compose containers, images, and volumes..."
docker-compose down --rmi all --volumes

echo "🔨 Rebuilding images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d
