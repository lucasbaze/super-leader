# AI-Driven Onboarding Chat Interface

## Overview

This feature implements an AI-driven onboarding experience that helps users create their "Share Value Ask" while gathering meaningful context about them for better personalization.

## Implementation Details

### Database Schema
- Added `onboarding` JSONB field to the `user_profiles` table with the following structure:
  ```json
  {
    "completed": boolean,
    "steps": {
      "shareValueAsk": {
        "completed": boolean,
        "data": object | null
      }
    },
    "currentStep": string
  }
  ```

### Services
- `get-onboarding-status.ts`: Fetches the user's current onboarding status
- `update-onboarding-status.ts`: Updates the onboarding status with step completion and data

### API Routes
- `/api/user/onboarding/status`: GET endpoint to fetch onboarding status
- `/api/user/onboarding/update`: POST endpoint to update onboarding progress
- `/api/chat/onboarding`: POST endpoint for the onboarding chat experience

### Components
- `OnboardingHeader`: Displays progress and completion button
- `OnboardingChat`: The main chat interface with voice recognition support

### Hooks
- `use-onboarding.ts`: Custom hook that manages onboarding state, messages, and API calls

### Pages
- `/onboarding`: The main onboarding page with its own layout

### Testing
- Unit tests for services are included

## Features
- Conversational AI-driven onboarding flow
- Voice input support using Web Speech API
- Progress tracking across the onboarding flow
- Share Value Ask generation and preview
- Auto-redirection when completed

## Usage
New users are automatically redirected to the onboarding flow through middleware until they complete the process. The completed Share Value Ask is stored in the user's profile for future reference.

## Known Issues
- Some TypeScript errors in tests need to be addressed
- Voice recognition requires browser support and might not work in all environments