# Check Eat - Frontend

React frontend for the Food Nutrition Analyzer application.

## Features

- 🖼️ Image upload with drag & drop support
- 📊 Beautiful nutrition information display
- ⚡ Fast and responsive UI
- 🎨 Modern design with Tailwind CSS
- 📱 Mobile-friendly responsive layout

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000` (or configure `VITE_API_URL`)

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. (Optional) Configure API URL:
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
# or
yarn build
```

Preview production build:
```bash
npm run preview
# or
yarn preview
```

## Usage

1. Make sure the backend API is running (see `../ai/README.md`)
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. Upload a food image (click or drag & drop)
5. Click "Analyze Food" to get nutrition information

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── ImageUpload.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles
│   └── vite-env.d.ts    # Vite type definitions
├── index.html
├── package.json
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # TypeScript config for Node
├── vite.config.ts       # Vite configuration
└── tailwind.config.js
```

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

