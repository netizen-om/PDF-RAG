import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker(
    'file-upload-queue',
    async(job) => {
        console.log('Job : ', job.data)
        const data = JSON.parse(job.data);

        //PDF loader
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();

        const textSplitter = new CharacterTextSplitter({
            chunkSize: 100,
            chunkOverlap: 0,
        });
        const texts = await textSplitter.splitText(docs);
        console.log(texts);
        
    },
    {
        concurrency : 100,
        connection : {
            host : 'localhost',
            port : 6379,
        },
    }
    
)
