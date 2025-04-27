# ZChat Server

ZChat Server is the backend for a real-time chat application built with Node.js, Express, MongoDB, and Socket.IO (although Socket.IO setup is not explicitly shown in the provided files, it's a common component for real-time chat).

## Features

- User registration and login with email/password
- Email verification
- JWT-based authentication
- User profile management (details not fully shown)
- Chat creation and management (details not fully shown)
- Real-time messaging (details not fully shown)
- Security features (Helmet, CORS, rate limiting, input sanitization)

## Prerequisites

- Node.js (>= 14.0.0 recommended)
- npm or yarn
- MongoDB instance (local or cloud like MongoDB Atlas)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd zchat-server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (`zchat-server/`) and add the following variables, replacing the placeholder values with your actual configuration:

    ```env
    # Server Configuration
    PORT=4000 # Port the server will run on
    SERVER_URL=http://localhost:4000 # Base URL of the server
    CLIENT_URL=http://localhost:7000 # URL of the frontend application (for CORS)
    NODE_ENV=development # or production

    # Database Configuration
    MONGODB_URI=<your_mongodb_connection_string> # e.g., mongodb+srv://user:pass@cluster.mongodb.net/zchat?retryWrites=true&w=majority

    # JWT Configuration
    JWT_SECRET=<your_strong_jwt_secret_key> # A long, random, secure string

    # Cloudinary Configuration (Optional - if using image uploads)
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

    # Email Configuration (For email verification)
    EMAIL_SERVICE=<your_email_address> # e.g., your.email@gmail.com
    PASSWORD_SERVICE=<your_email_app_password> # Use an App Password if using Gmail
    ```

    - **Note:** For `PASSWORD_SERVICE` with Gmail, you'll need to enable 2-Step Verification and generate an App Password.

4.  **Run the server:**
    - For development (with automatic restarts):
      ```bash
      npm run dev
      ```
    - For production:
      ```bash
      npm start
      ```

The server should now be running on the port specified in your `.env` file (default: 4000).

## API Endpoints

The base URL for all API endpoints is `/api`.

### Authentication (`/api/auth`)

- **`POST /register`**: Register a new user.

  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword",
      "fullName": "Test User"
    }
    ```
  - **Response:**
    - `201 Created`: Registration successful. Sends verification email. Sets `accessToken` and `refreshToken` cookies.
    - `400 Bad Request`: Email already exists or validation fails.
    - `500 Internal Server Error`: Server error.

- **`POST /verify-email`**: Verify user's email address.

  - **Requires Authentication:** Yes (Bearer Token in Authorization header or `accessToken` cookie)
  - **Request Body:**
    ```json
    {
      "code": "verification_code_from_email"
    }
    ```
  - **Response:**
    - `200 OK`: Email verified successfully.
    - `400 Bad Request`: Invalid or expired code.
    - `404 Not Found`: User not found.
    - `500 Internal Server Error`: Server error.

- **`POST /login`**: Log in an existing user.

  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
  - **Response:**
    - `200 OK`: Login successful. Sets `accessToken` and `refreshToken` cookies. Returns user info.
    - `401 Unauthorized`: Invalid password.
    - `404 Not Found`: Email not found.
    - `500 Internal Server Error`: Server error.

- **`POST /logout`**: Log out the current user.
  - **Requires Authentication:** Yes (Bearer Token in Authorization header or `accessToken` cookie)
  - **Response:**
    - `200 OK`: Logout successful. Clears `accessToken` and `refreshToken` cookies.
    - `500 Internal Server Error`: Server error.

### Users (`/api/users`)

_(Specific endpoints are defined in `src/routes/user.routes.js` but not provided in the context. Add documentation here as needed.)_

- Example: `GET /me` (Requires Authentication) - Get current user's profile.
- Example: `PUT /me` (Requires Authentication) - Update current user's profile.
- Example: `GET /:id` - Get user profile by ID.

### Chats (`/api/chats`)

_(Specific endpoints are defined in `src/routes/chat.routes.js` but not provided in the context. Add documentation here as needed.)_

- Example: `POST /` (Requires Authentication) - Create a new chat.
- Example: `GET /` (Requires Authentication) - Get user's chats.
- Example: `GET /:chatId` (Requires Authentication) - Get specific chat details.

### Messages (`/api/messages`)

_(Specific endpoints are defined in `src/routes/message.routes.js` but not provided in the context. Add documentation here as needed.)_

- Example: `POST /` (Requires Authentication) - Send a new message.
- Example: `GET /:chatId` (Requires Authentication) - Get messages for a specific chat.

## Error Handling

The API uses standard HTTP status codes. Errors are returned in a JSON format:

```json
{
  "message": "Error description"
}
```

## Security

- **Helmet:** Sets various HTTP headers for security.
- **CORS:** Configured to allow requests only from the `CLIENT_URL` specified in `.env`.
- **Rate Limiting:** Limits requests per IP address to prevent brute-force attacks.
- **Input Sanitization:** Protects against NoSQL injection attacks (`express-mongo-sanitize`).
- **Parameter Pollution Protection:** Protects against HTTP Parameter Pollution attacks (`hpp`).
- **Authentication:** Uses JWT (JSON Web Tokens) stored in secure, httpOnly cookies.

## Contributing

_(Add contribution guidelines if applicable)_

## License

ISC
