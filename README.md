# Superleader

## Development

1. Clone the repo
2. Run `yarn install`
3. Start Supabase with Docker running locally
4. Run `yarn dev`

### What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `native`: a [react-native](https://reactnative.dev/) app built with [expo](https://docs.expo.dev/)
- `web`: a [Next.js](https://nextjs.org/) app built with [react-native-web](https://necolas.github.io/react-native-web/)
- `@repo/ui`: a stub [react-native](https://reactnative.dev/) component library shared by both `web` and `native` applications
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [Expo](https://docs.expo.dev/) for native development
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Prettier](https://prettier.io) for code formatting

### Common Commands

#### Supabase

Getting types from local Supabase CLI:

```bash
> npx supabase gen types typescript --local > ./src/types/database.ts
```

Getting diff of migrations from local Supabase CLI:

```bash
> npx supabase db diff
```

Creating a new migration:

```bash
> npx supabase migration new <migration-name>
```

Running migrations:

```bash
> npx supabase migration up
```

