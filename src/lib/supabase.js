import { createClient } from '@supabase/supabase-js';

// As strings devem estar entre aspas simples ou duplas
const supabaseUrl = 'https://wiljyrewwkkcxunlboaa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpbGp5cmV3d2trY3h1bmxib2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MTY4NjgsImV4cCI6MjA5MzA5Mjg2OH0.-7tOCL3AbwD7k0Ib7-yzVNlY1iEvEAi2K5HziTso2Hw'; // Use a chave anon public completa da imagem 1

export const supabase = createClient(supabaseUrl, supabaseKey);