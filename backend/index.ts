import express from "express"
import {tavily} from "@tavily/core"
import { streamText, Output } from 'ai'
import {PROMPT_TEMPLATE, SYSTEM_PROMPT} from './prompt'
import {z} from 'zod'
import { prisma } from "./db"
import { middleware } from "./middleware"
import cors from 'cors'



const app=express()
app.use(express.json())
app.use(cors())
const client=tavily({apiKey: process.env.TAVILY_API_KEY})

app.post("/poorplexity_ask",middleware, async(req, res)=>{
    //basic architecture:

    //get query from user

    //make sure user has enough credits

    // if query in cache return else continue further #idt ill implement this now for the time being

    // web search to gather sources using external api

    //do context engineering #REPRESENTATION LEARNING FROM AGA

    //hit llm and stream reponse

    //parallely strem resources from the external api, post structuring it ofc

    const query=req.body.query

    const webSearchResponse= await client.search(query, {
        searchDepth: "advanced"
    }) 
    const webSearchResult=webSearchResponse.results

    const prompt = PROMPT_TEMPLATE.
    replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
    .replace("{{USER_QUERY}}", query)
    //hittin llm
    const result = streamText({
        model: 'openai/gpt-5.5',
        prompt: prompt,
        system: SYSTEM_PROMPT,
    })

    //headers to let it know its a stream
    res.header('Cache-control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')

    for await(const textPart of result.textStream){
        res.write(textPart)
        //todo pass it to frontend
    }

    res.write("\n <SOURCES> \n")
     
    res.write(JSON.stringify(webSearchResult))
    
    res.write("\n <SOURCES> \n")

    res.end()
})

app.post('/poorplexity_ask/follow_up',middleware, async(req, res)=>{
    // get existing chat from db
    // forward full history to db
    // stream response
})

app.post('/signup', async(req, res)=>{

})

app.post('/signin', async(req, res)=>{

})

app.get('/conversations',middleware, async(req, res)=>{
    res.json({
        userId: req.userId
    })
})

app.post('/conversation/:conversationId',middleware, async(req, res)=>{

})

app.listen(3001)  