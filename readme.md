# OpenMusic API

OpenMusic API is a RESTful API project for managing albums, songs, users, playlists, collaborations, exports, likes, and authentications using Hapi.js, PostgreSQL, RabbitMQ, Redis, and ESLint for code linting.

## Precondition

Before running this project, make sure you have installed:

- Node.js
- PostgreSQL
- Redis
- RabbitMQ

## Run locally

1. Clone repository.
   
2. **Install dependencies**:

   ```sh
    npm install
    ```
3. **Database configuration**:
   
   Make sure PostgreSQL is running and create a database named `AlbumsAndSongs`. Then adjust the `.env` file to your
   database settings:

    ```plaintext
    PGUSER=<YOUR_DB_USER>
    PGPASSWORD=<YOUR_DB_PASSWORD>
    PGDATABASE=AlbumsAndSongs
    PGHOST=localhost
    PGPORT=5432
    ACCESS_TOKEN_KEY=your_access_token_secret_key
    REFRESH_TOKEN_KEY=your_refresh_token_secret_key
    ACCESS_TOKEN_AGE=3600
    RABBITMQ_SERVER=amqp://localhost
    REDIS_SERVER=localhost
    REDIS_PORT=6379
    ```
    
4. **Run database migration**:

    ```sh
    npm run migrate up
    ```

5. **Run server**:

    To start the server:

    ```sh
    npm run dev
    ```

6. **Linting code**:

    To ensure your code is free from linting issues, run:

    ```sh
    npm run lint
    ```
