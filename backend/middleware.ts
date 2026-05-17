import type{NextFunction, Request, Response} from 'express'
import { createClient } from '@supabase/supabase-js' 
import { prisma } from './db'

const client = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_API_SECRET!)

export async function middleware(req: Request,res: Response, next: NextFunction){
    const token=req.headers.authorization

    const data=await client.auth.getUser(token)
    const userId = data.data.user?.id
    if (userId){
        try{
            await prisma.user.create({
                data:{
                    id: data.data.user!.id,
                    supabaseId: data.data.user!.id,
                    email: data.data.user?.email!,
                    provider: data.data.user?.app_metadata.provider==='google'? 'GOOGLE':'GITHUB',
                    name: data.data.user?.user_metadata.full_name
                }
            })
        }catch(e){
            console.log(e)
        }
        req.userId=userId
        next()
    }else{
        res.status(403).json({
            message:"incorrect credentials niqq"
        })
    }
}