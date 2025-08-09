import express from "express"
import cors from "cors"
import multer from "multer"
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings  }  from "@langchain/google-genai"
import { Queue } from "bullmq"
import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import dotenv from 'dotenv';

dotenv.config();

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const queue = new Queue("file-upload-queue", {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'embedding-001',
  apiKey: process.env.GOOGLE_API_KEY
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(
  embeddings,
  {
    url: "http://localhost:6333",
    collectionName: 'pdf-docs'
  }
)

const app = express()
const port = 8000

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

app.use(cors())


app.get('/', (req, res) => res.send('Hello World!'))

app.post('/upload/pdf', upload.single('pdf'), (req, res) => {

  queue.add('file-ready', JSON.stringify({
    filename: req.file.originalname,
    destination: req.file.destination,
    path: req.file.path,
  }))
  return res.json({ message: "File uploaded" })
})

app.get('/chat', async (req, res) => {
  const userQuery = "What are key course outcomes"
  const retrival = vectorStore.asRetriever({
    k: 2,
  })

  const result = await retrival.invoke(userQuery);

  const SYSTEM_PROMPT = `You are helpful AI Assistant who answers the user query based on the available context from PDF file
  CONTEXT :
  ${JSON.stringify(result)}
  `
   const { text } = await generateText({
    model: google('gemini-2.0-flash'), // pick your model
    system: SYSTEM_PROMPT,                  // equivalent to OpenAI's system role
    prompt: userQuery,                       // equivalent to user role
  });

  console.log(text);

  return res.json({text})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))