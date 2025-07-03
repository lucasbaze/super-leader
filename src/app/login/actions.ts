'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { clearQueryCache } from '@/lib/react-query';
import { ROUTES } from '@/lib/routes';
import { login as loginService } from '@/services/auth/login';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Use the login service
  const result = await loginService({
    db: supabase,
    email,
    password
  });

  if (result.error) {
    if (result.error.name === 'user_not_found') {
      redirect(`/login?error=user_not_found&email=${encodeURIComponent(email)}`);
    }

    // For email confirmation errors, redirect to login with error state
    if (result.error.name === 'email_not_confirmed') {
      redirect(`/login?error=email_not_confirmed&email=${encodeURIComponent(email)}`);
    }

    // For other errors, redirect to error page
    redirect(`/login?error=unknown_error&email=${encodeURIComponent(email)}`);
  }

  // Clear cache and redirect to app
  revalidatePath(ROUTES.APP, 'layout');
  redirect(ROUTES.APP);
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });

  return { success: !error, error: error?.message };
}

export async function logout() {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Clear the query cache
  clearQueryCache();

  // Revalidate all protected routes
  revalidatePath(ROUTES.APP, 'layout');

  // Redirect to login page
  redirect(ROUTES.LOGIN);
}
