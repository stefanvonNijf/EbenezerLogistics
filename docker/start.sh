#!/bin/bash
set -e

# Clear stale build-time cache and rebuild with runtime env vars from DigitalOcean
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations draaien
php artisan migrate --force

# Start php-fpm op de achtergrond
php-fpm &

# Start nginx op de voorgrond
nginx -g "daemon off;"

