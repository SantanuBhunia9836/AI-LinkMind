# 🔗 LinkSaver - Never Lose a Link Again

AI-powered link saver that **automatically organizes & categorizes** your video links.

## ✨ Features

- 🤖 **AI-Powered Categorization** - Automatically categorizes links using Google Gemini
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode support
- 📊 **Statistics** - View insights about your saved links
- 📱 **Mobile Friendly** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Search & Filter** - Easily find saved links by category or keywords
- 💾 **Local Storage** - All data saved locally in your browser
- 📤 **Export Data** - Download your links as JSON
- 🔌 **API Endpoints** - Ready for Android app integration
- ⚡ **Production Ready** - Fully optimized and ready to deploy

## 🚀 Quick Start

### Development
```bash
npm install --legacy-peer-deps
npm run dev
# Visit http://localhost:9002
```

### Production Build
```bash
npm run build
npm start
# Visit http://localhost:3000
```

## 📖 Documentation

- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Complete production overview
- **[PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)** - Detailed guide for production use
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - REST API reference for Android app
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions

## 🏗️ Architecture

```
Home → Link Form → AI Categorization → Save to Library
                ↓
              Stats Page → View Insights
                ↓
              Settings Page → Manage Data
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Genkit, Gemini 2.5 Flash
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod
- **Icons**: Lucide React

## 📱 Android Integration

Complete REST API ready for Android app:
- `/api/health` - Health check
- `/api/categorize` - Categorize URLs
- `/api/links` - Manage links
- `/api/stats` - Get statistics

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

## 📦 Pages

- **Home** - Add new links and view recent saves
- **Library** - Browse and search all saved links
- **Statistics** - View insights with charts
- **Settings** - Manage data and preferences

## 🎯 Next Steps

1. **Read** [PRODUCTION_READY.md](./PRODUCTION_READY.md) for an overview
2. **Deploy** using [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. **Integrate** Android app using [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## ⚙️ Configuration

Create `.env.local`:
```
NEXT_PUBLIC_GENKIT_API_KEY=your_google_ai_key
```

## 📝 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 15, 2025
