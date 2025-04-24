# Benz Scribe Creative Craft

A modern article writing assistant with AI-powered content tools.

## Features

- Topic research and content planning
- Reference management from web sources and local files
- Keyword optimization for SEO
- Article title generation
- Content outline creation
- Article generation with customizable styles and parameters

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/benz-scribe-creative-craft.git
cd benz-scribe-creative-craft
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

## Running the Application

There are two components to run:

### 1. Start the Proxy Server

The proxy server is needed to bypass CORS restrictions when fetching data from external APIs:

```bash
# Start the proxy server 
node src/services/proxy.cjs
```

You should see output confirming the proxy is running:
```
Proxy server running on port 3001
Access the proxy at: http://localhost:3001/proxy?url=YOUR_URL_HERE
```

### 2. Start the Development Server

In a separate terminal, run:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) (or the URL shown in your terminal) in your browser.

## Deployment Options

This application can be deployed in several ways:

### Quick Deployment

For quick deployment, use one of the following options:

#### Windows Users
Run the deployment script and follow the prompts:
```
deploy.bat
```

#### macOS/Linux Users
Run the deployment script and follow the prompts:
```
./deploy.sh
```

### Cloud Deployment

The easiest way to deploy the application is using Vercel:
```
npm install -g vercel
vercel login
vercel
```

### Docker Deployment

To deploy using Docker:
```
docker build -t benz-scribe-app .
docker run -p 8080:80 benz-scribe-app
```

### Running Both Application and Proxy Server

With Docker Compose:
```
docker-compose up --build
```

For detailed deployment instructions, see:
- [QUICK_START.md](QUICK_START.md) - For getting started quickly
- [DEPLOYMENT.md](DEPLOYMENT.md) - For comprehensive deployment options
- [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - For Windows-specific instructions

## Troubleshooting

### Proxy Server Issues

If you see "Proxy server is not running" in the application:

1. Make sure you've started the proxy server with `node src/services/proxy.cjs`
2. Check that port 3001 is available (not used by another application)
3. If there are any issues, check the terminal where the proxy server is running for error messages

### API Integration Issues

If you're experiencing issues with references not loading in Step 3:

1. Check the browser console for any API errors
2. Verify your SerpAPI key is valid and has sufficient quota
3. Make sure the proxy server is running correctly
4. The application will automatically fall back to mock data if the API fails

## License

This project is licensed under the MIT License - see the LICENSE file for details.
