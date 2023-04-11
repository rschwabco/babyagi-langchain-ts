// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { BabyAGI } from './babyAgi'
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getPineconeClient } from '../utils/pinecone';
import { OpenAI } from 'langchain/llms/openai';

const run = async () => {
  const client = await getPineconeClient()
  const pineconeIndex = client.Index("babyagi")

  const model = new OpenAI({ temperature: 0 });

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const babyAgi = new BabyAGI(model, true, vectorStore, 3);

  babyAgi.execute({ "objective": "Create a weather report for SF" })
}

run()