# Restaurant Portal

A modern web application for restaurant management, built with React and TypeScript.

## Features

- 📊 Dashboard with key metrics and recent orders
- 🍽️ Menu management
- 📦 Order tracking and management
- 👤 Restaurant profile management
- 🔐 Secure authentication
- 📱 Responsive design for all devices

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Heroicons
- Chart.js

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd restaurant-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_NAME=Restaurant Portal
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4000`

## Build for Production

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript interfaces
  ├── utils/         # Utility functions
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Available Scripts

- `npm start` - Runs the app in development mode on port 4000
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_NAME` - Application name

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
