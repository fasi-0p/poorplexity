import type{NextFunction, Request, Response} from 'express'
import { createClient } from '@supabase/supabase-js' 
const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_API_SECRET!)

export async function middleware(req: Request,res: Response, next: NextFunction){
    const token=req.headers.authorization

    const data=await client.auth.getUser(token)
    const userId = data.data.user?.id
    if (userId){
        req.userId=userId
        next()
    }else{
        res.status(403).json({
            message:"incorrect credentials niqq"
        })
    }
}