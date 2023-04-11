import { LLMChain, PromptTemplate } from "langchain";
import { BaseLLM } from "langchain/llms/base";

class ExecutionChain extends LLMChain {
  // Chain to execute tasks.

  static fromLLM(llm: BaseLLM, verbose = true): LLMChain {
    // Get the response parser.
    const executionTemplate: string =
      'You are an AI who performs one task based on the following objective: {objective}.' +
      ' Take into account these previously completed tasks: {context}.' +
      ' Your task: {task}.' +
      ' Response:';

    const prompt: PromptTemplate = new PromptTemplate({
      template: executionTemplate,
      inputVariables: ['objective', 'context', 'task'],
    });

    return new ExecutionChain({
      prompt: prompt,
      llm: llm,
      verbose: verbose,
    });
  }
}

export { ExecutionChain };