FROM php:8.2-fpm

# Systeem dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev libzip-dev \
    nginx nodejs npm gnupg wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Google Chrome installeren
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Werkmap
WORKDIR /var/www

# Dependencies eerst (betere Docker cache)
COPY composer.json composer.lock ./
RUN composer install --optimize-autoloader --no-dev --no-scripts

COPY package.json package-lock.json ./
RUN npm ci

# Rest van de bestanden
COPY . .

# Assets builden
RUN npm run build

# Laravel bootstrap
RUN php artisan storage:link || true
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

# Permissies
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Nginx + start config
COPY docker/nginx.conf /etc/nginx/sites-enabled/default
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080
CMD ["/start.sh"]
