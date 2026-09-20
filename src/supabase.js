import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvhsedhosfuznwbfoeub.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aHNlZGhvc2Z1em53YmZvZXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NzQ5MTEsImV4cCI6MjEwNTE1MDkxMX0.S3sTRZuTORxkBlT6yNbC045T1Da3Gxvh81Muwzei6zA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)