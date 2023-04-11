// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { BabyAGI } from './babyAgi/babyAgi'
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { getPineconeClient, waitUntilIndexIsReady } from './utils/pinecone';
import { OpenAI } from 'langchain/llms/openai';

const run = async () => {
  const client = await getPineconeClient()
  const indexName = "babyagi"

  await client.createIndex({
    createRequest: {
      name: "babyagi",
      dimension: 1536,
    }
  })

  await waitUntilIndexIsReady(client, indexName)

  const pineconeIndex = client.Index("babyagi")

  const model = new OpenAI({ temperature: 0 });

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  const babyAgi = new BabyAGI(model, false, vectorStore, 10);

  await babyAgi.execute({ "objective": "Create a weather report for SF" })

  //Cleanup
  client.deleteIndex({ indexName })

}

run()