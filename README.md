# Wedding Seating Application

A Vue 3 application to preview and manage different wedding seating layouts using an interactive carousel interface.

## 📋 Features

- Interactive seating arrangement interface
- Multiple layout options with customizable tables
- Guest list management
- Real-time updates and synchronization

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Clone the repository:
```bash
git clone https://github.com/borreeell/wedding-seatting-app.git
```

### Install dependencies for both frontend and backend:
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
npm install
```

### Create a local database: 
We recommend you to install [DBngin](https://dbngin.com/) and [MySQL](https://dev.mysql.com/downloads/workbench/) workbench as it is the used tools for this project.

#### Create a new MySQL server into DBngin:
![](/public/doc-resources/DBngin.png)

#### Create a database into MySQL Workbench:
![](/public/doc-resources/mysql-workbench.png)

#### Execute the SQL script to create the necessary tables:
Copy the content of [`db.sql`](./db.sql) file and paste it into the MySQL Workbench query editor, then execute it to create the required tables and inserts into the Database.



### Set up your environment variables:
Into the the the `backend` directory, create a `.env` file based on the following template:
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=your_database_port
```

### Start the development server:
```bash
# Start backend server
cd backend
node server.js

# In a new terminal, start frontend
cd ..
npm run dev
```
The frontend should be running at `http://localhost:5173` and the backend at `http://localhost:3000`.

## 📖 Documentation

This project is split into several documentation files so we recommend you to check them out before starting to work with the project:

- [Frontend Guide](docs/FRONTEND.md) - Frontend architecture and component details
- [API Documentation](docs/API.md) - API endpoint references
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying the application into a server
