# Windows Deployment Guide for Benz Scribe Creative Craft

This guide provides Windows-specific instructions for deploying the application.

## Prerequisites

- Node.js (v18 or later recommended)
- npm package manager
- Git
- Docker Desktop for Windows (optional, for Docker deployment)

## Local Development

To run the application locally:

```powershell
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Option 1: Deploy Using Vercel for Windows

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```powershell
   vercel login
   ```

3. **Deploy the application**:
   ```powershell
   vercel
   ```

4. **For production deployment**:
   ```powershell
   vercel --prod
   ```

## Option 2: Deploy Using Netlify for Windows

1. **Install Netlify CLI**:
   ```powershell
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```powershell
   netlify login
   ```

3. **Deploy the application**:
   ```powershell
   # Build the app
   npm run build

   # Deploy using Netlify CLI
   netlify deploy
   ```

4. **For production deployment**:
   ```powershell
   netlify deploy --prod
   ```

## Option 3: Deploy to GitHub Pages from Windows

1. **Add the gh-pages package**:
   ```powershell
   npm install --save-dev gh-pages
   ```

2. **Add the following to your package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy to GitHub Pages**:
   ```powershell
   npm run deploy
   ```

## Option 4: Docker Deployment on Windows

### Installing Docker Desktop for Windows

1. Download Docker Desktop for Windows from the [official Docker website](https://www.docker.com/products/docker-desktop/).
2. Install Docker Desktop following the installation wizard.
3. Start Docker Desktop and ensure it's running properly.

### Building and Running the Docker Container

1. **Open PowerShell** in your project directory.

2. **Build the Docker image**:
   ```powershell
   docker build -t benz-scribe-app .
   ```

3. **Run the Docker container**:
   ```powershell
   docker run -p 8080:80 benz-scribe-app
   ```

4. **Access the application** at http://localhost:8080

### Using Docker Compose on Windows

1. **Open PowerShell** in your project directory.

2. **Run the application with Docker Compose**:
   ```powershell
   docker-compose up --build
   ```

3. **Access the application** at http://localhost:8080

## Option 5: Deploying to IIS (Internet Information Services)

1. **Enable IIS** on your Windows machine if not already enabled:
   - Open Control Panel > Programs > Programs and Features
   - Click "Turn Windows features on or off"
   - Check "Internet Information Services" and ensure "Web Management Tools" and "World Wide Web Services" are selected
   - Click OK and wait for the installation to complete

2. **Build your application**:
   ```powershell
   npm run build
   ```

3. **Create a new website in IIS**:
   - Open IIS Manager
   - Right-click on "Sites" and select "Add Website"
   - Enter a site name (e.g., "BenzScribeApp")
   - Set the physical path to the `dist` folder of your project
   - Set the binding (typically hostname:port or IP:port)
   - Click OK

4. **Configure URL Rewrite for SPA routing**:
   - Install the URL Rewrite module for IIS if not already installed
   - In IIS Manager, select your website
   - Double-click on "URL Rewrite"
   - Click "Add Rule(s)" and select "Blank rule"
   - Set the following:
     - Name: `SPA_Rewrite`
     - Pattern: `^(?!.*\.(js|css|ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|map|json)).*$`
     - Action type: `Rewrite`
     - Rewrite URL: `index.html`
   - Click Apply

5. **Set up proper MIME types**:
   - Ensure that IIS is configured to serve .js files as application/javascript
   - If needed, add MIME types for other file extensions used in your application

## Running the Mock Proxy on Windows

To run the mock proxy server on Windows:

1. **Open a new PowerShell window**.

2. **Navigate to your project directory**:
   ```powershell
   cd path\to\your\project
   ```

3. **Run the mock proxy server**:
   ```powershell
   node src/services/simple-proxy.cjs
   ```

4. The proxy server should now be running on http://localhost:3333

## Troubleshooting Windows-Specific Issues

### EACCES or Permission Denied Errors

If you encounter permission errors when running commands:

1. Try running PowerShell as Administrator
2. Check your Node.js installation
3. Ensure you have write permissions to the project directory

### Port Already in Use

If port 8080 or 3333 is already in use:

1. Find the process using the port:
   ```powershell
   netstat -ano | findstr :8080
   ```

2. Kill the process (replace PID with the actual process ID):
   ```powershell
   taskkill /F /PID <PID>
   ```

### Docker Issues on Windows

1. **WSL Integration**: Ensure Docker Desktop is configured to use WSL 2 for better performance.

2. **Path Issues**: If you have path issues when mounting volumes, use the full Windows path format:
   ```powershell
   docker run -v C:/Users/username/project:/app -p 8080:80 benz-scribe-app
   ```

3. **Host Networking**: If the container can't access services on your host machine, use `host.docker.internal` as the hostname.

## Recommended Windows Development Tools

- **Visual Studio Code**: Excellent editor for web development
- **Windows Terminal**: Modern terminal application for Windows
- **WSL2 (Windows Subsystem for Linux)**: Provides a Linux environment on Windows
- **Git for Windows**: Includes Git Bash which provides Unix-like command line 