# CLAUDE.md - Development Guidelines

## Commands

- `yarn dev` - Start development server with turbopack
- `yarn build` - Build for production
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn format` - Run Prettier formatting
- `yarn type-check` - Check TypeScript types
- `yarn test` - Run all tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test -- -t "test name"` - Run specific test
- `yarn seed` - Seed database with test data

## Code Style

- **Formatting**: Use Prettier with 100 char line width, single quotes, 2-space indent
- **Naming**: Use hyphen-case for files (e.g., `find-person.ts`, `message-board.tsx`)
- **Types**: Prefix interfaces with T, capitalize types (e.g., `ServiceResponse`, `GetPersonServiceParams`)
- **Imports**: Order - 1) external packages, 2) @/lib, 3) @/services, 4) @/types, 5) @/vendors
- **Error Handling**: Return `{ data: result, error: null }` for success, `{ data: null, error: serviceError }` for errors

## Architecture Patterns

- Next.js app router for web interface, Supabase for backend
- Never call Supabase directly from Next.js pages, use API routes
- Use Tanstack Query for data fetching
- All service methods should return `ServiceResponse<T>` type
- Validate with Zod schemas
- Use test builders from test-builder/index.ts for tests

## Code Patterns

- Create errors using `createErrorV2` from `@/lib/errors`
- Use `errorLogger` from `@/lib/errors/error-logger` to log errors
- Use `apiResponse` from `@/lib/api-response` to handle API responses
- Make sure to use `@/lib/` for constants. There should never be harded values in the service layer. See `@/lib/custom-fields/constants.ts` for an example.

### Cursor Rules for Superleader Project

YOU ARE A SENIOR ARCHITECT. YOU ARE IN CHARGE OF THE PROJECT STRUCTURE AND YOU MUST MAKE SURE THAT THE PROJECT IS WELL ORGANIZED AND THAT THE CODE IS WELL ARCHITECTED.

### Principles

Developer Experience (DX)

- **Simplicity**: Keep the code simple and easy to understand.
- **Consistency**: Follow the same patterns and conventions throughout the project. If a new pattern is needed, it should be added to the project and it should match the existing patterns at the level of a senior architect or senior engineer.

**General Project Structure**

- This project is a Next.js project:
  - **Next.js Application** using the `app` router for the web interface.
  - **Supabase** as the database and backend service layer.

**Naming Conventions**

- All files should be hypen cased such as find-person.ts or message-board.tsx

**Code Conventions**

- Link from next/link should be used instead of a href for all internal links. Otherwise the full external URL should be used in an anchor tag.
- All icons should come from the `@/components/icons` directory.

- Use @/lib/dates for dealing with dates and timezones
- Use dateHandler method instead of new Date(). Want to use a standard interface for date management

**API Routes**

- None of the Next.jspages should ever call supabase directly and should all be done via the API routes.
- The API routes can then call the supabase client to get the data.
- API routes should use `import { createClient } from '@/utils/supabase/server'`;

**Database**

- We are using Supabase as our database and we are using the Supabase client to get the data.
- There is a requirement for using Row Level Security (RLS) and must create policies for each table. Remind me to create policies for each table.
- All tables should have an updated_at column and a trigger function to update the column when the row is updated.
- Seed files should reference the database.ts file to get the base types.
- Seed files should be dynamic and not hardcoded in a seed.sql file, but instead with TS

**Data Fetching**

- We are using the Tanstack Query library to fetch data from the database.
- We are using the useQuery hook to fetch data from the database.

**Package Management**

- **Yarn** is the required package manager for all installations and dependency management.
- All scripts, CI/CD workflows, and developer commands must ensure Yarn is used instead of npm.

**Working in the Correct Directory**

- Before installing or updating dependencies, always navigate (`cd`) into the specific directory of the application or package you're working on. For example:
  - Use `cd apps/expo` before installing dependencies for the React Native app.
  - Use `cd apps/nextjs` for the Next.js app.
  - Use `cd apps/backend` for backend-specific packages or Supabase-related dependencies.

**Dependency Installation Guidelines**

- Install dependencies using Yarn in the appropriate directory. For example:
  - `cd apps/expo && yarn add <package>` for the React Native app.
  - `cd apps/nextjs && yarn add <package>` for the Next.js app.
- For shared packages within the `packages/` directory, navigate to the package's directory before running installation commands.

**Scripts and Commands**

- Use consistent naming conventions for Yarn scripts in each app. For example:
  - `yarn dev` for local development.
  - `yarn build` for production builds.
  - `yarn start` for running production servers.
- Document any app-specific commands clearly in the README files of their respective directories.

**Environment Management**

- All environment variables required for Supabase, Expo, and Next.js should be stored in `.env` files at the appropriate directory level. Ensure sensitive values are not hardcoded.

**Styling**

- Styling should be as simple as possible making adjustments to the core structure of the application to facilitate fixes

**Typescript Typing**

- Types should be capitalized such as ServiceResponse, GetPersonServiceParams, CreateGroupServiceResult
- When creating derived types that reference tables from the database, use the `Pick` & `Omit` utility types to create a new type with the desired fields.

**Error Handling and Service Response Pattern**

- **Service Response Structure**

  - All service methods should return a `ServiceResponse<T>` type
  - Response should always include both `data` and `error` and data should be null if there is an error
  - Services should define their own ERRORS object using createError from error-factory
  - Each service should export its ERRORS object for reuse in tests and API routes
  - Error objects should include name, type, message, and displayMessage
  - Services should use errorLogger.log for all errors before returning them

- **Service Considerations**

  - Whenever making changes or additions to service methods, always make sure to create or update the service tests accordingly.

- **Error Types**

  - Use `ServiceErrorType` enum for categorizing errors
  - Include meaningful error messages and details
  - Map service errors to appropriate HTTP status codes in API layer
  - Log detailed errors but return safe error messages to clients
  - Error types should be defined in the service and exported for reuse

- **Testing**

  - Use Jest as the testing framework
  - Tests should be organized in describe blocks for different test categories:
    - success cases
    - error cases
    - isolation tests (when updating data)
  - Use withTestTransaction for database tests to ensure clean state
  - Verify changes using service methods (e.g., use getPerson to verify updatePerson)
  - Create test data using test builders (e.g., createTestUser, createTestPerson)
  - Test both individual field updates and bulk updates
  - Test data isolation (changes don't affect other records)
  - Test deletion cases by verifying empty arrays/null values
  - Match error objects exactly using toMatchObject
  - Verify both the initial state and final state in modification tests
  - When creating tests & importing from test-builder, use the index.ts file to import & export

Examples of good tests:

- src/services/context/**tests**/get-initial-context-message.test.ts

**Service Method Patterns**

- **Parameters**

  - Accept a single params object with db as first parameter
  - Use TypeScript interface for params (prefixed with T)
  - Document all required and optional parameters

- **Response Structure**

  - Use ServiceResponse<T> type for all returns
  - Return { data: null, error: serviceError } for errors
  - Return { data: result, error: null } for success

- **API Route Integration**

  - Use apiResponse utility for consistent HTTP responses
  - Map service errors to HTTP status codes
  - Handle authentication in the route before calling service
  - Validate input using zod schemas before calling service

- **Import Structure**

  - External packages first
  - Internal imports grouped and ordered:
    1. @/lib/\*
    2. @/services/\*
    3. @/types/\*
    4. @/vendors/\*
  - Imports alphabetically ordered within groups

- **Type Definitions**

  - Interfaces/types prefixed with T
  - Export schema and types separately from implementation
  - Use zod for validation schemas where applicable

- **Error Handling**

  - Use nested error objects (e.g., ERRORS.CATEGORY.ERROR_NAME)
  - Include code, type, message, and displayMessage
  - Use ErrorType enum from @/types/errors
  - Add error details when throwing

- **Service Structure**
  - Define and export params interface first
  - Define and export error constants second
  - Main service function last
  - Helper/utility functions at bottom
  - Use ServiceResponse<T> for return types

**Schema Patterns**

- **Validation Schemas**

  - Use zod for all validation schemas
  - Export schema and types (prefixed with T)
  - Keep validation rules in schema, not in service
  - Match schema structure to database tables
  - Export form data types for component use

**Database Patterns**

- **Transactions**

  - Use withTestTransaction in tests
  - Pass db client through all service calls
  - Keep database logic in service layer
  - Match table structure in types and schemas
