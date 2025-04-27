# ZChat Server

ZChat Server is the backend for a real-time chat application built with Node.js, Express, and MongoDB.

## Features

- User registration and login with email/password
- Email verification
- JWT-based authentication (using cookies)
- User profile management (get, update, avatar, cover photo)
- User search
- Friend requests (send, accept)
- User blocking
- Private and group chat creation
- Chat management (get, update, delete, add/remove members, add/remove admins, update avatar/name/settings)
- Real-time messaging (send, get, edit, delete, reactions, read status, forward, search)
- Security features (Helmet, CORS, rate limiting)
- Image uploads via Cloudinary

## Prerequisites

- Node.js (>= 14.0.0 recommended)
- npm or yarn
- MongoDB instance (local or cloud like MongoDB Atlas)
- Cloudinary account (for image uploads)
- Email service account (like Gmail with App Password for verification)

## Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/tandudev/zchat-server.git
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
    SERVER_URL=http://localhost:4000 # Base URL of the server (if needed)
    CLIENT_URL=http://localhost:7000 # URL of the frontend application (for CORS)
    NODE_ENV=development # or production

    # Database Configuration
    MONGODB_URI=<your_mongodb_connection_string> # e.g., mongodb+srv://user:pass@cluster.mongodb.net/zchat?retryWrites=true&w=majority

    # JWT Configuration
    JWT_SECRET=<your_strong_jwt_secret_key> # A long, random, secure string

    # Cloudinary Configuration
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

The base URL for all API endpoints is `/api`. All endpoints requiring authentication expect a valid JWT `accessToken` cookie or a Bearer token in the `Authorization` header.

### Authentication (`/api/auth`)

- **`POST /register`**: Register a new user.

  - **Request Body:** `{ "email", "password", "fullName" }`
  - **Response:** `201 Created` (sets cookies), `400 Bad Request`, `500 Internal Server Error`

- **`POST /verify-email`**: Verify user's email address.

  - **Requires Authentication:** Yes
  - **Request Body:** `{ "code" }`
  - **Response:** `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

- **`POST /login`**: Log in an existing user.

  - **Request Body:** `{ "email", "password" }`
  - **Response:** `200 OK` (sets cookies), `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`

- **`POST /logout`**: Log out the current user.
  - **Requires Authentication:** Yes
  - **Response:** `200 OK` (clears cookies), `500 Internal Server Error`

### Users (`/api/users`)

- **`GET /profile`**: Get current user's profile.

  - **Requires Authentication:** Yes
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`PUT /profile`**: Update current user's profile.

  - **Requires Authentication:** Yes
  - **Request Body:** `{ "fullName", "bio", "gender", "dateOfBirth", "settings" }` (optional fields)
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`POST /avatar`**: Upload user avatar.

  - **Requires Authentication:** Yes
  - **Request Body:** `FormData` with `avatar` field (image file)
  - **Response:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

- **`POST /cover-photo`**: Upload user cover photo.

  - **Requires Authentication:** Yes
  - **Request Body:** `FormData` with `coverPhoto` field (image file)
  - **Response:** `200 OK`, `400 Bad Request`, `500 Internal Server Error`

- **`GET /search`**: Search for users.

  - **Requires Authentication:** Yes
  - **Query Params:** `query=<search_term>`
  - **Response:** `200 OK` (array of users), `400 Bad Request`, `500 Internal Server Error`

- **`POST /friend-request/:friendId`**: Send a friend request.

  - **Requires Authentication:** Yes
  - **Params:** `friendId` (ID of the user to send request to)
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`POST /accept-friend/:friendId`**: Accept a friend request.

  - **Requires Authentication:** Yes
  - **Params:** `friendId` (ID of the user whose request to accept)
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`POST /block/:userId`**: Block a user.
  - **Requires Authentication:** Yes
  - **Params:** `userId` (ID of the user to block)
  - **Response:** `200 OK`, `500 Internal Server Error`

### Chats (`/api/chats`)

- **`POST /private`**: Create or get a private chat with another user.

  - **Requires Authentication:** Yes
  - **Request Body:** `{ "userId" }` (ID of the other user)
  - **Response:** `201 Created` or `200 OK` (if chat exists), `500 Internal Server Error`

- **`POST /group`**: Create a new group chat.

  - **Requires Authentication:** Yes
  - **Request Body:** `{ "name", "members": ["userId1", "userId2", ...] }`
  - **Response:** `201 Created`, `500 Internal Server Error`

- **`GET /`**: Get all chats for the current user.

  - **Requires Authentication:** Yes
  - **Response:** `200 OK` (array of chats), `500 Internal Server Error`

- **`GET /:chatId`**: Get details of a specific chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`PUT /:chatId`**: Update chat information (generic).

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Request Body:** `{ ...updateData }` (e.g., name, settings)
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`DELETE /:chatId`**: Delete a chat (marks as inactive).

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`POST /:chatId/members`**: Add a member to a group chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Request Body:** `{ "userId" }`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`DELETE /:chatId/members/:userId`**: Remove a member from a group chat.

  - **Requires Authentication:** Yes (Must be admin or the member themselves)
  - **Params:** `chatId`, `userId`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`POST /:chatId/admins`**: Add an admin to a group chat.

  - **Requires Authentication:** Yes (Must be admin)
  - **Params:** `chatId`
  - **Request Body:** `{ "userId" }`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`DELETE /:chatId/admins/:userId`**: Remove an admin from a group chat.

  - **Requires Authentication:** Yes (Must be admin)
  - **Params:** `chatId`, `userId`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`PUT /:chatId/avatar`**: Update group chat avatar.

  - **Requires Authentication:** Yes (Must be admin)
  - **Params:** `chatId`
  - **Request Body:** `{ "avatar": "url_or_data" }` (Mechanism depends on implementation, likely URL for now)
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`PUT /:chatId/name`**: Update group chat name.

  - **Requires Authentication:** Yes (Must be admin)
  - **Params:** `chatId`
  - **Request Body:** `{ "name": "New Group Name" }`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`PUT /:chatId/settings`**: Update chat settings.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Request Body:** `{ "settings": { ... } }`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`PUT /:chatId/reset-unread`**: Reset unread message count for the user in a chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Response:** `200 OK`, `500 Internal Server Error`

- **`GET /search`**: Search chats for the current user.
  - **Requires Authentication:** Yes
  - **Query Params:** `query=<search_term>`
  - **Response:** `200 OK` (array of chats), `500 Internal Server Error`

### Messages (`/api/messages`)

_Note: All message routes are prefixed with `/api/messages/:chatId/messages`_

- **`POST /:chatId/messages`**: Send a new message.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Request Body:** `{ "content", "type", "attachments", "replyTo", "mentions", ... }`
  - **Response:** `201 Created`, `500 Internal Server Error`

- **`GET /:chatId/messages`**: Get messages for a specific chat (paginated).

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Query Params:** `page=<number>`, `limit=<number>` (defaults: page=1, limit=20)
  - **Response:** `200 OK` (array of messages), `500 Internal Server Error`

- **`GET /:chatId/messages/:messageId`**: Get a specific message by ID.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `messageId`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`PUT /:chatId/messages/:messageId`**: Edit a message.

  - **Requires Authentication:** Yes (Must be sender)
  - **Params:** `chatId`, `messageId`
  - **Request Body:** `{ "content": "New message content" }`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`DELETE /:chatId/messages/:messageId`**: Delete a message (marks as deleted for the user).

  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `messageId`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`POST /:chatId/messages/:messageId/reactions`**: Add a reaction to a message.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `messageId`
  - **Request Body:** `{ "reaction": "emoji" }`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`DELETE /:chatId/messages/:messageId/reactions`**: Remove a reaction from a message.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `messageId`
  - **Request Body:** `{ "reaction": "emoji" }` (The reaction to remove)
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`PUT /:chatId/messages/:messageId/read`**: Mark a message as read by the current user.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `messageId`
  - **Response:** `200 OK`, `404 Not Found`, `500 Internal Server Error`

- **`POST /:chatId/messages/:messageId/forward`**: Forward a message to another chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId` (original chat), `messageId`
  - **Request Body:** `{ "targetChatId": "destination_chat_id" }`
  - **Response:** `200 OK` (returns the new forwarded message), `404 Not Found`, `500 Internal Server Error`

- **`GET /:chatId/messages/search`**: Search messages within a chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Query Params:** `query=<search_term>`
  - **Response:** `200 OK` (array of messages), `500 Internal Server Error`

- **`GET /:chatId/messages/unread`**: Get unread messages for the user in a chat.

  - **Requires Authentication:** Yes
  - **Params:** `chatId`
  - **Response:** `200 OK` (array of messages), `500 Internal Server Error`

- **`GET /:chatId/messages/type/:type`**: Get messages by type within a chat.
  - **Requires Authentication:** Yes
  - **Params:** `chatId`, `type` (e.g., 'image', 'file')
  - **Response:** `200 OK` (array of messages), `500 Internal Server Error`

## Error Handling

The API uses standard HTTP status codes. Errors are returned in a JSON format, often including details:

```json
{
  "message": "Error description"
  // Optional: "error": "Error Type",
  // Optional: "details": [...]
}
```

The `errorHandler` middleware handles common Mongoose, Joi, and JWT errors, providing structured responses.

## Security

- **Helmet:** Sets various HTTP headers for security.
- **CORS:** Configured to allow requests only from the `CLIENT_URL` specified in `.env`, including credentials.
- **Rate Limiting:** Limits requests per IP address via `express-rate-limit` to prevent brute-force attacks.
- **Authentication:** Uses JWT (JSON Web Tokens) stored in secure, httpOnly cookies (`cookie-parser`). Access tokens have a short expiry, refresh tokens have a longer expiry.
- **Input Validation:** Uses `joi` for validating request bodies in authentication routes.

## Contributing

_(Add contribution guidelines if applicable)_

## License

ISC
