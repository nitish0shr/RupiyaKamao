# RupiyaKamao - Trading App with Authentication

A full-stack trading application with secure user authentication, built with Next.js frontend and Cloudflare Workers backend.

## 🏗️ Project Structure

```
RupiyaKamao/
├── apps/
│   ├── web/          # Next.js frontend with Tailwind CSS
│   │   └── pages/    # Login, Register, Dashboard pages
│   └── worker/       # Cloudflare Worker backend API
│       ├── src/      # API routes and authentication logic
│       └── db/       # Database migrations
├── packages/
│   └── core/         # Shared strategy logic
├── .github/
│   └── workflows/
│       └── ci.yml    # CI/CD pipeline
└── turbo.json        # Turborepo configuration
```

## ✨ Features

- ✅ **Secure Authentication**: Registration and login with password hashing (SHA-256)
- ✅ **JWT Token Management**: Stateless authentication with JWT tokens
- ✅ **Database Integration**: Cloudflare D1 (SQLite) for user data storage
- ✅ **Input Validation**: Email format and password strength validation
- ✅ **CORS Support**: Configured for cross-origin requests
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **TypeScript**: Full TypeScript support for type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Cloudflare account (for deployment)
- Wrangler CLI (for Cloudflare Workers)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nitish0shr/RupiyaKamao.git
cd RupiyaKamao
```

2. Install dependencies:
```bash
npm install
```

### Local Development

1. Start the development server:
```bash
npm run dev
```

2. The web app will be available at `http://localhost:3000`
3. The worker API will be available at `http://localhost:8787`

## 📦 Database Setup

### Cloudflare D1 Database

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create a new D1 database:
```bash
wrangler d1 create rupiyakamao
```

4. Update `apps/worker/wrangler.toml` with your database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "rupiyakamao"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID from step 3
```

5. Run the database migration:
```bash
cd apps/worker
wrangler d1 execute rupiyakamao --file=./db/migration.sql
```

6. Verify the database schema:
```bash
wrangler d1 execute rupiyakamao --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 🔐 Environment Variables

The worker uses the following environment variables (configured in `wrangler.toml`):

- `DB`: D1 Database binding (configured automatically)
- `JWT_SECRET`: Secret key for JWT token generation (set in wrangler.toml)
- `ENVIRONMENT`: development or production

For production, use Wrangler secrets:
```bash
wrangler secret put JWT_SECRET
```

## 🌐 Deployment

### Deploy Backend (Cloudflare Workers)

1. Navigate to the worker directory:
```bash
cd apps/worker
```

2. Deploy to Cloudflare:
```bash
wrangler deploy
```

3. Your API will be deployed to: `https://rupiyakamao-worker.YOUR_SUBDOMAIN.workers.dev`

### Deploy Frontend (Vercel)

1. Push your changes to GitHub:
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure the build settings:
   - Framework Preset: `Next.js`
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Cloudflare Worker URL from step 3 above

5. Deploy!

## 🔧 API Endpoints

### Authentication

**POST `/api/auth/register`**
- Register a new user
- Body: `{ email, username, password }`
- Returns: `{ success, message, data: { user, token } }`

**POST `/api/auth/login`**
- Login an existing user
- Body: `{ email, password }`
- Returns: `{ success, message, data: { user, token } }`

**GET `/api/user/profile`**
- Get user profile (protected route)
- Headers: `Authorization: Bearer <token>`
- Returns: `{ success, message, data }`

**GET `/api/health`**
- Health check endpoint
- Returns: `{ success, message, timestamp }`

## 🧪 Testing

### Test Registration

```bash
curl -X POST https://your-worker-url.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

### Test Login

```bash
curl -X POST https://your-worker-url.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🛠️ Tech Stack

### Frontend
- **Next.js**: React framework for production
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Cloudflare Workers**: Serverless edge computing
- **TypeScript**: Type-safe API development
- **D1 Database**: SQLite database at the edge
- **Web Crypto API**: Built-in encryption for passwords and JWT

### Infrastructure
- **Turborepo**: Monorepo build system
- **GitHub Actions**: CI/CD pipeline
- **Vercel**: Frontend hosting
- **Cloudflare**: Backend and database hosting

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1
);
```

## 🔒 Security Features

- Password hashing using SHA-256
- JWT tokens with expiration (24 hours)
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- Unique email and username constraints

## 🐛 Troubleshooting

### Database Issues
- Ensure D1 database is created and ID is correct in `wrangler.toml`
- Run migrations using `wrangler d1 execute`
- Check database tables with SQL queries

### Authentication Issues
- Verify JWT_SECRET is set correctly
- Check CORS headers if frontend can't connect to backend
- Ensure API URL is correct in frontend environment variables

### Deployment Issues
- Run `wrangler whoami` to verify Cloudflare authentication
- Check Wrangler logs with `wrangler tail`
- Verify environment variables are set in Vercel dashboard

## 📄 License

MIT

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

Developed with ❤️ for secure trading applications
