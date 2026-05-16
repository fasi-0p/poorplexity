import React from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Auth() {
  const supabase = createClient('https://ltfeptqhfkdfjivuthul.supabase.co', 'sb_publishable_LPIRFBCiUAfkODTJn8yHuw_yB1n7teP')
  // const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_ANON_KEY!)
  async function login(provider: 'google' | 'github'){
    const {data, error} = await supabase.auth.signInWithOAuth({
      provider: provider
    })

  }

  return (
    <div>
      <button onClick={()=> login('github')}>Login with Github</button>
      <button onClick={()=> login('google')}>Login with Google</button>
    </div>
  )
}
