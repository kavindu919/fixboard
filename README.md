# Issue Tracker API

This repository contains the backend API for the Issue Tracker application. It is built using Node.js, Express, TypeScript, and Prisma with MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (or a MongoDB Atlas connection string)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd issue_tracker
    ```

2.  **Install dependencies:**

    Navigate to the `src` directory (where the `package.json` resides) and install dependencies.

    ```bash
    cd src
    npm install
    ```

    > **Note:** The `package.json` is located inside the `src` folder, so simpler commands should be run from there.

## Configuration

1.  **Environment Variables:**

    Create a `.env` file in the `src` directory. You can copy the `.env.example` if available, or create a new one with the following variables:

    ```env
    # Server Configuration
    PORT=8000
    NODE_ENV=development

    # Database Configuration
    DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

    # Authentication
    JWT_SECRET="your_jwt_secret_key"
    ```

    - `PORT`: The port on which the server will run (default: 8000).
    - `DATABASE_URL`: Your MongoDB connection string.
    - `JWT_SECRET`: A secret key used for singing JWT tokens.

2.  **Prisma Setup:**

    After configuring the `.env` file with your database URL, generate the Prisma client:

    ```bash
    # From the src directory
    npx prisma generate
    ```

## Running the Application

### Development Mode

To start the server in development mode with hot-reloading (using `nodemon` and `tsx`):

```bash
# From the src directory
npm run dev
```

The server will start at `http://localhost:8000` (or the port specified in your `.env`).

### Production Build

To build and start the application for production:

1.  **Build the TypeScript code:**

    ```bash
    # From the src directory
    npx tsc
    ```

2.  **Start the compiled code:**

    ```bash
    node dist/index.js
    ```

## API Endpoints

The API exposes the following main routes:

### Authentication (`/api/auth`)

- `POST /register`: Register a new user.
- `POST /login`: Login a user.
- `POST /logout`: Logout the current user.
- `GET /me`: Get current user details.

### Issues (`/api/issues`)

- `POST /create-issue`: Create a new issue.
- `GET /all-issues`: Get a list of issues (supports pagination, filtering, searching).
- `GET /get-issue/:id`: Get details of a specific issue.
- `POST /update-issue`: Update an existing issue.
- `POST /update-issue-status`: Update the status of an issue.
- `POST /assign-issue`: Assign an issue to a user.
- `POST /delete-issue`: Delete an issue.
- `GET /issues-export`: Export issues to CSV or JSON.
- `GET /issues-count`: Get statistics of issues.

## Project Structure

- `src/controllers`: Request handlers for API endpoints.
- `src/routes`: API route definitions.
- `src/middleware`: Express middleware (e.g., authentication).
- `src/lib`: Shared libraries and utilities (Prisma client, schemas, helpers).
- `src/prisma`: Prisma schema file.

## Troubleshooting

- **"Missing required field"**: Ensure you are sending all necessary data in the request body.
- **Database Connection Errors**: Check your `DATABASE_URL` in the `.env` file and ensure your IP is whitelisted if using MongoDB Atlas.
