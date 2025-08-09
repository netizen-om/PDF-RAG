import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { log } from "console";

const worker = new Worker(
    'file-upload-queue',
    async(job) => {
        console.log('Job : ', job.data)
        const data = JSON.parse(job.data);

        //PDF loader
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        console.log("DOCS : ", docs);
        
       
        
    },
    {
        concurrency : 100,
        connection : {
            host : 'localhost',
            port : 6379,
        },
    }
    
)
