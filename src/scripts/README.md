# Test Scripts

This directory contains various test scripts for testing different parts of the application.

## Content Suggestions Test Script

The `test-content-suggestions.ts` script is a temporary test script for testing the content suggestions functionality. It directly calls the `getContentSuggestionsForPerson` function with a real person ID and displays the results.

### How to Use

1. Open the `test-content-suggestions.ts` file
2. Replace the `PERSON_ID` constant with a valid person ID from your database
3. Run the script using the following command:

```bash
# From the project root
yarn ts-node -r tsconfig-paths/register src/scripts/test-content-suggestions.ts
```

### What the Script Does

The script performs the following steps:

1. Creates a Supabase client
2. Calls the `getContentSuggestionsForPerson` function with the provided person ID
3. Displays the results or any errors that occur

### Output

The script will output:

- The result of the `getContentSuggestionsForPerson` function, which includes:
  - Generated topics
  - Content suggestions
  - Any errors that occurred during the process

### Notes

- This script is for testing purposes only and should not be used in production
- Make sure you have the necessary environment variables set up for Supabase and AI services 