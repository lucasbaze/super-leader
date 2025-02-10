import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import { bulkImportPeople, ImportPeopleSchema } from '@/services/people/bulk-import-people';
import { Database } from '@/types/database';

// Load .env file from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: ts-node bulk-import-from-json.ts <userId> <filePath>');
    process.exit(1);
  }

  const [userId, filePath] = args;

  // Read and parse the JSON file
  const fullPath = path.resolve(filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');
  const jsonData = JSON.parse(fileContent);

  // Validate the JSON data
  const validationResult = ImportPeopleSchema.safeParse(jsonData);
  if (!validationResult.success) {
    console.error('Invalid JSON data:', JSON.stringify(validationResult.error.format(), null, 2));
    process.exit(1);
  }

  const peopleData = validationResult.data;

  // Create a Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Run the bulk import
  const result = await bulkImportPeople({
    db: supabase,
    userId,
    people: peopleData
  });

  if (result.error) {
    console.error('Bulk import failed:', result.error.details);
  } else {
    console.log('Bulk import successful:', result.data);
  }
}

main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
