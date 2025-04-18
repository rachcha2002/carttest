# CraveCart - User Service

This is the User Service microservice for the CraveCart food delivery platform. It handles user authentication, registration, and user management for different roles (customers, restaurants, delivery personnel, and admins).

## Features

- User registration and authentication using JWT
- Role-based access control (customer, restaurant, delivery, admin)
- User profile management
- Restaurant verification workflow
- Delivery personnel location and availability management
- Secure password handling

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Docker & Docker Compose for containerization

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (either locally or using MongoDB Atlas)
- Docker and Docker Compose (for containerized deployment)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb+srv://cravecartlk:cravecart123@cluster0.8qk0a8n.mongodb.net/cravecart
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
SERVICE_NAME=user-service
NODE_ENV=development
```

## Installation

### Local Development

1. Clone the repository:

   ```
   git clone https://github.com/rachcha2002/cravecart.git
   cd cravecart/services/user-service
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Docker Deployment

1. Build and start the container:

   ```
   docker-compose up -d
   ```

2. Stop the container:
   ```
   docker-compose down
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and get JWT token
- **GET /api/auth/me** - Get current user profile
- **POST /api/auth/change-password** - Change user password
- **POST /api/auth/logout** - Logout (client-side)

### User Management

- **GET /api/users** - Get all users (admin only)
- **GET /api/users/:id** - Get user by ID
- **PUT /api/users/:id** - Update user
- **PATCH /api/users/:id/status** - Update user status (admin only)
- **PATCH /api/users/:id/verify** - Verify user (admin only)
- **DELETE /api/users/:id** - Delete user (admin only)

### Restaurant Endpoints

- **GET /api/users/restaurants/nearby** - Get nearby restaurants

### Delivery Personnel Endpoints

- **PATCH /api/users/delivery/location** - Update delivery personnel location
- **PATCH /api/users/delivery/availability** - Update delivery availability status
- **GET /api/users/delivery/available** - Get available delivery personnel

## Testing

Run tests with:

```
npm test
```

## License

ISC

# user-service

Microservice for the Food Delivery System.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`.

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

Documentation of the API endpoints will be added here.
