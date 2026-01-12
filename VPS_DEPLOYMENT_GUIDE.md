# Sterling ERP - VPS Deployment Guide

## Pre-Deployment Checklist

### System Requirements
- [ ] Linux VPS with Ubuntu 18.04+ or CentOS 7+ (recommended: Ubuntu 20.04 LTS)
- [ ] Node.js v14.0.0+ installed
- [ ] npm v6.0.0+ installed
- [ ] MySQL/MariaDB 5.7+ installed and running
- [ ] Nginx or Apache web server
- [ ] Git installed
- [ ] SSH access with sudo privileges
- [ ] Domain name with DNS configured

### Environment & Security
- [ ] Generate strong JWT_SECRET
- [ ] Prepare database credentials (not using defaults)
- [ ] Prepare email/SMTP credentials
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Firewall configured (ufw/iptables)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled

---

## Step 1: Initial Server Setup

### 1.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js and npm
sudo apt install -y nodejs
node -v
npm -v
```

### 1.3 Install MySQL
```bash
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 1.4 Install Nginx
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

---

## Step 2: Database Setup

### 2.1 Create Database and User
```bash
sudo mysql -u root -p

# Inside MySQL shell:
CREATE DATABASE sterling_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sterling_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON sterling_erp.* TO 'sterling_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Verify Connection
```bash
mysql -u sterling_user -p -h localhost sterling_erp
# Should connect successfully
```

---

## Step 3: Application Deployment

### 3.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/your-username/Sterling-erp.git
cd Sterling-erp
sudo chown -R $USER:$USER .
```

### 3.2 Create Environment Files

#### Backend .env
```bash
cp .env.production.example .env

# Edit with production values
nano .env
```

**Required .env variables:**
```
DB_HOST=localhost
DB_USER=sterling_user
DB_PASSWORD=your_secure_database_password
DB_NAME=sterling_erp
API_HOST=your_domain.com
API_PORT=5001
JWT_SECRET=your_secure_jwt_secret_min_32_chars
PORT=5001
NODE_ENV=production
VITE_API_URL=https://your_domain.com/api
FRONTEND_URL=https://your_domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@your_domain.com
```

#### Frontend .env
```bash
cp frontend/.env frontend/.env.production
nano frontend/.env.production
```

**Content:**
```
VITE_API_URL=https://your_domain.com/api
```

### 3.3 Install Dependencies
```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..
```

### 3.4 Initialize Database
```bash
cd backend
node initDb.js
cd ..
```

---

## Step 4: Create Necessary Directories

```bash
# Create uploads directories
mkdir -p backend/uploads/{design-engineering,engineering,po_attachments,quotation_attachments}

# Set proper permissions
sudo chown -R www-data:www-data backend/uploads
chmod -R 755 backend/uploads
chmod -R 644 backend/uploads/*

# Create logs directory
mkdir -p logs
sudo chown -R www-data:www-data logs
chmod -R 755 logs
```

---

## Step 5: Web Server Configuration

### 5.1 Nginx Configuration
```bash
# Copy example configuration
cp nginx.conf.example /tmp/sterling-nginx.conf

# Edit configuration with your domain
sudo nano /tmp/sterling-nginx.conf

# Create symbolic link
sudo ln -s /tmp/sterling-nginx.conf /etc/nginx/sites-available/sterling-erp

# Enable site
sudo a2ensite sterling-erp

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.2 OR Apache Configuration
```bash
# Copy example configuration
cp apache.conf.example /tmp/sterling-apache.conf

# Edit configuration with your domain
sudo nano /tmp/sterling-apache.conf

# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers

# Create symbolic link
sudo ln -s /tmp/sterling-apache.conf /etc/apache2/sites-available/sterling-erp.conf

# Enable site
sudo a2ensite sterling-erp.conf

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Step 6: SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot

# For Nginx
sudo apt install -y python3-certbot-nginx
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# For Apache
sudo apt install -y python3-certbot-apache
sudo certbot --apache -d your_domain.com -d www.your_domain.com

# Auto-renewal setup
sudo certbot renew --dry-run

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## Step 7: Application Startup with PM2

### 7.1 Start with PM2
```bash
cd /var/www/Sterling-erp

# Start backend with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup on reboot
pm2 startup
# Follow the command output to enable startup
```

### 7.2 Monitor PM2
```bash
# View logs
pm2 logs sterling-backend

# View all processes
pm2 status

# Restart application
pm2 restart sterling-backend

# Stop application
pm2 stop sterling-backend
```

---

## Step 8: Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny API port from external access (if using Nginx/Apache)
sudo ufw deny 5001

# Check status
sudo ufw status
```

---

## Step 9: Backup & Maintenance

### 9.1 Database Backup
```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u sterling_user -p sterling_erp > $BACKUP_DIR/sterling_erp_$DATE.sql
echo "Backup completed: $BACKUP_DIR/sterling_erp_$DATE.sql"
EOF

chmod +x backup-db.sh

# Schedule backup (every day at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup-db.sh") | crontab -
```

### 9.2 Log Rotation
```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/sterling-erp << 'EOF'
/path/to/sterling-erp/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload all > /dev/null 2>&1 || true
    endscript
}
EOF
```

---

## Step 10: Monitoring & Health Checks

### 10.1 Health Check Endpoint
```bash
# Test API health
curl https://your_domain.com/api/health

# Should return: {"status":"OK","timestamp":"..."}
```

### 10.2 Monitor Application
```bash
# View PM2 monitoring
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/sterling-access.log
sudo tail -f /var/log/nginx/sterling-error.log

# View MySQL logs
sudo tail -f /var/log/mysql/error.log
```

---

## Common Issues & Solutions

### Issue 1: Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check if server is running
sudo mysql -u sterling_user -p -h localhost

# Check .env variables
grep DB_ /path/to/sterling-erp/.env
```

### Issue 2: Port Already in Use
```bash
# Find process using port 5001
sudo lsof -i :5001

# Kill process (if needed)
sudo kill -9 <PID>
```

### Issue 3: Permission Denied on Uploads
```bash
# Fix permissions
sudo chown -R www-data:www-data /path/to/sterling-erp/backend/uploads
sudo chmod -R 755 /path/to/sterling-erp/backend/uploads
```

### Issue 4: SSL Certificate Errors
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

---

## Performance Optimization

### 10.1 Database Optimization
```bash
# Run MySQL optimization
OPTIMIZE TABLE sales_orders, root_cards, etc.;
```

### 10.2 Node.js Optimization
```bash
# Increase Node.js memory
NODE_OPTIONS="--max_old_space_size=2048" pm2 restart sterling-backend
```

### 10.3 Nginx Caching
```bash
# Already configured in nginx.conf.example
# Static files cached for 1 year
# Check nginx.conf for gzip settings
```

---

## Deployment Verification Checklist

- [ ] SSH access working
- [ ] Node.js and npm installed correctly
- [ ] MySQL running and accessible
- [ ] Git clone successful
- [ ] .env files created and configured
- [ ] Database initialized successfully
- [ ] Backend dependencies installed
- [ ] Frontend built successfully
- [ ] Upload directories created with correct permissions
- [ ] Nginx/Apache configured correctly
- [ ] SSL certificate installed
- [ ] PM2 started successfully
- [ ] Health endpoint responding: `curl https://your_domain.com/api/health`
- [ ] Frontend accessible: `https://your_domain.com`
- [ ] API responding: `curl https://your_domain.com/api/auth/login`
- [ ] Firewall configured
- [ ] Backup script created
- [ ] Logs being written correctly

---

## Troubleshooting Commands

```bash
# Check application status
pm2 status
pm2 logs sterling-backend

# Check port availability
sudo netstat -tuln | grep 5001

# Test database connection
mysql -u sterling_user -p -h localhost sterling_erp

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# View system resources
top
df -h
free -h

# Check file permissions
ls -la /var/www/Sterling-erp/backend/uploads

# Restart all services
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysql
```

---

## Security Checklist

- [ ] Changed all default passwords
- [ ] Disabled root MySQL login
- [ ] Enabled firewall
- [ ] SSH key-based authentication configured
- [ ] Root SSH login disabled
- [ ] Strong JWT_SECRET generated
- [ ] HTTPS/SSL enforced
- [ ] CORS properly configured
- [ ] API rate limiting enabled
- [ ] Security headers set in Nginx/Apache
- [ ] Regular backups scheduled
- [ ] Log monitoring configured
- [ ] .env file not in version control

---

## Support & Troubleshooting

For detailed logs and diagnostics:
```bash
# Collect diagnostic information
pm2 logs sterling-backend
sudo journalctl -u sterling-erp -n 100

# Test application connectivity
curl -v https://your_domain.com/api/health
curl -v -X POST https://your_domain.com/api/auth/login
```

---

## Additional Resources

- Node.js: https://nodejs.org/
- PM2: https://pm2.keymetrics.io/
- Nginx: https://nginx.org/
- MySQL: https://dev.mysql.com/
- Let's Encrypt: https://letsencrypt.org/
- UFW Firewall: https://help.ubuntu.com/community/UFW
