# Sterling ERP - VPS Deployment Checklist

**Project**: Sterling ERP  
**Deployment Date**: ________________  
**Deployed By**: ________________  
**VPS Provider**: ________________  
**Domain**: ________________  

---

## ✅ Phase 1: Pre-Deployment (Do Before Deployment)

### System Requirements
- [ ] VPS provisioned with Ubuntu 18.04+ / CentOS 7+ / Debian 9+
- [ ] Minimum 2GB RAM available
- [ ] Minimum 10GB free disk space
- [ ] SSH access with sudo privileges
- [ ] Domain name registered and DNS configured

### Documentation Preparation
- [ ] Read VPS_DEPLOYMENT_GUIDE.md
- [ ] Review VPS_COMPATIBILITY_CHECKLIST.md
- [ ] Have VPS_QUICK_REFERENCE.md available
- [ ] Understand security requirements

### Credentials & Configuration
- [ ] Database user/password generated (strong)
- [ ] JWT secret generated (32+ characters)
- [ ] SMTP credentials obtained
- [ ] API domain/IP documented
- [ ] SSL certificate plan decided (Let's Encrypt)
- [ ] Web server chosen (Nginx/Apache)

### Code Preparation
- [ ] Repository cloned locally
- [ ] .env.production.example reviewed
- [ ] All environment variables documented
- [ ] Code pushed to git (if needed)
- [ ] Latest version verified

---

## ✅ Phase 2: VPS Setup (Initial Server Configuration)

### Update & Security
- [ ] Run: `sudo apt update && sudo apt upgrade -y`
- [ ] Configure firewall (UFW)
- [ ] Disable root SSH login
- [ ] Enable SSH key authentication
- [ ] Set timezone: `sudo timedatectl set-timezone UTC`

### Install Required Software
- [ ] Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs`
- [ ] Install npm: `npm -v` (verify)
- [ ] Install MySQL: `sudo apt install -y mysql-server`
- [ ] Install Nginx or Apache: `sudo apt install -y nginx` or `sudo apt install -y apache2`
- [ ] Install Git: `sudo apt install -y git`
- [ ] Install PM2: `sudo npm install -g pm2`

### Verify Installations
- [ ] `node -v` (should be 14+)
- [ ] `npm -v` (should be 6+)
- [ ] `mysql --version`
- [ ] `nginx -v` or `apache2 -v`
- [ ] `pm2 -v`

---

## ✅ Phase 3: Database Setup

### MySQL Configuration
- [ ] Start MySQL: `sudo systemctl start mysql && sudo systemctl enable mysql`
- [ ] Secure MySQL: `sudo mysql_secure_installation`
- [ ] Create database:
  ```sql
  CREATE DATABASE sterling_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```
- [ ] Create user:
  ```sql
  CREATE USER 'sterling_user'@'localhost' IDENTIFIED BY 'your_password';
  GRANT ALL PRIVILEGES ON sterling_erp.* TO 'sterling_user'@'localhost';
  FLUSH PRIVILEGES;
  ```
- [ ] Test connection: `mysql -u sterling_user -p -h localhost sterling_erp`

### Database Documentation
- [ ] Database name: `sterling_erp`
- [ ] Database user: `sterling_user`
- [ ] Password stored securely: ___________
- [ ] Connection verified: [ ]

---

## ✅ Phase 4: Application Deployment

### Clone & Setup
- [ ] Clone repository: `cd /var/www && git clone <repo-url> && cd Sterling-erp`
- [ ] Change ownership: `sudo chown -R $USER:$USER /var/www/Sterling-erp`
- [ ] Create .env file: `cp .env.production.example .env`
- [ ] Edit .env with production values: `nano .env`

### Create Directories
- [ ] Create uploads directories:
  ```bash
  mkdir -p backend/uploads/{design-engineering,engineering,po_attachments,quotation_attachments}
  ```
- [ ] Create logs directory: `mkdir -p logs`
- [ ] Set permissions:
  ```bash
  sudo chown -R www-data:www-data backend/uploads logs
  sudo chmod -R 755 backend/uploads logs
  ```

### Install Dependencies
- [ ] Backend: `cd backend && npm install --production && cd ..`
- [ ] Frontend: `cd frontend && npm install && npm run build && cd ..`
- [ ] Verify builds completed without errors: [ ]

### Initialize Database
- [ ] Run migrations: `cd backend && node initDb.js && cd ..`
- [ ] Check for errors: [ ]
- [ ] Verify tables created: `mysql -u sterling_user -p sterling_erp -e "SHOW TABLES;"`

---

## ✅ Phase 5: Process Management (PM2)

### PM2 Setup
- [ ] Copy configuration: `cp ecosystem.config.js ecosystem.config.js.bak`
- [ ] Start application: `pm2 start ecosystem.config.js --env production`
- [ ] Check status: `pm2 status`
- [ ] Save configuration: `pm2 save`
- [ ] Enable startup: `pm2 startup` (follow instructions)

### PM2 Verification
- [ ] Process running: [ ]
- [ ] No errors in logs: `pm2 logs sterling-backend | head -20`
- [ ] Memory usage normal: `pm2 monit`
- [ ] Auto-restart configured: [ ]

---

## ✅ Phase 6: Web Server Configuration

### Nginx Setup (if chosen)
- [ ] Copy template: `cp nginx.conf.example /tmp/sterling-nginx.conf`
- [ ] Edit configuration: `nano /tmp/sterling-nginx.conf`
  - [ ] Update domain name
  - [ ] Update paths
  - [ ] Update SSL certificate paths
- [ ] Enable site: `sudo ln -s /tmp/sterling-nginx.conf /etc/nginx/sites-available/sterling-erp`
- [ ] Disable default: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Test syntax: `sudo nginx -t`
- [ ] Start service: `sudo systemctl start nginx && sudo systemctl enable nginx`

### Apache Setup (if chosen)
- [ ] Enable modules: `sudo a2enmod proxy proxy_http rewrite ssl headers`
- [ ] Copy template: `cp apache.conf.example /tmp/sterling-apache.conf`
- [ ] Edit configuration: `nano /tmp/sterling-apache.conf`
  - [ ] Update domain name
  - [ ] Update paths
  - [ ] Update SSL certificate paths
- [ ] Enable site: `sudo a2ensite sterling-apache.conf`
- [ ] Test syntax: `sudo apache2ctl configtest`
- [ ] Start service: `sudo systemctl start apache2 && sudo systemctl enable apache2`

### Web Server Verification
- [ ] Service running: [ ]
- [ ] Syntax valid: [ ]
- [ ] Listening on ports 80/443: `sudo netstat -tuln | grep -E ':(80|443)'`

---

## ✅ Phase 7: SSL Certificate (HTTPS)

### Let's Encrypt Setup
- [ ] Install certbot: `sudo apt install -y certbot`

### For Nginx
- [ ] Install plugin: `sudo apt install -y python3-certbot-nginx`
- [ ] Obtain certificate: `sudo certbot --nginx -d your_domain.com -d www.your_domain.com`
- [ ] Auto-renewal: `sudo systemctl enable certbot.timer && sudo systemctl start certbot.timer`

### For Apache
- [ ] Install plugin: `sudo apt install -y python3-certbot-apache`
- [ ] Obtain certificate: `sudo certbot --apache -d your_domain.com -d www.your_domain.com`
- [ ] Auto-renewal: `sudo systemctl enable certbot.timer && sudo systemctl start certbot.timer`

### SSL Verification
- [ ] Certificate installed: [ ]
- [ ] HTTPS accessible: `curl https://your_domain.com`
- [ ] Certificate valid: `sudo certbot certificates`
- [ ] Auto-renewal working: `sudo certbot renew --dry-run`

---

## ✅ Phase 8: Firewall Configuration

### UFW Firewall Rules
- [ ] Enable firewall: `sudo ufw enable`
- [ ] Allow SSH: `sudo ufw allow 22/tcp`
- [ ] Allow HTTP: `sudo ufw allow 80/tcp`
- [ ] Allow HTTPS: `sudo ufw allow 443/tcp`
- [ ] Deny API port: `sudo ufw deny 5001`
- [ ] Verify rules: `sudo ufw status`

---

## ✅ Phase 9: Health Checks & Verification

### API Endpoint Tests
- [ ] Health check: `curl https://your_domain.com/api/health`
- [ ] Expected response: `{"status":"OK","timestamp":"..."}`
- [ ] Login endpoint: `curl -X POST https://your_domain.com/api/auth/login`
- [ ] Database connected: [ ]

### Frontend Access
- [ ] Frontend loads: Visit `https://your_domain.com` in browser
- [ ] No console errors: [ ]
- [ ] Can interact with UI: [ ]

### File Upload Test
- [ ] Create test file
- [ ] Upload via UI
- [ ] Verify in backend/uploads directory
- [ ] File accessible: [ ]

### Database Test
- [ ] Connect: `mysql -u sterling_user -p -h localhost sterling_erp`
- [ ] Query test: `SELECT COUNT(*) FROM users;`
- [ ] Data present: [ ]

---

## ✅ Phase 10: Backups & Monitoring

### Automated Backups
- [ ] Create backup script: `cat > backup.sh << 'EOF'...`
- [ ] Test backup: `./backup.sh`
- [ ] Verify backup created: [ ]
- [ ] Schedule cron: `(crontab -l; echo "0 2 * * * /path/to/backup.sh") | crontab -`

### Monitoring Setup
- [ ] View logs: `pm2 logs sterling-backend`
- [ ] Monitor resources: `pm2 monit`
- [ ] Check disk usage: `df -h`
- [ ] Check memory: `free -h`

### Log Rotation
- [ ] Create logrotate config: `sudo tee /etc/logrotate.d/sterling-erp`
- [ ] Test: `sudo logrotate -f /etc/logrotate.d/sterling-erp`

---

## ✅ Phase 11: Security Hardening

### Additional Security
- [ ] Fail2ban installed: `sudo apt install -y fail2ban`
- [ ] Configure Fail2ban: `sudo nano /etc/fail2ban/jail.local`
- [ ] Enable: `sudo systemctl enable fail2ban && sudo systemctl start fail2ban`

### Application Security
- [ ] JWT secret is strong: ✓ (set in .env)
- [ ] Database password is strong: ✓ (set during MySQL setup)
- [ ] CORS properly configured: ✓ (in .env)
- [ ] Rate limiting enabled: ✓ (in code)
- [ ] No hardcoded credentials: ✓ (verified)

### System Security
- [ ] Root SSH login disabled: [ ]
- [ ] SSH key authentication only: [ ]
- [ ] Firewall enabled: [ ]
- [ ] Fail2ban active: [ ]
- [ ] Regular updates scheduled: [ ]

---

## ✅ Phase 12: Documentation & Handover

### Documentation Complete
- [ ] Deployment notes saved
- [ ] Credentials stored securely
- [ ] Configuration documented
- [ ] Admin account credentials saved
- [ ] Backup location documented
- [ ] Emergency contact list created

### Team Communication
- [ ] Team notified of deployment
- [ ] VPS details shared (securely)
- [ ] Access credentials distributed
- [ ] Troubleshooting guide shared
- [ ] Monitoring instructions provided

---

## 📋 Final Verification

### Complete System Check (Run Once)
```bash
# 1. Services status
pm2 status
sudo systemctl status nginx    # or apache2
sudo systemctl status mysql

# 2. Network check
curl -I https://your_domain.com
curl https://your_domain.com/api/health

# 3. Database check
mysql -u sterling_user -p -h localhost sterling_erp

# 4. Disk/Memory
df -h
free -h

# 5. Logs check
pm2 logs sterling-backend | head -10
```

### Sign-Off
- [ ] All phases completed
- [ ] All health checks passed
- [ ] No critical errors in logs
- [ ] Team informed and trained
- [ ] Ready for production use

**Deployment Completed**: ________________  
**Deployed By**: ________________  
**Reviewed By**: ________________  
**Date**: ________________  

---

## 🆘 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Port 5001 in use | `sudo lsof -i :5001` then `sudo kill -9 <PID>` |
| DB connection failed | Check .env credentials, restart MySQL |
| 502 Bad Gateway | Restart PM2: `pm2 restart all` |
| SSL certificate error | Run: `sudo certbot renew --force-renewal` |
| High memory usage | `pm2 restart sterling-backend` |
| Files not uploading | Check permissions: `sudo chown -R www-data:www-data backend/uploads` |

---

## 📞 After Deployment Support

- **Logs**: `pm2 logs sterling-backend`
- **Status**: `pm2 status`
- **Restart**: `pm2 restart sterling-backend`
- **Stop**: `pm2 stop sterling-backend`
- **Quick Ref**: See `VPS_QUICK_REFERENCE.md`
- **Full Guide**: See `VPS_DEPLOYMENT_GUIDE.md`

---

**Deployment Status**: ✅ COMPLETE

Print this checklist and check off each item as you complete it!
