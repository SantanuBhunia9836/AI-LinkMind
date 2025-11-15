# LinkSaver - Production Ready

An AI-powered link saver that automatically organizes and categorizes your video links. Features responsive design, dark mode, statistics, and seamless Android app integration via REST APIs.

## ✨ Features

- **AI-Powered Categorization**: Automatically categorizes video links using Google AI (Gemini 2.5 Flash)
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dark Mode**: Built-in dark/light theme toggle
- **Statistics Dashboard**: View insights about your saved links (categories, creators, trends)
- **Local Storage**: All data saved locally in browser (no server required for basic use)
- **Android Integration**: REST API endpoints for seamless Android app integration
- **Search & Filter**: Easily search and filter your saved links by category
- **Export Data**: Download your links as JSON for backup
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## 🎯 Recent Improvements (v1.0)

### UI/UX Enhancements
- ✅ New responsive sidebar navigation (desktop & mobile)
- ✅ Professional header with theme toggle and settings menu
- ✅ New dedicated pages: Library, Statistics, Settings
- ✅ Statistics dashboard with charts (category distribution, top creators, trends)
- ✅ Dark mode support with theme persistence
- ✅ Improved mobile layout with drawer navigation
- ✅ Better error pages (404, error boundary)

### Production Features
- ✅ Global error boundary and error pages
- ✅ Form validation with better UX
- ✅ Loading states and disabled inputs during processing
- ✅ Data export functionality
- ✅ Clear data option in settings
- ✅ Proper TypeScript types throughout

### API & Android Integration
- ✅ `/api/links` - GET/POST endpoints for managing links
- ✅ `/api/categorize` - POST endpoint to categorize URLs
- ✅ `/api/stats` - GET endpoint for statistics
- ✅ `/api/health` - Health check for monitoring
- ✅ All endpoints documented and ready for Android app

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/               # REST API routes for Android integration
│   │   ├── links/         # GET/POST links
│   │   ├── categorize/    # POST to categorize URL
│   │   ├── stats/         # GET statistics
│   │   └── health/        # Health check
│   ├── library/           # Library page
│   ├── stats/             # Statistics page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page
│   ├── error.tsx          # Global error boundary
│   ├── not-found.tsx      # 404 page
│   ├── actions.ts         # Server actions for AI
│   └── globals.css        # Global styles
├── ai/
│   ├── genkit.ts          # Genkit configuration
│   ├── dev.ts             # Development server
│   └── flows/
│       └── categorize-shared-video-link.ts  # AI categorization flow
├── components/
│   ├── app-layout.tsx     # Main app layout wrapper
│   ├── sidebar.tsx        # Navigation sidebar
│   ├── link-form.tsx      # Link submission form
│   ├── link-library.tsx   # Library display with search/filter
│   ├── link-card.tsx      # Individual link card
│   ├── header.tsx         # Header (legacy, can remove)
│   └── ui/                # Radix UI components
├── lib/
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Utility functions
│   └── placeholder-images.ts  # Image utilities
└── hooks/
    ├── use-toast.ts       # Toast notifications
    └── use-mobile.tsx     # Mobile detection
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (v20 recommended)
- npm or yarn
- Google AI API key (free tier available)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd link-saver

# Install dependencies
npm install --legacy-peer-deps

# Create .env.local file
cp .env.example .env.local

# Add your Google AI API key
# Edit .env.local and add: NEXT_PUBLIC_GENKIT_API_KEY=your_key_here
```

### Development

```bash
# Start development server on port 9002
npm run dev

# Start Genkit AI development server (in another terminal)
npm run genkit:dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run typecheck
```

## 📱 API Endpoints

All endpoints return JSON responses and are ready for Android app integration.

### Health Check
```
GET /api/health
Response: { success: true, version: "1.0.0", timestamp: "..." }
```

### Categorize Link
```
POST /api/categorize
Body: { "url": "https://youtube.com/watch?v=..." }
Response: {
  "success": true,
  "data": {
    "title": "...",
    "description": "...",
    "category": "Music",
    "confidence": 0.95,
    "creatorName": "...",
    "thumbnailUrl": "..."
  }
}
```

### Get Links
```
GET /api/links
Response: { "success": true, "links": [...], "message": "..." }
```

### Save Link
```
POST /api/links
Body: {
  "url": "https://...",
  "title": "...",
  "description": "...",
  "category": "Music",
  "creatorName": "...",
  "thumbnailUrl": "..."
}
Response: { "success": true, "link": {...} }
```

### Get Statistics
```
GET /api/stats
Response: {
  "success": true,
  "stats": {
    "totalLinks": 10,
    "categories": 5,
    "creators": 8,
    "topCategory": "Music",
    "topCreator": "Creator Name"
  }
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```
# AI Configuration
NEXT_PUBLIC_GENKIT_API_KEY=your_google_ai_key

# Optional: Server configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Tailwind Configuration
Custom colors and fonts defined in `tailwind.config.ts`:
- Primary: Deep Blue (#3F51B5)
- Accent: Teal (#009688)
- Font: Geist (default), PT Sans (blueprint)

## 🎨 UI Components

The app uses Radix UI components for accessibility and consistency:
- Button, Card, Dialog, Dropdown Menu
- Select, Input, Form, Label
- Accordion, Alert, Badge, Tabs
- And more...

See `/src/components/ui/` for component library.

## 📊 Data Flow

```
User Input → Form Validation → Server Action
    ↓
AI Categorization (Google Genkit)
    ↓
Metadata Extraction (Cheerio, Browserless API)
    ↓
Link Saved to localStorage
    ↓
UI Updated with New Link
```

## 🔐 Security Notes

- API keys should be stored in `.env.local` (never commit)
- Sensitive operations should run on server (server actions)
- CORS headers should be configured for Android app
- Input validation on both client and server

## 📈 Performance

- Next.js optimized builds
- Client-side caching with localStorage
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Recharts for efficient chart rendering

## 🧪 Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build test
npm run build
```

## 📦 Production Deployment

### Vercel (Recommended)
```bash
# Connect your repository
# Vercel will auto-detect Next.js project
# Configure environment variables in Vercel dashboard
# Deploy with: git push
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup for Production
```
NEXT_PUBLIC_GENKIT_API_KEY=production_key_here
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

## 🤝 Android App Integration

The app provides REST APIs for seamless Android integration:

1. **Check Health**: Call `/api/health` to verify connection
2. **Categorize**: POST to `/api/categorize` with URL
3. **Save Link**: POST to `/api/links` with link details
4. **Fetch Stats**: GET from `/api/stats` for dashboard
5. **Sync Links**: Implement polling/webhooks for sync

Example Android request:
```kotlin
val url = "https://your-domain.com/api/categorize"
val body = JSONObject().put("url", "https://youtube.com/watch?v=...")
val request = Request.Builder()
    .url(url)
    .post(RequestBody.create(MediaType.parse("application/json"), body.toString()))
    .build()
```

## 🚨 Troubleshooting

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install --legacy-peer-deps`
- Check Node version: `node --version` (should be 18+)

### API Not Working
- Verify `.env.local` has correct API key
- Check if Genkit dev server is running: `npm run genkit:dev`
- See browser console for detailed error messages

### localStorage Issues
- Clear browser data and try again
- Check browser console for errors
- Some browsers disable localStorage in incognito mode

## 📝 Changelog

### v1.0 (Current)
- New responsive app layout with sidebar
- Statistics dashboard with charts
- Dark mode support
- API endpoints for Android integration
- Error pages and error boundary
- Data export functionality
- Settings page with data management

## 📚 Technologies Used

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Lucide Icons
- **AI**: Google AI (Genkit), Google Gemini 2.5 Flash
- **Data**: localStorage (browser), Firebase (future)
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod
- **Utilities**: date-fns, Cheerio, Browserless API

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Version**: 1.0.0  
**Last Updated**: November 15, 2025  
**Status**: Production Ready ✅
