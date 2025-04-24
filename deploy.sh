#!/bin/bash
# Simple deployment script for Benz Scribe Creative Craft

# Print colored messages
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Display header
echo "========================================================"
echo "        Benz Scribe Creative Craft Deployment           "
echo "========================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Some deployment options may not work."
fi

# Menu for deployment options
echo "Select a deployment option:"
echo "1) Build and run locally with Docker"
echo "2) Build for production (creates dist folder)"
echo "3) Docker Compose (app + mock proxy)"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Building and running the application with Docker..."
        docker build -t benz-scribe-app .
        if [ $? -eq 0 ]; then
            print_success "Docker image built successfully!"
            print_info "Starting the container..."
            docker run -p 8080:80 benz-scribe-app
        else
            print_error "Docker build failed!"
        fi
        ;;
    2)
        print_info "Building for production..."
        npm run build
        if [ $? -eq 0 ]; then
            print_success "Build successful! Files are in the 'dist' folder."
            print_info "You can deploy these files to any static web server."
        else
            print_error "Build failed!"
        fi
        ;;
    3)
        print_info "Starting the application with Docker Compose..."
        docker-compose up --build
        ;;
    4)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

print_success "Deployment script completed!" 