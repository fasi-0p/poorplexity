import express, { type Request, type Response } from "express"
import { tavily } from "@tavily/core"
import { streamText, Output } from 'ai'
import { PROMPT_TEMPLATE, SYSTEM_PROMPT } from './prompt'
import { z } from 'zod'
import { prisma } from "./db"
import { middleware } from "./middleware"
import cors from 'cors'
import { groq } from '@ai-sdk/groq'

// Extend Request type locally
export interface AuthenticatedRequest extends Request {
    userId?: string;
}

const app = express()
app.use(express.json())
app.use(cors())
const client = tavily({ apiKey: process.env.TAVILY_API_KEY })

app.post("/poorplexity_ask", middleware, async (req: AuthenticatedRequest, res: Response) => {
    //basic architecture:

    //get query from user
    const query = req.body.query

    //make sure user has enough credits

    // if query in cache return else continue further #idt ill implement this now for the time being

    // web search to gather sources using external api
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    })
    const webSearchResult = webSearchResponse.results

    //do context engineering #REPRESENTATION LEARNING FROM AGA
    const prompt = PROMPT_TEMPLATE.
        replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query)

    // Save conversation to DB
    const conversation = await prisma.conversation.create({
        data: {
            title: query.substring(0, 50),
            slug: Math.random().toString(36).substring(2, 10),
            userId: req.userId!,
            messages: {
                create: {
                    content: query,
                    role: 'USER'
                }
            }
        }
    });

    //hit llm and stream reponse
    const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: prompt,
        system: SYSTEM_PROMPT,
    })

    //parallely strem resources from the external api, post structuring it ofc

    //headers to let it know its a stream
    res.header('Cache-control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')

    let assistantMessage = "";

    for await (const textPart of result.textStream) {
        res.write(textPart)
        assistantMessage += textPart;
        //todo pass it to frontend
    }

    res.write("\n <SOURCES> \n")
    res.write(JSON.stringify(webSearchResult))
    res.write("\n </SOURCES> \n")

    res.write(`\n <CONVERSATION_ID>${conversation.id}</CONVERSATION_ID> \n`)

    res.end()

    // Save assistant response to DB
    await prisma.message.create({
        data: {
            content: assistantMessage,
            role: 'ASSISTANT',
            conversationId: conversation.id
        }
    });
})

app.post('/poorplexity_ask/follow_up', middleware, async (req: AuthenticatedRequest, res: Response) => {
    const { query, conversationId } = req.body;

    if (!conversationId) {
        res.status(400).json({ error: "conversationId is required" });
        return;
    }

    // save user message
    await prisma.message.create({
        data: {
            content: query,
            role: 'USER',
            conversationId
        }
    });

    // get existing chat from db
    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' }
    });

    // web search
    const webSearchResponse = await client.search(query, {
        searchDepth: "advanced"
    });
    const webSearchResult = webSearchResponse.results;

    // forward full history to db (Context Engineering)
    const prompt = PROMPT_TEMPLATE.
        replace("{{WEB_SEARCH_RESULTS}}", JSON.stringify(webSearchResult))
        .replace("{{USER_QUERY}}", query);

    const history = messages.map(m => `${m.role}: ${m.content}`).join("\n\n");
    const fullPrompt = `Here is the conversation history:\n${history}\n\n${prompt}`;

    // stream response
    const result = streamText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: fullPrompt,
        system: SYSTEM_PROMPT,
    });

    res.header('Cache-control', 'no-cache')
    res.header('Content-Type', 'text/event-stream')

    let assistantMessage = "";

    for await (const textPart of result.textStream) {
        res.write(textPart)
        assistantMessage += textPart;
    }

    res.write("\n <SOURCES> \n")
    res.write(JSON.stringify(webSearchResult))
    res.write("\n </SOURCES> \n")

    res.end()

    await prisma.message.create({
        data: {
            content: assistantMessage,
            role: 'ASSISTANT',
            conversationId
        }
    });
})

// Can be left empty or removed as middleware handles DB user sync from Supabase
app.post('/signup', async (req: Request, res: Response) => {
    res.json({ message: "Signup handled by Supabase" })
})

app.post('/signin', async (req: Request, res: Response) => {
    res.json({ message: "Signin handled by Supabase" })
})

app.get('/conversations', middleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversations = await prisma.conversation.findMany({
            where: { userId: req.userId! },
            select: { id: true, title: true, slug: true },
            orderBy: { id: 'desc' }
        });
        res.json({ conversations });
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
})

app.get('/conversation/:conversationId', middleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const conversationId = req.params.conversationId;
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
                userId: req.userId!
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!conversation) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        res.json(conversation);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
})

app.listen(3001, () => {
    console.log("Server listening on port 3001");
})