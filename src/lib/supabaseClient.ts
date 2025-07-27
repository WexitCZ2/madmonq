// src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jvztzkdigjekzqnahmke.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enR6a2RpZ2pla3pxbmFobWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NDU2MTIsImV4cCI6MjA2OTIyMTYxMn0.Albg71T_yIkNhHTvx5uIuZG9c07RS9gXPSkTZTK-4j4';

export const supabase = createClient(supabaseUrl, supabaseKey);