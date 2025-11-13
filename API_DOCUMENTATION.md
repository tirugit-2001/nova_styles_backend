# NovaStyles Backend API Documentation

## Base URLs

- **Production**: `https://nova-styles-backend.onrender.com/api/v1`
- **Development**: `http://localhost:8500/api/v1`
- **Swagger UI**: `https://nova-styles-backend.onrender.com/api-docs` (Production) or `http://localhost:8500/api-docs` (Development)

## Table of Contents

1. [Server Setup & Running Instructions](#server-setup--running-instructions)
2. [Authentication](#authentication)
3. [Admin Endpoints Summary](#admin-endpoints-summary)
4. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Product Endpoints](#product-endpoints)
   - [Portfolio Endpoints](#portfolio-endpoints)
   - [Cart Endpoints](#cart-endpoints)
   - [Order Endpoints](#order-endpoints)
   - [Payment Endpoints](#payment-endpoints)
   - [User Endpoints](#user-endpoints)
   - [Content Endpoints](#content-endpoints)
   - [Hero Content Endpoints](#hero-content-endpoints)
   - [Webhook Endpoints](#webhook-endpoints)
   - [Health Check](#health-check)

---

## Server Setup & Running Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (MongoDB Atlas or local instance)
- Redis (optional, for caching)
- Environment variables configured

### Installation Steps

1. **Clone the repository** (if not already done)
   ```bash
   cd nova_styles_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=8500
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_ACCESS_TOKEN_SECRET=your-access-token-secret
   JWT_REFRESH_TOKEN_SECRET=your-refresh-token-secret
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ADMIN_EMAIL=admin@example.com
   ```

4. **Running in Development Mode**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:8500`

5. **Building for Production**
   ```bash
   npm run build
   ```
   This compiles TypeScript to JavaScript in the `dist` folder.

6. **Running in Production**
   ```bash
   npm start
   ```

7. **Setting up Admin User**
   ```bash
   npm run set-admin
   ```
   This script allows you to set a user as an admin.

---

## Authentication

### Authentication Mechanism

The API uses **JWT (JSON Web Token)** based authentication with HTTP-only cookies for security.

### Token Types

1. **Access Token**: Short-lived token (15 minutes) stored in `accessToken` cookie
2. **Refresh Token**: Long-lived token (7 days) stored in `refreshToken` cookie

### How Authentication Works

1. **Login**: User logs in with email and password. The server returns access and refresh tokens as HTTP-only cookies.
2. **Authenticated Requests**: For protected endpoints, the client automatically sends cookies with each request.
3. **Token Refresh**: When the access token expires, use the refresh token endpoint to get a new access token.
4. **Admin Verification**: Admin endpoints require both user authentication and admin role verification.

### Authentication Requirements

- **Public Endpoints**: No authentication required
- **User Endpoints**: Require `verifyUser` middleware (valid access token)
- **Admin Endpoints**: Require both `verifyUser` and `verifyAdmin` middleware (valid access token + admin role)

### Cookie Configuration

- **httpOnly**: true (prevents JavaScript access)
- **secure**: true (in production, requires HTTPS)
- **sameSite**: strict (CSRF protection)
- Cookies are automatically sent with requests from the same origin

---

## Admin Endpoints Summary

All admin endpoints require authentication and admin role. Here's a quick summary:

### Product Management
- `POST /api/v1/product` - Create product (Admin only)
- `PUT /api/v1/product/:id` - Update product (Admin only)
- `DELETE /api/v1/product/:id` - Delete product (Admin only)

### Portfolio Management
- `POST /api/v1/portfolioContent/portfolio` - Create portfolio (Admin only)
- `PUT /api/v1/portfolioContent/portfolio/:id` - Update portfolio (Admin only)
- `DELETE /api/v1/portfolioContent/portfolio/:id` - Delete portfolio (Admin only)

### Content Management
- `POST /api/v1/content` - Create content (Admin only)
- `PUT /api/v1/content/:id` - Update content (Admin only)
- `DELETE /api/v1/content/:id` - Delete content (Admin only)

### Admin User Management
- `POST /api/v1/auth/create-admin` - Create admin user (Admin only)

---

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
```

**Description**: Register a new user account

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response** (201 Created):
```json
{
  "message": "User created successfully",
  "newUser": {
    "email": "john@example.com",
    "phone": "1234567890",
    "username": "John Doe"
  }
}
```

---

#### Login
```http
POST /api/v1/auth/login
```

**Description**: Login user (admin or regular user) and receive authentication cookies

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123",
  "deviceId": "unique-device-id"
}
```

**Response** (200 OK):
- Sets `accessToken` and `refreshToken` as HTTP-only cookies
```json
{
  "message": "User logged successfully",
  "result": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

---

#### Logout
```http
POST /api/v1/auth/logout
```

**Description**: Logout user from current device and clear cookies

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### Logout from All Devices
```http
POST /api/v1/auth/logout-all/
```

**Description**: Logout user from all devices

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "message": "Logged out from all devices",
  "data": {}
}
```

---

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
```

**Description**: Refresh access token using refresh token from cookie

**Response** (200 OK):
- Updates `accessToken` and `refreshToken` cookies
```json
{
  "message": "Refresh token fetched successfully"
}
```

---

#### Check Session
```http
GET /api/v1/auth/check-session
```

**Description**: Check if user session is valid

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "message": "Session found",
  "user_info": {
    "email": "john@example.com",
    "username": "John Doe",
    "phone": "1234567890"
  }
}
```

---

#### Create Admin
```http
POST /api/v1/auth/create-admin
```

**Description**: Create a new admin user

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Admin created successfully",
  "admin": {
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

#### Change Password
```http
PUT /api/v1/auth/change-password
```

**Description**: Change user password

**Authentication**: Required (User)

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Product Endpoints

#### Get All Products
```http
GET /api/v1/product
```

**Description**: Get all products (public endpoint)

**Response** (200 OK):
```json
{
  "message": "Products fetched successfully",
  "success": true,
  "products": [
    {
      "_id": "product-id",
      "name": "Product Name",
      "price": 1000,
      "description": "Product description",
      "stock": 50,
      "paperTextures": ["Texture1", "Texture2"],
      "colours": ["Red", "Blue"],
      "material": ["Material1"],
      "print": ["Print1"],
      "installation": ["Install1"],
      "application": ["App1"],
      "imageUrl": "https://example.com/image.jpg",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Product by ID
```http
GET /api/v1/product/:id
```

**Description**: Get a specific product by ID (public endpoint)

**Response** (200 OK):
```json
{
  "_id": "product-id",
  "name": "Product Name",
  "price": 1000,
  "description": "Product description",
  "stock": 50,
  "paperTextures": ["Texture1"],
  "colours": ["Red"],
  "material": ["Material1"],
  "print": ["Print1"],
  "installation": ["Install1"],
  "application": ["App1"],
  "imageUrl": "https://example.com/image.jpg",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### Create Product
```http
POST /api/v1/product
```

**Description**: Create a new product

**Authentication**: Required (Admin)

**Request**: Multipart form data
- `name` (string, required): Product name (3-100 characters)
- `price` (number, required): Product price (min: 0)
- `description` (string, required): Product description (max: 500 characters)
- `stock` (number, required): Product stock (min: 0)
- `paperTextures` (array, required): Array of paper textures
- `colours` (array, required): Array of colors
- `material` (array, required): Array of materials
- `print` (array, required): Array of print options
- `installation` (array, required): Array of installation options
- `application` (array, required): Array of application options
- `image` (file, optional): Product image file

**Response** (201 Created):
```json
{
  "message": "Product created",
  "product": {
    "_id": "product-id",
    "name": "Product Name",
    "price": 1000,
    "description": "Product description",
    "stock": 50,
    "paperTextures": ["Texture1"],
    "colours": ["Red"],
    "material": ["Material1"],
    "print": ["Print1"],
    "installation": ["Install1"],
    "application": ["App1"],
    "imageUrl": "https://example.com/image.jpg",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Product
```http
PUT /api/v1/product/:id
```

**Description**: Update an existing product

**Authentication**: Required (Admin)

**Request**: Multipart form data (same as create, all fields optional)
- `image` (file, optional): New product image file

**Response** (200 OK):
```json
{
  "message": "Product updated",
  "product": {
    "_id": "product-id",
    "name": "Updated Product Name",
    "price": 1200,
    // ... other fields
  }
}
```

---

#### Delete Product
```http
DELETE /api/v1/product/:id
```

**Description**: Delete a product

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "message": "Product deleted"
}
```

---

### Portfolio Endpoints

#### Get All Portfolios
```http
GET /api/v1/portfolioContent/portfolio
```

**Description**: Get all portfolios (public endpoint)

**Response** (200 OK):
```json
{
  "success": true,
  "portfolios": [
    {
      "_id": "portfolio-id",
      "title": "Portfolio Title",
      "location": "Location",
      "category": "Living Room",
      "image": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Portfolios fetched successfully"
}
```

**Categories**: `Living Room`, `Bedroom`, `Kitchen`, `Bathroom`, `Office`

---

#### Get Portfolio by ID
```http
GET /api/v1/portfolioContent/portfolio/:id
```

**Description**: Get a specific portfolio by ID (public endpoint)

**Response** (200 OK):
```json
{
  "success": true,
  "portfolio": {
    "_id": "portfolio-id",
    "title": "Portfolio Title",
    "location": "Location",
    "category": "Living Room",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Portfolio fetched successfully"
}
```

---

#### Create Portfolio
```http
POST /api/v1/portfolioContent/portfolio
```

**Description**: Create a new portfolio

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "title": "Portfolio Title",
  "location": "Location",
  "category": "Living Room",
  "image": "https://example.com/image.jpg"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "portfolio": {
    "_id": "portfolio-id",
    "title": "Portfolio Title",
    "location": "Location",
    "category": "Living Room",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Portfolio created successfully"
}
```

---

#### Update Portfolio
```http
PUT /api/v1/portfolioContent/portfolio/:id
```

**Description**: Update an existing portfolio

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "title": "Updated Portfolio Title",
  "location": "Updated Location",
  "category": "Bedroom",
  "image": "https://example.com/new-image.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "portfolio": {
    "_id": "portfolio-id",
    "title": "Updated Portfolio Title",
    "location": "Updated Location",
    "category": "Bedroom",
    "image": "https://example.com/new-image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Portfolio updated successfully"
}
```

---

#### Delete Portfolio
```http
DELETE /api/v1/portfolioContent/portfolio/:id
```

**Description**: Delete a portfolio

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

---

### Cart Endpoints

#### Add to Cart
```http
POST /api/v1/cart
```

**Description**: Add an item to the user's cart

**Authentication**: Required (User)

**Request Body**:
```json
{
  "productId": "product-id",
  "quantity": 2,
  "area": "100 sq ft",
  "selectedColor": "Red",
  "selectedTexture": "Smooth",
  "name": "Product Name",
  "image": "https://example.com/image.jpg"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Item added",
  "cart": {
    "_id": "cart-id",
    "userId": "user-id",
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "area": "100 sq ft",
        "selectedColor": "Red",
        "selectedTexture": "Smooth",
        "name": "Product Name",
        "image": "https://example.com/image.jpg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Get Cart
```http
GET /api/v1/cart
```

**Description**: Get user's cart

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "success": true,
  "cart": {
    "_id": "cart-id",
    "userId": "user-id",
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "area": "100 sq ft",
        "selectedColor": "Red",
        "selectedTexture": "Smooth",
        "name": "Product Name",
        "image": "https://example.com/image.jpg"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Remove from Cart
```http
DELETE /api/v1/cart/:productId
```

**Description**: Remove an item from the cart

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item removed",
  "cart": {
    "_id": "cart-id",
    "userId": "user-id",
    "items": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Quantity
```http
PUT /api/v1/cart/update
```

**Description**: Update item quantity in cart

**Authentication**: Required (User)

**Request Body**:
```json
{
  "productId": "product-id",
  "quantity": 5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Quantity updated",
  "cart": {
    "_id": "cart-id",
    "userId": "user-id",
    "items": [
      {
        "productId": "product-id",
        "quantity": 5,
        // ... other fields
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Merge Cart
```http
POST /api/v1/cart/merge
```

**Description**: Merge guest cart into user's cart

**Authentication**: Required (User)

**Request Body**:
```json
{
  "guestCart": [
    {
      "productId": "product-id",
      "quantity": 2,
      "area": "100 sq ft",
      "selectedColor": "Red",
      "selectedTexture": "Smooth",
      "name": "Product Name",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart merged",
  "cart": {
    "_id": "cart-id",
    "userId": "user-id",
    "items": [
      // merged items
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Order Endpoints

#### Get All Orders
```http
GET /api/v1/orders
```

**Description**: Get all orders

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "orders": [
    {
      "_id": "order-id",
      "userId": "user-id",
      "items": [],
      "totalAmount": 1000,
      "status": "pending",
      "address": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "success": true,
  "message": "All Orders fetched successfully"
}
```

---

#### Get Order by ID
```http
GET /api/v1/orders/:id
```

**Description**: Get a specific order by ID

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "message": "Order fetched successfully",
  "success": true,
  "order": {
    "_id": "order-id",
    "userId": "user-id",
    "items": [],
    "totalAmount": 1000,
    "status": "pending",
    "address": {},
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Get Orders by User
```http
GET /api/v1/orders/user/:userId
```

**Description**: Get all orders for a specific user

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "orders": [
    {
      "_id": "order-id",
      "userId": "user-id",
      "items": [],
      "totalAmount": 1000,
      "status": "pending",
      "address": {},
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "success": true,
  "message": "User Orders fetched successfully"
}
```

---

#### Update Order Status
```http
PUT /api/v1/orders/:id/status
```

**Description**: Update order status

**Authentication**: Required (User)

**Request Body**:
```json
{
  "status": "shipped"
}
```

**Response** (200 OK):
```json
{
  "message": "Order status updated",
  "order": {
    "_id": "order-id",
    "status": "shipped",
    // ... other fields
  },
  "success": true
}
```

---

#### Delete Order
```http
DELETE /api/v1/orders/:id
```

**Description**: Delete an order

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Order deleted"
}
```

---

### Payment Endpoints

#### Create Payment Order
```http
POST /api/v1/payments/create-order
```

**Description**: Create a Razorpay payment order

**Authentication**: Required (User)

**Request Body**:
```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 1000
    }
  ],
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  }
}
```

**Response** (200 OK):
```json
{
  "message": "Payment order created",
  "order": {
    "id": "order_razorpay_id",
    "amount": 2000,
    "currency": "INR",
    "status": "created"
  },
  "payment": {
    "_id": "payment-id",
    "userId": "user-id",
    "orderId": "order-id",
    "amount": 2000,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Verify Payment
```http
POST /api/v1/payments/verify
```

**Description**: Verify Razorpay payment and create order

**Authentication**: Required (User)

**Request Body**:
```json
{
  "razorpay_order_id": "order_razorpay_id",
  "razorpay_payment_id": "pay_razorpay_id",
  "razorpay_signature": "signature",
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "price": 1000
    }
  ],
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "totalAmount": 2000,
  "paymentMethod": "razorpay"
}
```

**Response** (200 OK):
```json
{
  "message": "Payment verified & order created",
  "order": {
    "_id": "order-id",
    "userId": "user-id",
    "items": [],
    "totalAmount": 2000,
    "status": "confirmed",
    "paymentId": "payment-id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "payment": {
    "_id": "payment-id",
    "status": "success",
    "razorpayOrderId": "order_razorpay_id",
    "razorpayPaymentId": "pay_razorpay_id"
  }
}
```

---

### User Endpoints

#### Get User Address
```http
GET /api/v1/users/address
```

**Description**: Get user's address

**Authentication**: Required (User)

**Response** (200 OK):
```json
{
  "address": {
    "_id": "address-id",
    "userId": "user-id",
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Content Endpoints

#### Submit Contact Form
```http
POST /api/v1/content/contact-form
```

**Description**: Submit contact/interior design form (public endpoint)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "Interested in interior design services"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Form submitted successfully. Our team will contact you shortly.",
  "jobId": "job-id"
}
```

---

#### Submit Construction Form
```http
POST /api/v1/content/construction-form
```

**Description**: Submit construction form (public endpoint)

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "projectType": "Residential",
  "budget": "100000",
  "message": "Interested in construction services"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Form submitted successfully. Our team will contact you shortly.",
  "jobId": "job-id"
}
```

---

#### Get Content by Section
```http
GET /api/v1/content/:section
```

**Description**: Get content by section name (public endpoint)

**Response** (200 OK):
```json
{
  "content": {
    "_id": "content-id",
    "section": "about",
    "title": "About Us",
    "description": "Content description",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Get Content by ID
```http
GET /api/v1/content/:id
```

**Description**: Get content by ID (public endpoint)

**Response** (200 OK):
```json
{
  "content": {
    "_id": "content-id",
    "section": "about",
    "title": "About Us",
    "description": "Content description",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Create Content
```http
POST /api/v1/content
```

**Description**: Create new content

**Authentication**: Required (Admin)

**Request**: Multipart form data
- `section` (string): Section name
- `title` (string): Content title
- `description` (string): Content description
- `image` (file, optional): Content image

**Response** (201 Created):
```json
{
  "message": "Content created",
  "content": {
    "_id": "content-id",
    "section": "about",
    "title": "About Us",
    "description": "Content description",
    "image": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Content
```http
PUT /api/v1/content/:id
```

**Description**: Update existing content

**Authentication**: Required (Admin)

**Request**: Multipart form data (same as create, all fields optional)

**Response** (200 OK):
```json
{
  "message": "Content updated",
  "updated": {
    "_id": "content-id",
    "section": "about",
    "title": "Updated Title",
    "description": "Updated description",
    "image": "https://example.com/new-image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Delete Content
```http
DELETE /api/v1/content/:id
```

**Description**: Delete content

**Authentication**: Required (Admin)

**Response** (200 OK):
```json
{
  "message": "Content deleted"
}
```

---

### Hero Content Endpoints

#### Create Hero Content
```http
POST /api/v1/heroContent/hero
```

**Description**: Create hero content

**Request Body**:
```json
{
  "title": "Hero Title",
  "subtitle": "Hero Subtitle",
  "description": "Hero description",
  "image": "https://example.com/hero-image.jpg",
  "buttonText": "Learn More",
  "buttonLink": "/about"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "hero": {
    "_id": "hero-id",
    "title": "Hero Title",
    "subtitle": "Hero Subtitle",
    "description": "Hero description",
    "image": "https://example.com/hero-image.jpg",
    "buttonText": "Learn More",
    "buttonLink": "/about",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Hero created successfully"
}
```

---

#### Get All Hero Content
```http
GET /api/v1/heroContent/hero
```

**Description**: Get all hero content

**Response** (200 OK):
```json
{
  "success": true,
  "heroes": [
    {
      "_id": "hero-id",
      "title": "Hero Title",
      "subtitle": "Hero Subtitle",
      "description": "Hero description",
      "image": "https://example.com/hero-image.jpg",
      "buttonText": "Learn More",
      "buttonLink": "/about",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Update Hero Content
```http
PUT /api/v1/heroContent/hero/:id
```

**Description**: Update hero content

**Request Body**:
```json
{
  "title": "Updated Hero Title",
  "subtitle": "Updated Hero Subtitle",
  "description": "Updated description",
  "image": "https://example.com/updated-hero-image.jpg",
  "buttonText": "Get Started",
  "buttonLink": "/contact"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "updated": {
    "_id": "hero-id",
    "title": "Updated Hero Title",
    "subtitle": "Updated Hero Subtitle",
    "description": "Updated description",
    "image": "https://example.com/updated-hero-image.jpg",
    "buttonText": "Get Started",
    "buttonLink": "/contact",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Hero updated successfully"
}
```

---

#### Delete Hero Content
```http
DELETE /api/v1/heroContent/hero/:id
```

**Description**: Delete hero content

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Hero deleted successfully"
}
```

---

### Webhook Endpoints

#### Razorpay Webhook
```http
POST /api/webhook
```

**Description**: Razorpay webhook handler for payment events (public endpoint, signature verified)

**Note**: This endpoint is separate from `/api/v1` and is located at `/api/webhook`. The webhook handler exists in the codebase but may need to be properly connected to this route. Currently, the route only has middleware setup for raw body parsing.

**Headers**:
- `x-razorpay-signature`: Razorpay webhook signature (required for verification)

**Request Body**: Raw JSON from Razorpay

**Response** (200 OK):
```json
{
  "success": true
}
```

**Note**: The webhook handler processes `payment.captured` and `payment.failed` events. For the webhook to work, ensure the webhook controller is properly connected to this route in `src/app.ts`.

---

### Health Check

#### Health Check
```http
GET /health
```

**Description**: Health check endpoint (public endpoint)

**Response** (200 OK):
```
Health Check Ok
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is missing. Please log in."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied: Admins only"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes

1. **Admin Routes**: Admin routes in `src/modules/admin/routes/index.ts` are defined but not mounted in the main routes file. All admin functionality is implemented through middleware protection on main routes.

2. **Authentication**: All protected endpoints require valid authentication cookies. Cookies are automatically sent by browsers with requests to the same origin.

3. **File Uploads**: Endpoints that accept file uploads (product creation, content creation) use multipart/form-data content type.

4. **Swagger Documentation**: Interactive API documentation is available at `/api-docs` endpoint.

5. **CORS**: The API is configured to accept requests from `http://localhost:5173` in development. Update CORS settings in `src/app.ts` for production.

6. **Environment Variables**: Ensure all required environment variables are set before running the server.

7. **Database**: The application uses MongoDB. Ensure MongoDB connection string is correctly configured in environment variables.

8. **Cloudinary**: Product and content images are uploaded to Cloudinary. Ensure Cloudinary credentials are configured.

9. **Razorpay**: Payment integration uses Razorpay. Ensure Razorpay credentials and webhook secret are configured.

---

## Testing Endpoints

### Using cURL

#### Login Example
```bash
curl -X POST https://nova-styles-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123",
    "deviceId": "device-id"
  }' \
  -c cookies.txt
```

#### Get Products Example
```bash
curl -X GET https://nova-styles-backend.onrender.com/api/v1/product \
  -b cookies.txt
```

#### Create Product Example (Admin)
```bash
curl -X POST https://nova-styles-backend.onrender.com/api/v1/product \
  -b cookies.txt \
  -F "name=Test Product" \
  -F "price=1000" \
  -F "description=Test description" \
  -F "stock=10" \
  -F "paperTextures=[]" \
  -F "colours=[]" \
  -F "material=[]" \
  -F "print=[]" \
  -F "installation=[]" \
  -F "application=[]" \
  -F "image=@/path/to/image.jpg"
```

### Using Postman

1. Import the API collection (if available)
2. Set base URL: `https://nova-styles-backend.onrender.com/api/v1`
3. For authenticated requests, use the "Cookie" header or enable cookie handling in Postman settings
4. Login first to receive authentication cookies
5. Subsequent requests will automatically include cookies if cookie handling is enabled

---

## Support

For issues or questions, please contact the development team or refer to the Swagger documentation at `/api-docs`.

---

**Last Updated**: 2024-01-01
**API Version**: 1.0.0

