import express from "express"

const app=express()
app.use(express.json())

app.post("/poorplexity_ask", async(req, res)=>{
    //basic architecture:

    //get query from user

    //make sure user has enough credits

    // if query in cache return else continue further #idt ill implement this now for the time being

    // web search to gather sources using external api

    //do context engineering #REPRESENTATION LEARNING FROM AGA

    //hit llm and stream reponse

    //parallely strem resources from the external api, post structuring it ofc

    const query=req.body.query
})

app.listen(3000)