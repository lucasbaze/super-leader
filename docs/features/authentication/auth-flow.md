# Authentication Flow Documentation

## Overview

This document outlines the authentication workflows in the Super Leader application, covering login, account creation, and password reset processes. The authentication system uses Supabase for backend services with a hybrid server/client-side rendering approach.

## Architecture Notes

- **Login forms**: Client-side rendered components
- **Pages**: Server-side rendered
- **Authentication logic**: Executed server-side using Supabase server middleware
- **Session management**: Handled through cookies and tokens

---

## 1. Login Flow

### Process Overview

The login process combines client-side form interaction with server-side authentication processing.

### Step-by-Step Flow

1. **User Interface**

   - Login form component renders client-side
   - Page itself is server-side rendered
   - User enters email and password

2. **Authentication Processing**

   - Login action executes on server-side
   - Supabase server middleware handles authentication
   - Uses standard email/password sign-in method

3. **Session Management**

   - Authentication cookies and session data are set
   - **Critical Step**: Supabase client is recreated after login
   - This recreation captures the newly set authentication tokens and enabled the check on the user_profile table
   - Ensures proper session state for subsequent operations

4. **User Profile Verification**
   - System checks if user profile exists
   - Uses the authenticated database connection
   - Completes login process

### Key Technical Details

- The client recreation after login is essential for session synchronization
- Server-side middleware manages cookie-based session persistence

---

## 2. Create Account Flow

### Process Overview

Account creation involves waitlist validation, account setup, email verification, and user initialization.

### Step-by-Step Flow

1. **Waitlist Validation**

   - System first checks if user email is on the waitlist
   - Only proceeds if email is enabled in the waitlist

2. **Account Creation**

   - User account is created in Supabase using the serviceRoleClient because the user is not yet authenticated and cannot use the setupNewUser function otherwise
   - Triggers automatic email verification process

3. **User Setup**

   - System creates user profile
   - Initializes default groups for the user
   - **Important**: User cannot log in at this stage

4. **Email Verification**

   - User receives verification email
   - Must click verification link in email
   - Verification process validates the account

5. **Account Activation**
   - Verification redirects user back to login page
   - Account is now verified and active
   - User can proceed with normal login flow

### Key Technical Details

- Account creation and login are separate processes
- User setup happens immediately after account creation
- Email verification is mandatory before first login

---

## 3. Reset Password Flow

### Process Overview

Password reset uses a secure token-based system with temporary session creation for password updates.

### Step-by-Step Flow

1. **Reset Request**

   - User enters email address in reset password form
   - System sends password reset email

2. **Email Token**

   - Email contains secure token
   - Token is used to create temporary authenticated session

3. **Session Creation**

   - Auth confirm route handles the token verification
   - **Server-side page** uses server-side Supabase instance
   - Verifies OTP (One-Time Password) from email
   - Creates temporary session for password update

4. **Password Update**

   - User redirected to update password page
   - Page is server-side rendered and protected
   - **Session Required**: User must have valid session to access
   - Session is available from previous OTP verification

5. **Completion**
   - User updates password using authenticated session
   - Password is updated in Supabase
   - User can return to login page
   - Can now log in with new password

### Key Technical Details

- OTP verification creates temporary session specifically for password update
- Update password page requires authentication (protected route)
- Session management bridges the gap between email verification and password update

---

## Security Considerations

- All authentication actions occur server-side for security
- Session tokens are managed through secure cookies
- OTP tokens are single-use and time-limited
- Protected routes verify session validity before allowing access
- Client recreation after login ensures token synchronization

---

## Technical Implementation Notes

- **Supabase Client Management**: Critical to recreate client after authentication events
- **Session Persistence**: Cookies maintain session state across requests
- **Server-Side Rendering**: Pages are SSR for security and performance
- **Middleware**: Supabase middleware handles authentication state management
