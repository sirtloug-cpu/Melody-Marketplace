import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwqvkehcajgbdjetadgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3cXZrZWhjYWpnYmRqZXRhZGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTAzMTAsImV4cCI6MjA4NTA2NjMxMH0.H6TU8Q9y8Vsk2Joy-lZsSAKXoM5mAWZixLFbQR21OCE';

export const supabase = createClient(supabaseUrl, supabaseKey);