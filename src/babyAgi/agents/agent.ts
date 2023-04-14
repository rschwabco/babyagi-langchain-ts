import {
  AgentExecutor,
  initializeAgentExecutor,
} from "langchain/agents";
import { BaseLLM } from "langchain/llms/base";
import { Tool } from "langchain/tools";
import chalk from "chalk";
import { ChainValues } from "langchain/dist/schema";

class BabyAgent {
  tools: Tool[];
  toolsNames: string[];
  executor: AgentExecutor;
  constructor(tools: Tool[], executor: AgentExecutor) {
    this.tools = tools || [];
    this.toolsNames = this.tools.map((t) => t.name);
    this.executor = executor
  }

  static async fromLLM(llm: BaseLLM, verbose = true, tools: Tool[]): Promise<BabyAgent> {

    const executor = await initializeAgentExecutor(
      tools,
      llm,
      "zero-shot-react-description",
      true
    );

    return new BabyAgent(tools, executor)
  }

  async execute({ history, objective, task, }: { history: string[]; objective: string; task: string }) {
    const taskInstructions = `You are an AI who performs one task based on the following objective: ${objective}.
    Take into account these previously completed tasks: ${history.join(",")}.
    Your task: ${task}.
    Response:`

    const formatInstructions = (toolNames: string) => `Use the following format:

    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [${toolNames}]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question`;
    const SUFFIX = `Begin!

    Question: {input}
    Thought:{agent_scratchpad}`;

    const input = taskInstructions + formatInstructions(this.toolsNames.join(", ")) + SUFFIX;
    console.log(chalk.yellow(input))
    const result: ChainValues = await this.executor.call({ input });
    console.log(result)
    return result.output;

  }
}

export { BabyAgent };