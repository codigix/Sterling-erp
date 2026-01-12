#!/bin/bash

# Sterling ERP - Deployment Script for VPS
# Usage: ./deploy.sh

set -e

echo "================================================"
echo "Sterling ERP - VPS Deployment Script"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1 is installed${NC}"
    return 0
}

print_step() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
}

# Check if running with sudo for system commands
if [[ "$EUID" -ne 0 ]]; then
   echo -e "${RED}This script needs to be run with sudo for system configuration${NC}"
   echo "Run with: sudo ./deploy.sh"
   exit 1
fi

# Step 1: Check Requirements
print_step "Step 1: Checking System Requirements"

check_command "node" || exit 1
check_command "npm" || exit 1
check_command "mysql" || exit 1
check_command "git" || exit 1

node -v
npm -v
mysql --version

# Step 2: Install PM2 globally if not exists
print_step "Step 2: Setting up PM2"

if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 is already installed${NC}"
fi

# Step 3: Get project directory
print_step "Step 3: Determining Project Directory"

# If script is in project root
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Project directory: $PROJECT_DIR"

cd "$PROJECT_DIR"

# Step 4: Check if .env file exists
print_step "Step 4: Checking Environment Configuration"

if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Creating .env from .env.production.example..."
    
    if [ ! -f ".env.production.example" ]; then
        echo -e "${RED}✗ .env.production.example not found${NC}"
        exit 1
    fi
    
    cp .env.production.example .env
    echo -e "${YELLOW}⚠ Please edit .env with your production configuration:${NC}"
    echo "   nano .env"
    echo ""
    echo "Then run this script again."
    exit 0
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

# Step 5: Create necessary directories
print_step "Step 5: Creating Required Directories"

mkdir -p logs
mkdir -p backend/uploads/{design-engineering,engineering,po_attachments,quotation_attachments}
echo -e "${GREEN}✓ Directories created${NC}"

# Step 6: Install backend dependencies
print_step "Step 6: Installing Backend Dependencies"

cd backend
npm install --production
cd ..

echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Step 7: Build frontend
print_step "Step 7: Building Frontend"

cd frontend
npm install
npm run build
cd ..

echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 8: Initialize database
print_step "Step 8: Initializing Database"

cd backend
echo "Running database migrations..."
node initDb.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database initialized successfully${NC}"
else
    echo -e "${RED}✗ Database initialization failed${NC}"
    exit 1
fi
cd ..

# Step 9: Set file permissions
print_step "Step 9: Setting File Permissions"

echo "Setting upload directory permissions..."
chown -R www-data:www-data backend/uploads 2>/dev/null || true
chmod -R 755 backend/uploads

chown -R www-data:www-data logs 2>/dev/null || true
chmod -R 755 logs

echo -e "${GREEN}✓ File permissions set${NC}"

# Step 10: Start application with PM2
print_step "Step 10: Starting Application with PM2"

if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    
    echo -e "${GREEN}✓ Application started with PM2${NC}"
    echo "Check status: pm2 status"
    echo "View logs: pm2 logs sterling-backend"
else
    echo -e "${RED}✗ ecosystem.config.js not found${NC}"
    exit 1
fi

# Step 11: Configure web server
print_step "Step 11: Web Server Configuration"

echo ""
echo "Choose your web server:"
echo "1) Nginx"
echo "2) Apache"
echo "3) Skip (configure manually)"
read -p "Enter choice [1-3]: " ws_choice

case $ws_choice in
    1)
        echo ""
        echo "Nginx configuration:"
        echo "1. Copy nginx.conf.example to your nginx configuration:"
        echo "   sudo cp nginx.conf.example /tmp/sterling-nginx.conf"
        echo ""
        echo "2. Edit the configuration with your domain:"
        echo "   sudo nano /tmp/sterling-nginx.conf"
        echo ""
        echo "3. Create symbolic link:"
        echo "   sudo ln -s /tmp/sterling-nginx.conf /etc/nginx/sites-available/sterling-erp"
        echo ""
        echo "4. Enable site:"
        echo "   sudo a2ensite sterling-erp"
        echo ""
        echo "5. Test and reload:"
        echo "   sudo nginx -t"
        echo "   sudo systemctl reload nginx"
        ;;
    2)
        echo ""
        echo "Apache configuration:"
        echo "1. Enable required modules:"
        echo "   sudo a2enmod proxy proxy_http rewrite ssl headers"
        echo ""
        echo "2. Copy apache.conf.example to your Apache configuration:"
        echo "   sudo cp apache.conf.example /tmp/sterling-apache.conf"
        echo ""
        echo "3. Edit the configuration with your domain:"
        echo "   sudo nano /tmp/sterling-apache.conf"
        echo ""
        echo "4. Create symbolic link:"
        echo "   sudo ln -s /tmp/sterling-apache.conf /etc/apache2/sites-available/sterling-erp.conf"
        echo ""
        echo "5. Enable site:"
        echo "   sudo a2ensite sterling-erp.conf"
        echo ""
        echo "6. Test and reload:"
        echo "   sudo apache2ctl configtest"
        echo "   sudo systemctl reload apache2"
        ;;
    3)
        echo "Please configure your web server manually using the provided templates."
        ;;
    *)
        echo "Invalid choice"
        ;;
esac

# Step 12: SSL Configuration
print_step "Step 12: SSL Certificate Setup"

echo ""
echo "Install SSL certificate using Let's Encrypt:"
echo ""
echo "For Nginx:"
echo "  sudo apt install -y certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d your_domain.com"
echo ""
echo "For Apache:"
echo "  sudo apt install -y certbot python3-certbot-apache"
echo "  sudo certbot --apache -d your_domain.com"
echo ""

# Step 13: Firewall Configuration
print_step "Step 13: Firewall Configuration"

echo ""
echo "Recommended UFW firewall rules:"
echo "  sudo ufw allow 22/tcp      # SSH"
echo "  sudo ufw allow 80/tcp      # HTTP"
echo "  sudo ufw allow 443/tcp     # HTTPS"
echo "  sudo ufw deny 5001/tcp     # API (only via Nginx/Apache)"
echo "  sudo ufw enable"
echo ""

# Step 14: Final checks
print_step "Step 14: Deployment Complete!"

echo ""
echo -e "${GREEN}✓ Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure your web server (Nginx/Apache)"
echo "2. Set up SSL certificate"
echo "3. Configure firewall rules"
echo "4. Test health endpoint:"
echo "   curl http://localhost:5001/api/health"
echo ""
echo "Monitor application:"
echo "  pm2 status"
echo "  pm2 logs sterling-backend"
echo ""
echo "For detailed instructions, see: VPS_DEPLOYMENT_GUIDE.md"
echo ""
