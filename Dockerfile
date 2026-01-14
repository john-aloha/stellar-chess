# Use nginx alpine for a lightweight production-ready web server
FROM nginx:alpine

# Copy the game files to nginx's default serving directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY audio.js /usr/share/nginx/html/
COPY chess-engine.js /usr/share/nginx/html/
COPY chess-ai.js /usr/share/nginx/html/
COPY game.js /usr/share/nginx/html/

# Create a custom nginx configuration for better SPA support
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Enable gzip compression for better performance \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml; \
    gzip_min_length 1000; \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# nginx runs automatically with the base image CMD
