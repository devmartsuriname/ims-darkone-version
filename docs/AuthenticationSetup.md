# Authentication & User Management Setup Guide

## Initial System Setup

The IMS system includes an automatic initial setup process for creating the first administrator account.

### First Time Access

1. **Navigate to the application** - When you first access the system, if no admin users exist, you'll see an "Initial System Setup" modal
2. **Create Administrator Account** - Fill in the required information:
   - First Name and Last Name (required)
   - Email Address (required) - This will be your login username
   - Password (required, minimum 6 characters)
   - Phone Number (optional)
   - Department and Position (optional, defaults provided)

3. **Complete Setup** - Click "Create Administrator Account" to create your admin user
4. **Ready to Sign In** - You'll be redirected to the sign-in page where you can log in with your new credentials

### Manual Admin Creation

If you need to create additional admin users later:

1. Sign in as an existing administrator
2. Navigate to **Administration > Users** 
3. Click **"Add User"** button
4. Fill in the user details and assign appropriate roles
5. Save the user

## User Roles and Permissions

The system supports the following user roles:

- **Administrator** - Full system access, can manage users and all applications
- **IT Support** - Technical access, can manage users and system functions  
- **Staff Member** - Can create and manage applications
- **Control Inspector** - Can perform property inspections and upload photos
- **Director** - Can review applications and make recommendations
- **Minister** - Can make final approval decisions
- **Front Office** - Can assist with application intake
- **Applicant** - Limited access for applicants (default role)

## Security Features

- **Row Level Security (RLS)** - All database access is controlled by user roles
- **Secure Authentication** - Uses Supabase Auth with email verification
- **Password Requirements** - Minimum 6 characters for new accounts
- **Session Management** - Automatic token refresh and secure session handling
- **Audit Logging** - All user actions are logged for compliance

## Troubleshooting

### Cannot Sign In
- Verify email and password are correct
- Check if email confirmation is required (check your email)
- Contact an administrator if account is deactivated

### Initial Setup Not Appearing
- Clear browser cache and refresh the page
- Verify no admin users exist in the system
- Contact support if issues persist

### Role Access Issues
- Verify your user account has the correct roles assigned
- Contact an administrator to update your permissions
- Check if your account is active

## Next Steps

After authentication is set up:
1. Create additional user accounts for your team
2. Assign appropriate roles based on job functions  
3. Test the application workflow with different user types
4. Configure additional system settings as needed