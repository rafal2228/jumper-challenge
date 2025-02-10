# 🚀 Jumper challenge backend

## 🛠️ Getting Started

### Step 1: 🚀 Initial Setup

- Install dependencies: `npm ci`

### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

### Step 3: 🛢️ Start valkey cache and postgres db

- Locally - checkout docs for both [Postgres](https://www.postgresql.org/download/) and [Valkey](https://valkey.io/download/)
- With docker-compose - make sure [Docker](https://www.docker.com/) is installed and run `docker compose up -d db valkey`. Alternatively you can just run `docker compose up -d` to start both services and backend app itself

### Step 4: 🏃‍♂️ Running the Project

- Development Mode: `npm run dev`
- Building: `npm run build`
- Production Mode: Set `.env` to `NODE_ENV="production"` then `npm run build && npm run start`
