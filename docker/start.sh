#!/bin/bash
set -e

php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

php artisan migrate --force || true

php-fpm &

nginx -g "daemon off;"

