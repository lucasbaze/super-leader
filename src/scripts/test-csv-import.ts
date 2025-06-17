// src/scripts/test-csv-import.ts
import dotenv from 'dotenv';
import path from 'path';

import { importCSV } from '@/services/import/csv-import';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const remainingMs = ms % 1000;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s ${remainingMs}ms`;
  }
  if (seconds > 0) {
    return `${seconds}s ${remainingMs}ms`;
  }
  return `${remainingMs}ms`;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node test-csv-import.ts <userId> <filePath>');
    process.exit(1);
  }

  const startTime = performance.now();
  console.log('Starting CSV import process...');

  const supabase = await createServiceRoleClient();
  const [userId, filePath] = args;

  // Run the CSV import
  const result = await importCSV({
    db: supabase,
    filePath,
    userId,
    chunkSize: 20
  });

  const endTime = performance.now();
  const duration = endTime - startTime;

  console.log('\nImport Statistics:');
  console.log('-----------------');
  console.log(`Total Duration: ${formatDuration(duration)}`);

  if (result.error) {
    console.error('\nCSV import failed:', result.error.details);
  } else {
    console.log('\nCSV import results:');
    console.log('-----------------');
    console.log(`Processed Records: ${result.data?.processed || 0}`);
    console.log(`Errors: ${result.data?.errors.length || 0}`);

    if (result.data?.errors.length) {
      console.log('\nError Details:');
      result.data.errors.forEach((error, index) => {
        console.log(`\nError ${index + 1}:`);
        console.log(JSON.stringify(error, null, 2));
      });
    }
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
