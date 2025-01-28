import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LoginFormProps = {
  className?: string;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function LoginForm({ className, onSubmit }: LoginFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <Card className='overflow-hidden'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          <form action={onSubmit} className='p-6 md:p-8'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center text-center'>
                <h1 className='text-2xl font-bold'>Welcome Superleader</h1>
                <p className='text-balance text-muted-foreground'>Let's login to your super life</p>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' name='email' type='email' placeholder='m@example.com' required />
              </div>
              <div className='grid gap-2'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                </div>
                <Input id='password' name='password' type='password' required />
              </div>
              <Button type='submit' className='w-full'>
                Login
              </Button>
              <a href='#' className='text-center text-sm underline-offset-2 hover:underline'>
                Forgot your password?
              </a>
            </div>
          </form>
          <div className='relative hidden bg-muted md:block'>
            <img
              src='https://placehold.co/600x400'
              alt='Image'
              className='absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale'
            />
          </div>
        </CardContent>
      </Card>
      <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
      </div>
    </div>
  );
}
