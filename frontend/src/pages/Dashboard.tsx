import {createClient} from '@supabase/supabase-js'
import {useEffect, useState} from 'react'
import type {User} from '@supabase/supabase-js'
import { useNavigate } from 'react-router'
import axios from 'axios'
import {BACKEND_URL} from '../lib/config'

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

    useEffect(()=>{
        async function getExistingConversations(){
            if (user){
                const {data:{session}} = await supabase.auth.getSession()
                const jwt= session?.access_token
                const response = await axios.get(`${BACKEND_URL}/conversations`, {
                    headers:{
                        Authorization: jwt
                    }
                })
                console.log(response.data)
            }
        }
        getExistingConversations()
    }, [user])

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