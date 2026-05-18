# QuickZhiin CRM

A modern Customer Relationship Management (CRM) system built with Next.js and TypeScript.

## Features

- **Dashboard**: Get an overview of your business with key metrics and charts
- **Customer Management**: Track and manage your customer relationships
- **Contact Management**: Organize and maintain contact information
- **Deal Pipeline**: Visualize and manage your sales pipeline
- **Task Management**: Create and track tasks with list and calendar views
- **User Settings**: Customize your account settings and preferences

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Authentication**: JWT-based authentication
- **API**: RESTful API with Axios

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/quickzhiin.git
   cd quickzhiin
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with the following variables:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
quickzhiin/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts
│   ├── services/        # API services
│   └── utils/           # Utility functions
├── .env.local           # Environment variables
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## API Integration

The application connects to a backend API for data management. Make sure the backend server is running and the `NEXT_PUBLIC_API_URL` environment variable is set correctly.

## Authentication

The application uses JWT-based authentication. When a user logs in, a token is stored in localStorage and used for authenticated API requests.

## Deployment

1. Build the application:

   ```bash
   npm run build
   # or
   yarn build
   ```

2. Start the production server:
   ```bash
   npm start
   # or
   yarn start
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
