# Vibe Coding (Golang Version)

This is the Golang implementation of the Vibe Coding Expense Tracker API. It is a RESTful API for managing expenses, users, and authentication, designed for learning and demonstration purposes.

## Features
- User registration and authentication
- Expense management (CRUD)
- JWT-based authentication
- PostgreSQL database integration
- Clean, idiomatic Go code

## Getting Started

### Prerequisites
- Go 1.20+
- PostgreSQL (or Docker)

### Setup
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd Vibe-Coding-1
   git checkout golang-version
   ```
2. Copy the example environment file and edit as needed:
   ```sh
   cp .env.example .env
   # Edit .env with your DB credentials
   ```
3. Install dependencies:
   ```sh
   go mod tidy
   ```
4. Run database migrations (if using a migration tool):
   ```sh
   # Example with golang-migrate
   migrate -database $DATABASE_URL -path migrations up
   ```
5. Start the server:
   ```sh
   go run main.go
   ```

## API Documentation
- Swagger/OpenAPI documentation coming soon!

## Project Structure
- `main.go` - Entry point
- `handlers/` - HTTP handlers
- `models/` - Database models
- `routes/` - API routes
- `middleware/` - Middleware (auth, logging, etc.)
- `config/` - Configuration and environment loading

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT 