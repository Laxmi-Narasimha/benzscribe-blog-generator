# Deployment Guide for Benz Scribe Creative Craft

This guide provides instructions for deploying the application to various platforms.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn package manager
- Git

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Vite applications.

1. **Create a Vercel account** at [vercel.com](https://vercel.com) if you don't have one.

2. **Install the Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

3. **Login to Vercel**:
   ```bash
   vercel login
   ```

4. **Deploy the application**:
   ```bash
   # From the project root directory
   vercel
   ```

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

## Option 2: Deploy to Netlify

1. **Create a Netlify account** at [netlify.com](https://netlify.com) if you don't have one.

2. **Install the Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

3. **Login to Netlify**:
   ```bash
   netlify login
   ```

4. **Deploy the application**:
   ```bash
   # Build the app
   npm run build

   # Deploy using Netlify CLI
   netlify deploy
   ```

5. **For production deployment**:
   ```bash
   netlify deploy --prod
   ```

## Option 3: Deploy to GitHub Pages

1. **Create a GitHub repository** for your project.

2. **Add the gh-pages package**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add the following to your package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

## Option 4: Manual Deployment to a Web Server

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Copy the contents of the `dist` folder** to your web server's public directory (e.g., `/var/www/html/` for Apache).

3. **Configure your web server** to serve the application:

   For Apache, add this to your `.htaccess` file:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   For Nginx, add this to your site configuration:
   ```
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Option 5: Deploy with Docker

1. **Create a Dockerfile** in the project root:

```Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Create an nginx.conf file**:

```
server {
    listen 80;
    server_name _;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Build and run the Docker container**:
```bash
docker build -t benz-scribe-app .
docker run -p 8080:80 benz-scribe-app
```

## Additional Deployment Considerations

### Environment Variables

If your application uses environment variables:

1. Create a `.env.production` file for production environment variables.
2. Make sure to use the `import.meta.env` syntax to access environment variables.
3. Don't commit sensitive information to version control.

### API Proxy Configuration

If you're using the SerpAPI proxy, make sure to:

1. Configure the mock proxy endpoint for production.
2. Start the necessary servers before deploying.
3. Update the `MOCK_PROXY_URL` in `src/services/serpApiService.ts` to match your production URL.

### Server-Side Requirements

For the proxy server to work in production:

1. Deploy the proxy server (simple-proxy.cjs or proxy.cjs) to a server.
2. Update the proxy URL in the application to point to the deployed proxy server.
3. Ensure CORS is properly configured on the proxy server.

## Testing Your Deployment

After deploying, verify that:

1. The application loads correctly.
2. All features work as expected.
3. API calls are successful.
4. There are no console errors.

## Troubleshooting

- **404 errors**: Ensure your server is configured to serve the `index.html` file for all routes.
- **API connectivity issues**: Check that your proxy server is running and accessible.
- **CORS errors**: Verify that your API server has CORS properly configured.
- **Blank screen**: Check for JavaScript errors in the console. 