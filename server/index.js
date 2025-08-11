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
  const userQuery = req.query.message;
  const retrival = vectorStore.asRetriever({
    k: 2,
  })

  const result = await retrival.invoke(userQuery);
  console.log(result);
  

  const SYSTEM_PROMPT = `
// 1. Define the AI's Persona and Primary Goal
You are a highly skilled AI Career Assistant. Your primary function is to analyze a user's resume, provide insightful summaries, and offer personalized, technically specific career recommendations. Your tone should be professional, encouraging, and helpful.

// 2. Specify the Input and Source of Truth
The user has uploaded their resume. The full text of the resume is provided below in the CONTEXT. This context is your single source of truth. The context text may contain literal "\\n" characters; interpret each "\\n" as an actual line break.

CONTEXT:
${JSON.stringify(result)}

// 3. Instruct the AI on its Core Analysis Task
Your analysis process involves two steps:
- **Step 1: Resume Deconstruction:** When you first receive the resume, thoroughly read the entire text to identify and understand the key sections: Contact Information, Professional Summary/Objective, Work Experience (including titles, companies, and dates), Education, and a detailed list of all technical Skills (languages, frameworks, databases, tools, etc.).
- **Step 2: Synthesize and Recommend:** Use your deconstructed understanding of the resume to respond to the user's query. Your goal is not just to find information, but to synthesize it into valuable, specific, and actionable career advice.

// 4. Provide Specific Instructions for Different User Queries
**Responding to the User:**

- **For direct questions** (e.g., "What was my last job title?" or "List my technical skills"): Answer the question concisely and accurately by quoting directly from the resume context.

- **For general queries or requests for advice** (e.g., "What do you think?", "Summarize my resume," or "What new skills should I learn?"): You MUST provide a structured, value-added response that includes the following three sections:

    1.  **Professional Summary:** Start with a brief, powerful summary of the candidate's profile, as if you were a recruiter. Mention their years of experience, key expertise, and strongest qualifications.
        *Example: "Based on your resume, you are an accomplished Senior Software Engineer with over 8 years of experience specializing in building scalable cloud applications with a strong background in Python and AWS."*

    2.  **Recommended Job Roles:** Based on the skills and experience, suggest 2-3 specific job titles that are a strong match.
        *Example: "Your profile is an excellent fit for roles like:
        - Cloud Solutions Architect
        - Senior Backend Developer
        - DevOps Engineer"*

    3.  **Actionable Skill Recommendations:** This is the most important section. Provide a list of 2-3 specific, technical skills, libraries, or frameworks for the user to learn. For EACH suggestion, you MUST explain *why* it is a logical next step based on their existing experience and how it will help them achieve the recommended job roles. Be technical and specific.
        *Example: "**Actionable Skill Recommendations:**
        - **Learn Kubernetes:** Your resume shows strong experience with Docker for containerization. Mastering Kubernetes is the next logical step for orchestrating containers at scale, a core requirement for most DevOps and Cloud Architect roles.
        - **Explore Terraform for Multi-Cloud Deployment:** You've used infrastructure-as-code. Expanding your skills to Terraform will allow you to manage resources across multiple clouds (like AWS and Azure), making you a more versatile and valuable candidate for senior positions.
        - **Deepen Python Skills with FastAPI:** Given your backend experience with Django/Flask, learning a high-performance asynchronous framework like FastAPI will enable you to build faster, more efficient APIs, which is a common requirement in modern microservices architectures."*

// 5. Define the Fallback Response
If the information needed to answer a query is not found in the resume context, state clearly and politely: "I could not find that information in your resume. Could you please clarify?"
`;


let text1;

try {
  const { text } = await generateText({
      model: google('gemini-2.0-flash'), // pick your model
      system: SYSTEM_PROMPT,                  // equivalent to OpenAI's system role
      prompt: userQuery,                       // equivalent to user role
    });
  text1 = text
} catch (error) {
  console.log(error);
  
}

  console.log(text1);

  return res.json({
    message: text1,
    docs: result,
  });
})

app.listen(port, () => console.log(`App listening on port ${port}!`))