# Quick Start Deployment Guide

This guide will help you get the Benz Scribe Creative Craft application up and running quickly.

## Prerequisites

- Node.js (v18 or later recommended)
- npm package manager
- Git
- Docker Desktop (optional, for Docker deployment)

## Option 1: Quick Start with Windows

1. **Clone the repository** (if you haven't already):
   ```
   git clone <repository-url>
   cd benz-scribe-creative-craft
   ```

2. **Run the deployment script**:
   ```
   deploy.bat
   ```

3. **Choose an option** from the menu:
   - Option 1: Build and run with Docker
   - Option 2: Build for production
   - Option 3: Docker Compose (app + mock proxy)
   - Option 4: Start mock proxy only
   - Option 5: Exit

## Option 2: Quick Start with Docker

1. **Install Docker** if you haven't already.

2. **Build and run the application**:
   ```
   docker build -t benz-scribe-app .
   docker run -p 8080:80 benz-scribe-app
   ```

3. **Access the application** at http://localhost:8080

## Option 3: Quick Start with npm

1. **Install dependencies**:
   ```
   npm install
   ```

2. **Run in development mode**:
   ```
   npm run dev
   ```

3. **Build for production**:
   ```
   npm run build
   ```

4. **Preview production build**:
   ```
   npm run preview
   ```

## Option 4: Deploy to Vercel (Easiest)

1. **Create a Vercel account** at [vercel.com](https://vercel.com).

2. **Install Vercel CLI**:
   ```
   npm install -g vercel
   ```

3. **Deploy with one command**:
   ```
   vercel
   ```

## Running the Mock Proxy Server

The application requires a mock proxy server for SerpAPI:

1. **Open a new terminal window**.

2. **Run the mock proxy server**:
   ```
   node src/services/simple-proxy.cjs
   ```

3. The proxy server will be available at http://localhost:3333.

## Detailed Documentation

For more detailed deployment instructions, please refer to:

- [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide
- [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - Windows-specific instructions

## Troubleshooting

If you encounter any issues during deployment:

1. **Check the console** for error messages.
2. **Verify prerequisites** are correctly installed.
3. **Ensure ports 8080 and 3333** are available and not in use by other applications.
4. **Check your network settings** if using Docker or container services. 