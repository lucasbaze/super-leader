'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/lib/routes';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/error');
  }

  revalidatePath(ROUTES.HOME, 'layout');
  redirect(ROUTES.HOME);
}

export async function logout() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Revalidate all protected routes
  revalidatePath(ROUTES.HOME, 'layout');

  // Redirect to login page
  redirect(ROUTES.LOGIN);
}
