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
