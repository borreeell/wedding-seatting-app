# Deployment Guide

This guide explains how to deploy the Wedding Seating Application to a production server. In this example, we will use a Linux server with Node.js and OpenLiteSpeed but you are able to use any other web server.

## Prerequisites

- Node.js v14 or higher installed on the server
- PM2 or similar process manager for running Node.js applications
- Nginx or Apache as a reverse proxy
- SSL certificate for HTTPS (recommended)

## Deployment Steps
1. **Update your server packages:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js & npm**
    ```bash
    sudo apt install -y nodejs
    node -v
    npm -v
    ```

3. **Install PM2 (to keep backend runing)**
    ```bash
    sudo npm install -g pm2
    ```

4. **Clone the repository:**
   ```bash
    cd /var/www
    git clone https://github.com/borreeell/wedding-seatting-app
    cd wedding-seatting-app
    ```
You can also use FTP/SFTP to upload your project files to the server.

5. **Build the frontend:**
    ```bash
    npm install
    npm run build
    ```
    This will create a `dist` folder with the production-ready frontend files.
    Copy the contents of the `dist` folder to your web server's root directory (e.g., `/var/www/html`).
    ```bash
    sudo cp -r dist/* /usr/local/lsws/Example/html/
    ```

6. **Set up the backend:**
    ```bash
    cd ../backend # go to backend folder
    npm install
    ```
    Create a `.env` file in the `backend` directory with your database credentials:
    ```
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    DB_PORT=your_database_port
    ```
