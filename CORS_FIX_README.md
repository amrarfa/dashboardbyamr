# CORS Error Fix Guide

## Problem
The frontend application is encountering CORS (Cross-Origin Resource Sharing) errors when trying to access the backend API at `http://eg.localhost:7167`.

## Solutions Implemented

### 1. Frontend Proxy Configuration (Recommended)
We've configured Vite to proxy API requests to avoid CORS issues:

**File: `vite.config.js`**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://eg.localhost:7167',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

**Updated API calls to use proxy:**
- Changed from: `http://eg.localhost:7167/api/v1/...`
- Changed to: `/api/v1/...`

### 2. Enhanced Error Handling
Added comprehensive error handling for CORS and network issues:

```javascript
const makeApiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, options)
    return response
  } catch (fetchError) {
    if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
      throw new Error('CORS Error: Unable to connect to API. Please ensure the backend server is running and CORS is configured properly.')
    }
    throw fetchError
  }
}
```

## How to Test the Fix

### Step 1: Restart the Development Server
```bash
npm run dev
# or
yarn dev
```

### Step 2: Test API Calls
1. Open the application in your browser
2. Try searching for a subscription by SID or phone number
3. Check the browser console for any remaining CORS errors

## Alternative Backend CORS Configuration

If the proxy solution doesn't work, you can configure CORS on the backend server:

### For ASP.NET Core Backend:
Add this to your `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000") // Add your frontend URLs
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Use CORS
app.UseCors("AllowFrontend");
```

### For Express.js Backend:
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

## Troubleshooting

### If CORS errors persist:
1. **Check if backend server is running** on `http://eg.localhost:7167`
2. **Verify the proxy configuration** in `vite.config.js`
3. **Clear browser cache** and restart the dev server
4. **Check browser console** for specific error messages
5. **Test API endpoints directly** using tools like Postman or curl

### Common Issues:
- **Backend not running**: Ensure your API server is running on port 7167
- **Wrong proxy target**: Verify the target URL in vite.config.js matches your backend
- **Browser cache**: Clear cache or use incognito mode
- **Firewall/Network**: Check if localhost connections are blocked

## Testing Commands

Test API endpoints directly:
```bash
# Test SID search
curl "http://eg.localhost:7167/api/v1/ActionsManager/subscription/1777"

# Test phone search
curl "http://eg.localhost:7167/api/v1/ActionsManager/subscription/search-by-phone/1234567890"
```

## Files Modified
- `vite.config.js` - Added proxy configuration
- `src/services/manageSubscriptionApi.js` - Updated API base URL
- `src/pages/ManageSubscriptions.jsx` - Enhanced error handling
- All API calls now use relative URLs with proxy

The application should now work without CORS errors!
