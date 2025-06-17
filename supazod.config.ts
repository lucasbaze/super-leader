import { defineConfig } from 'supazod';

export default defineConfig({
  namingConfig: {
    // TypeScript provides autocomplete for placeholders:
    // {schema}, {table}, {operation}, {function}, {name}
    tableOperationPattern: '{table}_{operation}',
    enumPattern: '{name}_Enum',
    functionArgsPattern: '{function}_Args',
    functionReturnsPattern: '{function}_Returns',

    // Capitalization and formatting
    capitalizeSchema: true,
    capitalizeNames: true,
    separator: '_'
  }
});
