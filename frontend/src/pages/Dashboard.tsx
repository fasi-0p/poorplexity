import {createClient} from '@supabase/supabase-js'
import {useEffect, useState} from 'react'
import type {User} from '@supabase/supabase-js'
import { useNavigate } from 'react-router'

const supabase = createClient('https://ltfeptqhfkdfjivuthul.supabase.co', 'sb_publishable_LPIRFBCiUAfkODTJn8yHuw_yB1n7teP')

export default function Dashboard(){
    const navigate=useNavigate()
    const [user, setUser] = useState<User | null>(null)

    useEffect(()=>{
        async function getInfo(){
            const {data, error}=await supabase.auth.getUser()
            if (data.user){
                setUser(data.user)
            }
        }
        getInfo()
    }, [])

    return (
        <div>
            {!user && <button onClick={()=> navigate('/auth')}>
                login niqq    
            </button>}
            email 
            {user?.email}
            <button onClick={()=>{supabase.auth.signOut(); setUser(null)}}>
                Logout
            </button>
        </div>
    )
}