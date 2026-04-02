# TourPass

TourPass is an Expo + React Native app for building and navigating custom walking tours. It combines Mapbox search, live map interaction, route creation, and turn-by-turn navigation with a Supabase-backed auth and profile flow.

## What the app does

- Lets users sign in and sign up with email and password.
- Redirects authenticated users into the main app and unauthenticated users into the sign-in flow.
- Searches places with Mapbox autocomplete and resolves exact locations on the map.
- Creates multi-stop walking routes from selected locations.
- Shows stored routes on an interactive map and lets users start navigation from a selected route.
- Uses Mapbox navigation for turn-by-turn walking directions.
- Tracks profile data in Supabase, including guide status and application state.
- Supports guide onboarding, guide dashboard access, payments, preferences, and help-center screens.
- Includes map preferences such as style, light preset, and optional 3D mode.

## Tech Stack

- Expo Router
- React Native
- TypeScript
- Supabase
- Mapbox
- NativeWind

## Getting Started

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npx expo run
```

## Project Structure

- `app/` app screens and routes
- `components/` reusable UI pieces
- `contexts/` route and preference state
- `providers/` authentication state
- `lib/` Mapbox and Supabase helpers
- `assets/` images and branding

## Features By Area

### Authentication

- Email/password sign-in and sign-up
- Automatic session handling
- Profile row creation in Supabase for new users

### Home and Routing

- Map view with saved routes
- Place search with debounced Mapbox suggestions
- Route selection directly from the map
- Quick access to create a new route
- Start navigation from a selected route

### Route Creation

- Search and add multiple stops
- Fetch walking directions between stops
- Preview route options before saving
- Store routes in app state for later use

### Navigation

- Walking navigation through Mapbox
- Waypoint and destination arrival handling
- Navigation cancellation and error handling

### Profile and Guide Flow

- User profile screen with guide-related status
- Become-a-guide application flow
- Guide dashboard entry point
- Payments, preferences, and help center screens

## Notes

- Mapbox access depends on your configured environment variables.
- Supabase powers authentication and profile data.
- The app uses file-based routing through Expo Router.
