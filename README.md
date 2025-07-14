# LLM Tracker

LLM Tracker is a platform for analyzing and visualizing LLM usage and costs across your projects. It provides a simple interface to monitor your expenses and understand how your different models are being used.

## Features

- **Multi-tenant:** Organize your work into different organizations and projects.
- **Usage Tracking:** Log and monitor usage data from various LLM providers and models.
- **Cost Analysis:** Keep track of token usage and associated costs for each project.
- **Dashboard:** Visualize usage trends and key metrics with interactive charts.
- **Authentication:** Secure user authentication handled by NextAuth.js.
- **API:** A simple RESTful API to manage your resources.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building the user interface.
- [Prisma](https://www.prisma.io/) - Type-safe ORM for PostgreSQL database access.
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js applications.
- [PostgreSQL](https://www.postgresql.org/) - Open source relational database (Dockerized).
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling.
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
- [Recharts](https://recharts.org/) - A composable charting library built on React components.
- [TypeScript](https://www.typescriptlang.org/) - Static-typed superset of JavaScript.

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- [Docker](https://www.docker.com/) (for PostgreSQL database)

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/llm-tracker.git
    cd llm-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Start the PostgreSQL database using Docker:**
    ```bash
    docker-compose up -d
    ```
    This will start a local PostgreSQL instance on port 5432 with the credentials defined in `docker-compose.yml`.

4.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llmtracker_db"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET=your-random-secret
    # Add any other NextAuth provider secrets if needed
    ```
    - You can generate a random secret for `NEXTAUTH_SECRET` with:
      ```bash
      openssl rand -base64 32
      ```

5.  **Run Prisma migrations to set up the database schema:**
    ```bash
    npx prisma migrate deploy
    # or, for development with a new migration
    npx prisma migrate dev --name init
    ```
    This will create all necessary tables in your local Postgres database.

6.  **Generate the Prisma client:**
    ```bash
    npx prisma generate
    ```

7.  **(Optional) Seed the database:**
    If you have a seed script, run:
    ```bash
    npx prisma db seed
    ```

8.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

The application exposes a set of RESTful endpoints to manage organizations, projects, and track usage. You can explore the available routes in `app/api/v1/`.

## Notes
- Authentication is handled by NextAuth.js. You can configure providers in the NextAuth options.
- All data is stored in your local Dockerized PostgreSQL instance via Prisma ORM.
- For production, update your `DATABASE_URL` and `NEXTAUTH_URL` accordingly.