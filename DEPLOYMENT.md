# Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account (free)
- Vercel CLI installed globally: `npm i -g vercel`
- GitHub repository (recommended)

### Quick Deploy

1. **Login to Vercel:**
```bash
vercel login
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Your app will be live at:**
```
https://your-app-name.vercel.app
```

## Local Development with Vercel

### Start Local Development Server
```bash
npm run vercel-dev
```

This will:
- Start the mock API server locally
- Start the React frontend locally  
- Proxy API calls to the local server
- Provide a Vercel-like development environment

### What `vercel dev` does:
- **Frontend**: Runs on `http://localhost:3000`
- **Backend**: Runs on `http://localhost:3001`
- **Hot reload**: Both frontend and backend reload on changes
- **Environment**: Uses development environment variables

## Environment Variables

### Development (Local)
```bash
NODE_ENV=development
```

### Production (Vercel)
```bash
NODE_ENV=production
PORT=3001
```

## API Endpoints

### Local Development
- **Submit**: `POST http://localhost:3001/api/submit`
- **Status**: `GET http://localhost:3001/api/status`
- **Reset**: `POST http://localhost:3001/api/reset`

### Production (Vercel)
- **Submit**: `POST https://your-app-name.vercel.app/api/submit`
- **Status**: `GET https://your-app-name.vercel.app/api/status`
- **Reset**: `POST https://your-app-name.vercel.app/api/reset`

## Testing the Deployment

### 1. Test API Directly
```bash
# Test the deployed API
curl -X POST https://your-app-name.vercel.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 100.50}'

# Check server status
curl https://your-app-name.vercel.app/api/status
```

### 2. Test Full Application
Visit `https://your-app-name.vercel.app` and:
1. Submit a valid form
2. Check browser console for logs
3. Verify API responses in Network tab
4. Test all scenarios (success, retry, duplicate)

## Configuration Files

### `vercel.json` - Deployment Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/server.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": { "NODE_ENV": "production" },
  "functions": {
    "api/server.js": { "runtime": "nodejs18.x" }
  }
}
```

### `api/server.js` - Production Server
- Handles API routes (`/api/*`)
- Includes CORS for production domains
- Serves static React app for all other routes
- Maintains all validation and business logic

## Deployment Workflow

### Automatic Deployment (Recommended)
1. **Push to GitHub:**
```bash
git add .
git commit -m "Add Vercel deployment"
git push origin main
```

2. **Connect Vercel to GitHub:**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Connect your GitHub repository
- Vercel will auto-deploy on pushes

### Manual Deployment
```bash
# Build and deploy manually
npm run build
vercel --prod
```

## Troubleshooting

### Common Issues

**1. "Cannot find module 'express'"**
```bash
# Install missing dependencies
npm install express cors
```

**2. CORS errors in production**
- Check `vercel.json` CORS configuration
- Ensure your domain is in the allowed origins

**3. Build failures**
```bash
# Clear build cache
rm -rf dist node_modules/.vite
npm run build
```

**4. API not working**
- Check Vercel function logs in dashboard
- Verify `api/server.js` exports default function
- Ensure all dependencies are in `dependencies` (not `devDependencies`)

### Environment Variables
Set sensitive data in Vercel dashboard:
1. Go to Vercel project settings
2. Add environment variables
3. Access in code: `process.env.VARIABLE_NAME`

## Performance Optimization

### Built-in Optimizations
- **Vercel Edge Network**: Global CDN
- **Static Asset Optimization**: Automatic compression
- **Function Caching**: API responses cached
- **Bundle Splitting**: React code split automatically

### Monitoring
- **Vercel Analytics**: Page views, visitors
- **Function Logs**: API errors and performance
- **Speed Insights**: Core Web Vitals monitoring

## Production vs Development

| Feature | Development | Production |
|---------|------------|------------|
| API URL | `http://localhost:3001` | Same domain |
| Frontend URL | `http://localhost:3000` | `https://your-app.vercel.app` |
| Hot Reload | ✅ | ❌ |
| Source Maps | ✅ | ❌ |
| Environment Variables | `.env.local` | Vercel Dashboard |
| Logs | Terminal | Vercel Dashboard |

## Next Steps

1. **Deploy to Vercel:**
```bash
vercel --prod
```

2. **Test the live app:**
- Visit your Vercel URL
- Test all form scenarios
- Verify API functionality

3. **Monitor performance:**
- Check Vercel analytics
- Monitor function logs
- Track user interactions

Your app is now ready for production deployment on Vercel!
