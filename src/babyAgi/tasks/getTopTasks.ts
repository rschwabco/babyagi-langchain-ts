import { LLMChain } from "langchain";
import { VectorStore } from "langchain/vectorstores/base";
import { BabyAgent } from "../agents/agent";
import { CustomAgent } from "../agents/customeAgent";

interface VectorStoreItem {
  metadata: {
    task: string;
  };
}

// Returns the top k tasks based on the query.
// The query is a string that is used to search for the most similar tasks.
// The results are sorted based on the cosine similarity score.
// The results are then mapped to return only the task name.
async function getTopTasks(vectorStore: VectorStore, query: string, k: number): Promise<string[]> {
  // Get the top k tasks based on the query.
  const results: [VectorStoreItem, number][] = await vectorStore.similaritySearchWithScore(query, k) as [VectorStoreItem, number][];

  if (!results) {
    return [];
  }

  const sortedResults: VectorStoreItem[] = results
    .sort((a, b) => b[1] - a[1])
    .map(([item]) => item);

  return sortedResults.map((item) => item.metadata.task);
}

// This function pretends to execute a task and returns the result.
// The task is executed in the context of the top k most similar tasks.
// The result is a string.
async function executeTask(
  vectorStore: VectorStore,
  executionChain: LLMChain,
  objective: string,
  task: string,
  k = 5,
  executionAgent?: CustomAgent,
): Promise<string> {
  // Execute a task.
  const context: string[] = await getTopTasks(vectorStore, objective, k);
  if (executionAgent) {
    return await executionAgent.execute(task, objective, context)
  }
  const result = await executionChain.call({
    objective: objective,
    context: context,
    task: task,
  });
  return result.text
}

export { getTopTasks, executeTask };