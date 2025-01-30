import { createClient } from '@supabase/supabase-js';

import { seedPeople } from './people';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  try {
    // Clean existing data
    await supabase.from('messages').delete().neq('id', '');
    await supabase.from('person').delete().neq('id', '');
    await supabase.from('addresses').delete().neq('id', '');
    await supabase.from('contact_methods').delete().neq('id', '');
    await supabase.from('websites').delete().neq('id', '');

    // Create a test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true
    });

    if (userError) throw userError;
    if (!user.user) throw new Error('Failed to create user');

    const userId = user.user.id;
    console.log('Created test user with ID:', userId);

    // Seed people and their related data
    await seedPeople({ supabase, userId });

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main();
