# RupiyaKamao - Safe Trades Full-Stack App

A monorepo for the Safe Trades application built with Turborepo.

## Project Structure

```
RupiyaKamao/
├── apps/
│   ├── web/          # Next.js frontend with Tailwind CSS
│   └── worker/       # Cloudflare Worker backend
├── packages/
│   └── core/         # Shared strategy logic
├── .github/
│   └── workflows/
│       └── ci.yml    # CI/CD pipeline
├── package.json      # Root package configuration
├── turbo.json        # Turborepo configuration
└── README.md         # This file
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Apps

### Web (Next.js + Tailwind)
Frontend application built with Next.js and styled with Tailwind CSS.

### Worker (Cloudflare Worker)
Backend API deployed on Cloudflare Workers with D1 database.

## Packages

### Core
Shared business logic and utilities used across applications.

## License

MIT
