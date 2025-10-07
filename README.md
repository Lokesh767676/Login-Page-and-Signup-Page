# AgriConnect - Agricultural Job Marketplace

A modern web application connecting farmers with agricultural labourers, featuring crop price predictions and smart farming tools.

## 🚀 Features

### For Farmers:
- **Post Jobs**: Create detailed job postings with location, skills needed, and pay rates
- **Manage Applications**: Review and accept/reject applications from labourers
- **Price Predictions**: Access government data and AI-powered crop price forecasts
- **Smart Tools**: Browse farming equipment and tools catalog

### For Agricultural Labourers:
- **Find Jobs**: Browse available agricultural jobs with filtering options
- **Apply for Work**: Send applications with cover messages and negotiate rates
- **Track Applications**: Monitor application status and responses
- **Market Insights**: Access crop price data for informed decisions

### General Features:
- **Bilingual Support**: English and Telugu language options
- **Real-time Data**: Government price data integration
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: User registration and login system

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Internationalization**: react-i18next

## 📋 Prerequisites

- Node.js 18+ and npm
- VS Code (recommended)
- Supabase account (optional - app works in demo mode)

## 🚀 Setup Instructions for VS Code

### 1. Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd agriconnect

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your Supabase credentials (optional)
# If you don't have Supabase, the app will run in demo mode
```

### 3. Supabase Setup (Optional)

If you want to use real database functionality:

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup to complete

2. **Get Project Credentials**:
   - Go to Project Settings → API
   - Copy `Project URL` and `anon public` key
   - Add to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Setup Database Schema**:
   - Go to SQL Editor in Supabase
   - Run the database migration scripts (provided separately)

### 4. VS Code Extensions (Recommended)

Install these VS Code extensions for better development experience:

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Prettier - Code formatter**
- **ESLint**

### 5. Run the Application

```bash
# Start development server
npm run dev

# Open in browser
# The app will automatically open at http://localhost:5173
```

### 6. VS Code Development Tips

1. **Integrated Terminal**: Use `Ctrl+`` to open terminal in VS Code
2. **File Explorer**: Use `Ctrl+Shift+E` to focus on file explorer
3. **Quick Open**: Use `Ctrl+P` to quickly open files
4. **Command Palette**: Use `Ctrl+Shift+P` for VS Code commands

## 🎯 How to Use the Application

### Testing as Farmer:
1. Click "Get Started" → "Create Account"
2. Fill details and select **"Farmer"**
3. After login, click **"Post New Job"** to create jobs
4. Use **"My Jobs"** tab to manage posted jobs
5. Check **"Price Predictions"** for crop market data

### Testing as Labourer:
1. Create account and select **"Agricultural Labourer"**
2. Use **"Find Jobs"** tab to browse available work
3. Apply for jobs with cover messages
4. Track applications in the dashboard

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── LoginModal.tsx   # Authentication modal
│   ├── JobPostingModal.tsx
│   └── ...
├── services/           # API services
│   ├── authService.ts  # Authentication logic
│   ├── jobService.ts   # Job management
│   └── ...
├── lib/               # Utilities
│   └── supabase.ts    # Database configuration
├── i18n/              # Internationalization
│   └── locales/       # Language files
└── styles/            # CSS files
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🌐 Demo Mode vs Production Mode

### Demo Mode (Default):
- Works without Supabase setup
- Uses mock data for demonstration
- All features functional with sample data
- Perfect for testing and development

### Production Mode:
- Requires Supabase configuration
- Real database operations
- User authentication and data persistence
- Ready for deployment

## 🚀 Deployment

### Build for Production:
```bash
npm run build
```

### Deploy Options:
- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag and drop `dist` folder
- **Supabase Hosting**: Use Supabase's hosting service

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use**:
   ```bash
   # Kill process on port 5173
   npx kill-port 5173
   npm run dev
   ```

2. **Module not found errors**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Supabase connection issues**:
   - Check `.env` file configuration
   - Verify Supabase project is active
   - App will fallback to demo mode if Supabase unavailable

4. **TypeScript errors**:
   ```bash
   # Run type checking
   npm run type-check
   ```

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔒 Security Features

- Secure authentication with Supabase
- Row Level Security (RLS) policies
- Input validation and sanitization
- Protected routes and API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the demo mode functionality

---

**Happy Farming! 🌾**