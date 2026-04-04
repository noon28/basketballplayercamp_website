FROM nginx:alpine

# Copy site files to nginx default serve directory
COPY . /usr/share/nginx/html

# Custom nginx config for clean SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
