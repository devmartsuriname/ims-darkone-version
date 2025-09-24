-- Add notification_preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN notification_preferences JSONB DEFAULT '{
  "email_notifications": true,
  "sms_notifications": false,
  "application_updates": true,
  "deadline_reminders": true,
  "decision_notifications": true,
  "system_notifications": true,
  "reminder_frequency": "immediate",
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00"
}'::jsonb;