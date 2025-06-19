# Deployment Guide

This guide covers various deployment options for the LowCalories Dashboard.

## 📋 Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Environment variables configured
- [ ] Build process verified
- [ ] Security headers configured
- [ ] Performance optimized

## 🚀 Quick Deploy Options

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add environment variables from `.env.example`
   - Redeploy if needed

### Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir=dist
   ```

3. **Or drag and drop**
   - Go to [Netlify](https://netlify.com)
   - Drag the `dist` folder to deploy

## 🔧 Manual Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the project
npm run build

# The built files will be in the 'dist' directory
```

### Static File Hosting

The built files in the `dist` directory can be served by any static file server:

- **Apache**: Copy files to `htdocs` or `public_html`
- **Nginx**: Copy files to web root directory
- **AWS S3**: Upload files to S3 bucket with static hosting
- **GitHub Pages**: Push `dist` contents to `gh-pages` branch

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  lowcalories-dashboard:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build the image
docker build -t lowcalories-dashboard .

# Run the container
docker run -p 80:80 lowcalories-dashboard

# Or use docker-compose
docker-compose up -d
```

## ☁️ Cloud Platform Deployment

### AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://lowcalories-dashboard
   ```

2. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://lowcalories-dashboard --delete
   ```

3. **Configure CloudFront**
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing

### Google Cloud Platform

1. **Build and upload**
   ```bash
   npm run build
   gsutil -m rsync -r -d dist/ gs://lowcalories-dashboard
   ```

2. **Configure bucket for web hosting**
   ```bash
   gsutil web set -m index.html -e index.html gs://lowcalories-dashboard
   ```

### Azure Static Web Apps

1. **Create Azure Static Web App**
2. **Connect to GitHub repository**
3. **Configure build settings**:
   - App location: `/`
   - Build location: `dist`
   - Build command: `npm run build`

## 🔒 Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false
```

### Security Headers

Configure your web server to include security headers:

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/html

    # Security headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"

    # SPA routing
    <Directory "/var/www/html">
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

## 📊 Monitoring and Analytics

### Performance Monitoring

Add performance monitoring to your deployment:

```javascript
// Add to main.jsx
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart)
  })
}
```

### Error Tracking

Consider integrating error tracking services:

- **Sentry**: For error monitoring
- **LogRocket**: For session replay
- **Google Analytics**: For usage analytics

## 🔄 CI/CD Pipeline

### GitHub Actions (Included)

The project includes a GitHub Actions workflow that:
- Runs tests and linting
- Builds the project
- Deploys to staging/production

### Custom CI/CD

For custom CI/CD pipelines, use these commands:

```bash
# Install dependencies
npm ci

# Run tests
npm run lint

# Build for production
npm run build

# Deploy (example)
rsync -avz dist/ user@server:/var/www/html/
```

## 🚨 Troubleshooting

### Common Issues

1. **Blank page after deployment**
   - Check browser console for errors
   - Verify all assets are loading correctly
   - Check routing configuration

2. **API calls failing**
   - Verify environment variables
   - Check CORS configuration
   - Ensure API endpoints are accessible

3. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Health Checks

Add health check endpoints:

```javascript
// Add to your server
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
})
```

## 📞 Support

For deployment issues:
- Check the [troubleshooting guide](TROUBLESHOOTING.md)
- Create an issue on GitHub
- Contact the development team

---

Happy deploying! 🚀
