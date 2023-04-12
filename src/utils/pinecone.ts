import { IndexMeta, PineconeClient } from "@pinecone-database/pinecone";
import { config } from 'dotenv'

config()

export const waitUntilIndexIsReady = async (client: PineconeClient, indexName: string) => {
  try {
    const indexDescription: IndexMeta = await client.describeIndex({ indexName })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!indexDescription.status?.ready) {
      process.stdout.write(".")
      await new Promise((r) => setTimeout(r, 1000));
      await waitUntilIndexIsReady(client, indexName)
    }
    else {
      return
    }
  } catch (e) {
    console.error('Error waiting until index is ready', e)
  }
}

let pineconeClient: PineconeClient | null = null
export const getPineconeClient: () => Promise<PineconeClient> = async () => {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY environment variable not set");
  }
  if (!process.env.PINECONE_ENVIRONMENT) {
    throw new Error("PINECONE_ENVIRONMENT environment variable not set");
  }

  if (!process.env.PINECONE_INDEX) {
    throw new Error("PINECONE_INDEX environment variable not set");
  }

  if (pineconeClient) {
    return pineconeClient
  } else {
    pineconeClient = new PineconeClient();

    await pineconeClient.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
  }
  return pineconeClient
}

export const createIndexIfNotExists = async (client: PineconeClient, indexName: string) => {
  try {
    const indexList = await client.listIndexes()
    if (!indexList.includes(indexName)) {
      console.log("Creating index", indexName)
      await client.createIndex({
        createRequest: {
          name: indexName,
          dimension: 1536,
        }
      })
      console.log("Waiting until index is ready...")
      await waitUntilIndexIsReady(client, indexName)
      console.log("Index is ready.")
    }

  } catch (e) {
    console.error('Error creating index', e)
  }
}