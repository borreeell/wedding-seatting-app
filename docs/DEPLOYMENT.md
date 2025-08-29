# 🚀 Wedding Seating App – Full Deployment Guide

This guide explains how to deploy the ***Vue frontend + Node.js/Express backend + MySQL database*** on an ***Ubuntu server with OpenLiteSpeed*** with SSL enabled and auto-renewal.

## 1. Update you server
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Install Node.js, npm, and PM2
```bash
sudo apt install -y nodejs npm
sudo npm install -g pm2
```
Verify installation:
```bash
node -v
npm -v
pm2 -v
```

## 3. Install OpenLiteSpeed
```bash
sudo apt install -y wget
sudo wget -O - https://repo.litespeed.sh | sudo bash
sudo apt install -y openlitespeed
```

## 4. Install and secure MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

## 5. Setup project:
Install Git if not already installed:
```bash
sudo apt install -y git
```

Clone project repository:
```bash
cd /var/www
git clone https://github.com/borreeell/wedding-seatting-app.git
cd wedding-seating-app
```

Install dependencies for backend and frontend:
```bash
cd backend
npm install
cd ..
npm install
```

## 6. Create MySQL database and user
```bash
sudo mysql -u root -p
```
Inside the MySQL shell, run:
```sql
CREATE DATABASE wedding_seating;
CREATE USER 'wedding_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON wedding_seating.* TO 'wedding_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
✅ Save credentials into .env in backend folder:
```bash
cd backend
nano .env
```
Add the following lines (replace `your_password` with the password you set):
```python
DB_HOST=localhost
DB_USER=wedding_user
DB_PASSWORD=your_password
DB_NAME=wedding_seating
DB_PORT=3306 # If the port is not set, it defaults to 3306
```

## 7. Build Vue frontend
Install frontend dependencies and build:
```bash
cd /var/www/wedding-seating-app
npm install
npm run build
```
This generates a `dist/` folder.
Copy it into your OpenLiteSpeed web root:
```bash
sudo cp -r dist/* /usr/local/lsws/Example/html/
```

## 8. Setup Backend
```bash
cd /var/www/wedding-seating-app/backend
npm install
```

Start backend with PM2:
```bash
pm2 start server.js --name wedding-backend
pm2 save
pm2 startup
```

## 9. Configure OpenLiteSpeed
1. Login to OpenLiteSpeed WebAdmin Console at (`http://your_server_ip:7080`).
2. Go to *** Virtual Hosts *** > *** Example *** > *** External App ***.
3. Add a new ***External App***:
   - Type: ***Web Server***
   - Name: `WeedingBackend`
   - Address: `127.0.0.1:3000` (or the port your backend is running on)

## 10. Configure SSL with Let's Encrypt
Install Certbot:
```bash
sudo apt install -y certbot
```

Obtain SSL certificate:
```bash
sudo certbot certonly --webroot -w /usr/local/lsws/Example/html/ -d yourdomain.com
```

Configure OpenLiteSpeed to use the SSL certificate:
1. Virtual Hosts -> Example -> SSL -> Add.
   - Private Key File: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
   - Certificate File: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
Save and do ***Graceful Restart***

## 11. Set up auto-renewal for SSL
Create a cron job:
```bash
sudo crontab -e
```

Add the following line:
```bash
3 * * * certbot renew --quiet && systemctl restart lsws
```

## Additional Notes
- Ensure your firewall allows traffic on ports 80 and 443.
- You can monitor your backend with PM2 using `pm2 status` and view logs with `pm2 logs wedding-backend`.
- For any issues, check OpenLiteSpeed logs located at `/usr/local/lsws/logs/`.
- Make sure to replace `yourdomain.com` and `your_password` with your actual domain and a strong password.
- Regularly back up your database and important files.
- For production, consider setting up a reverse proxy and load balancer for better performance and security.
