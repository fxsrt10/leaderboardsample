# Leaderboard App

A React application that fetches and displays leaderboard data from ACE platform using Firebase Functions and Firestore for data storage and retrieval.

## Features

- Import leaderboard data by Stage ID
- Display leaderboard with player rankings
- Search functionality for finding specific players
- Real-time updates using Firebase Firestore
- Responsive design for all devices

## Tech Stack

- Frontend: React.js
- Backend: Firebase Cloud Functions
- Database: Firebase Firestore
- Hosting: Firebase Hosting

## Project Structure

```
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Entry point
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── functions/             # Firebase Cloud Functions
│   ├── index.js          # Functions implementation
│   └── package.json      # Functions dependencies
├── firebase.json         # Firebase configuration
└── .firebaserc          # Firebase project settings
```

## Setup

1. **Prerequisites**
   - Node.js installed
   - Firebase CLI installed (`npm install -g firebase-tools`)
   - Firebase project created

2. **Installation**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install functions dependencies
   cd ../functions
   npm install
   ```

3. **Local Development**
   ```bash
   # Start React development server
   cd frontend
   npm start

   # In a separate terminal, start Firebase emulators
   firebase emulators:start
   ```

4. **Deployment**
   ```bash
   # Build frontend
   cd frontend
   npm run build

   # Deploy to Firebase
   firebase deploy
   ```

## Firebase Functions

The project includes two main Firebase functions:

- `fetchLeaderboard`: Fetches and stores leaderboard data from ACE platform
- `getLeaderboard`: Retrieves stored leaderboard data from Firestore

## How to use the app

1. Enter a valid Stage ID in the input field
2. Click "Import Leaderboard Data" to fetch the latest data
3. View the leaderboard table with player rankings
4. Use the search box to filter players by name
