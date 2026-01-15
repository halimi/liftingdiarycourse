# Lifting Diary

A modern strength training tracker built with Next.js 16 and React 19. Track your workouts, monitor your progress, and watch yourself get stronger over time.

## Features

- **Track Progress**: Log exercises, sets, and reps for every workout
- **Build Strength**: Monitor your lifts and watch your numbers grow
- **Stay Consistent**: Keep a complete history of your training journey
- **Dark Mode**: Full dark mode support for late-night gym sessions
- **Secure Authentication**: User authentication powered by Clerk

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI**: React 19, TypeScript, [Tailwind CSS 4](https://tailwindcss.com)
- **Authentication**: [Clerk](https://clerk.com)
- **Database**: PostgreSQL with Drizzle ORM
- **Font**: [Geist](https://vercel.com/font) font family

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (see `.env.example`)

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - React components
- `/lib` - Utility functions and shared logic
- `/docs` - Project documentation

## Documentation

For detailed documentation on specific aspects of the project, see the `/docs` directory:

- [UI Patterns](/docs/ui.md)
- [Data Fetching](/docs/data-fetching.md)
- [Authentication](/docs/auth.md)
- [Data Mutations](/docs/data-mutations.md)
- [Server Components](/docs/server-components.md)
- [Routing](/docs/routing.md)

## License

MIT
