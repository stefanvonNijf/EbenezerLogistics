#!/bin/bash
set -e

# Migrations draaien
php artisan migrate --force

# Start php-fpm op de achtergrond
php-fpm &

# Start nginx op de voorgrond
nginx -g "daemon off;"

