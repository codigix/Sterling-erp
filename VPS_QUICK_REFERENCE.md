# Sterling ERP - VPS Quick Reference Guide

## ⚡ Quick Commands

### Application Management

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Stop application
pm2 stop sterling-backend

# Restart application
pm2 restart sterling-backend

# View logs
pm2 logs sterling-backend

# View status
pm2 status

# Monitor resources
pm2 monit
```

### Database Operations

```bash
# Connect to database
mysql -u sterling_user -p -h localhost sterling_erp

# Backup database
mysqldump -u sterling_user -p sterling_erp > backup.sql

# Restore database
mysql -u sterling_user -p sterling_erp < backup.sql

# Check database size
SELECT table_schema, SUM(data_length + index_length) / 1024 / 1024 AS size_mb 
FROM information_schema.tables 
WHERE table_schema = 'sterling_erp' 
GROUP BY table_schema;
```

### System Monitoring

```bash
# Check CPU and memory
top

# Check disk usage
df -h

# Check free memory
free -h

# Check running processes
ps aux | grep node

# Monitor Nginx
sudo systemctl status nginx

# Monitor MySQL
sudo systemctl status mysql
```

### Log Viewing

```bash
# Application logs
pm2 logs sterling-backend

# Nginx access log
sudo tail -f /var/log/nginx/sterling-access.log

# Nginx error log
sudo tail -f /var/log/nginx/sterling-error.log

# MySQL log
sudo tail -f /var/log/mysql/error.log

# System logs
sudo journalctl -u sterling-erp -n 100
```

### Port & Network

```bash
# Check open ports
sudo netstat -tuln

# Check specific port
sudo lsof -i :5001

# Check if service is listening
curl http://localhost:5001/api/health

# Check DNS resolution
nslookup your_domain.com
```

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5001
sudo lsof -i :5001

# Kill process
sudo kill -9 <PID>

# Or use PM2 to restart
pm2 restart sterling-backend
```

### Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Check connectivity
mysql -u sterling_user -p -h localhost sterling_erp

# Check logs
sudo tail -f /var/log/mysql/error.log
```

### High Memory Usage
```bash
# Check memory usage
free -h

# Check which process is using memory
ps aux | sort -nrk 4 | head -10

# Restart application to free memory
pm2 restart sterling-backend

# Increase swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### File Upload Issues
```bash
# Check upload directory permissions
ls -la backend/uploads/

# Fix permissions
sudo chown -R www-data:www-data backend/uploads
sudo chmod -R 755 backend/uploads

# Check disk space
df -h

# Check file size limits
sudo sysctl fs.file-max
```

### SSL Certificate Issues
```bash
# Check certificate expiry
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/your_domain.com/cert.pem

# Renew certificate
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal

# Check certificate
sudo certbot certificates
```

### Nginx/Apache Not Starting
```bash
# Check Nginx syntax
sudo nginx -t

# Check Apache syntax
sudo apache2ctl configtest

# Check logs
sudo journalctl -u nginx -n 20
sudo journalctl -u apache2 -n 20
```

---

## 📊 Performance Tuning

### Increase Node.js Memory
```bash
# Edit PM2 config
pm2 delete sterling-backend
NODE_OPTIONS="--max_old_space_size=2048" pm2 start ecosystem.config.js --env production
pm2 save
```

### Database Query Optimization
```bash
# Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';
SET GLOBAL long_query_time = 2;

# View slow queries
sudo tail -f /var/log/mysql/slow-query.log

# Find missing indexes
SELECT * FROM information_schema.statistics 
WHERE table_schema = 'sterling_erp' 
GROUP BY table_name;
```

### Nginx Performance
```bash
# Check worker processes
sudo nginx -T | grep worker_processes

# Increase if needed
sudo nano /etc/nginx/nginx.conf
# Set: worker_processes auto;
# Save and reload
sudo systemctl reload nginx
```

---

## 🔐 Security Checks

```bash
# Check open ports
sudo ss -tuln

# Check firewall status
sudo ufw status

# Check fail2ban (if installed)
sudo fail2ban-client status

# Check SSL/TLS
openssl s_client -connect your_domain.com:443

# Check security headers
curl -i https://your_domain.com | grep -i "strict-transport\|content-type\|x-frame"

# Check for exposed credentials in git
git log -p | grep -i "password\|secret\|token" | head -5
```

---

## 💾 Backup & Recovery

### Manual Backup
```bash
# Backup database
mkdir -p /home/$USER/backups
mysqldump -u sterling_user -p sterling_erp > /home/$USER/backups/sterling_$(date +%Y%m%d_%H%M%S).sql

# Backup uploaded files
tar -czf /home/$USER/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/

# Backup entire project
tar -czf /home/$USER/backups/sterling_erp_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  /path/to/sterling-erp/
```

### Restore from Backup
```bash
# Restore database
mysql -u sterling_user -p sterling_erp < backup.sql

# Restore uploads
tar -xzf uploads_20240112_120000.tar.gz -C /

# Restore project
tar -xzf sterling_erp_20240112_120000.tar.gz -C /
cd sterling-erp
npm install --production
pm2 start ecosystem.config.js --env production
```

---

## 📈 Monitoring Setup

### Using PM2 Plus (Optional)
```bash
# Link PM2 to cloud monitoring
pm2 link <secret_key> <public_key>

# View dashboard
# https://app.pm2.io
```

### Using New Relic (Optional)
```bash
# Install New Relic
npm install newrelic

# Add to server.js (first line)
# require('newrelic');

# Configure
npm install -g newrelic-cli
newrelic create --name="Sterling ERP"
```

### Manual Monitoring Script
```bash
# Create monitoring script
cat > /home/$USER/monitor.sh << 'EOF'
#!/bin/bash
while true; do
  clear
  echo "=== Sterling ERP Monitoring ==="
  echo ""
  echo "Application Status:"
  pm2 status | grep sterling-backend
  echo ""
  echo "System Resources:"
  free -h | grep Mem
  df -h | grep /
  echo ""
  echo "Process Count:"
  ps aux | grep node | grep -v grep | wc -l
  echo ""
  date
  sleep 10
done
EOF

chmod +x /home/$USER/monitor.sh
./monitor.sh
```

---

## 🚀 Deployment Verification

### Pre-Launch Checklist
```bash
# 1. Test API endpoints
curl -X GET http://localhost:5001/api/health
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 2. Test database
mysql -u sterling_user -p -e "SELECT 1 FROM sterling_erp.users LIMIT 1;"

# 3. Test file upload
# (Test via web interface)

# 4. Check SSL
openssl s_client -connect your_domain.com:443 -showcerts

# 5. Performance test
ab -n 100 -c 10 http://your_domain.com/api/health

# 6. Test disaster recovery
mysqldump -u sterling_user -p sterling_erp | wc -l
# Ensure backup is substantial
```

---

## 📞 Support Information

### Check Application Version
```bash
cat backend/package.json | grep '"version"'
```

### Generate System Report
```bash
uname -a
lsb_release -d
node -v
npm -v
mysql --version
```

### Collect Debug Information
```bash
# Create debug bundle
mkdir -p debug_info
pm2 logs sterling-backend > debug_info/pm2.log 2>&1 &
ps aux > debug_info/processes.txt
free -h > debug_info/memory.txt
df -h > debug_info/disk.txt
netstat -tuln > debug_info/ports.txt
sudo journalctl > debug_info/system.log
mysql -u sterling_user -p sterling_erp -e "SELECT 1 FROM users LIMIT 1;" > debug_info/db.txt 2>&1

tar -czf debug_info_$(date +%Y%m%d_%H%M%S).tar.gz debug_info/
```

---

## 🎯 Daily Tasks

### Morning Check
```bash
pm2 status
pm2 logs sterling-backend | head -20
df -h
free -h
```

### Weekly Maintenance
```bash
# Backup
mysqldump -u sterling_user -p sterling_erp > weekly_backup_$(date +%Y%m%d).sql

# Check logs for errors
sudo journalctl -u nginx -n 100 | grep error
sudo tail -f /var/log/mysql/error.log

# Check for disk space issues
df -h
```

### Monthly Review
```bash
# Database optimization
mysql -u sterling_user -p sterling_erp -e "OPTIMIZE TABLE *;"

# Check SSL expiry
sudo certbot certificates

# Review security
sudo ufw status
sudo fail2ban-client status

# Performance review
# Check PM2 memory usage
pm2 status
```

---

## 🔗 Useful Links

- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start
- Nginx Documentation: https://nginx.org/en/docs/
- MySQL Documentation: https://dev.mysql.com/doc/
- Let's Encrypt: https://letsencrypt.org/
- Node.js Best Practices: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

## ✅ Emergency Contacts

- Keep backup files in 3 different locations
- Document all custom configurations
- Maintain a deployment log with dates and changes
- Keep admin credentials in secure password manager
- Have rollback plan for major updates
