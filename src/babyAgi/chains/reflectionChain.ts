import { LLMChain, PromptTemplate } from "langchain";
import { BaseLLM } from "langchain/llms/base";

class ReflectionChain extends LLMChain {
  // Chain to execute tasks.

  static fromLLM(llm: BaseLLM, verbose = true): LLMChain {
    // Get the response parser.
    const executionTemplate: string =
      'Given the following objective: {objective}.' +
      ' Take into account these previously completed tasks: {context}.' +
      ' Take into account the information collected: {collected_data}.' +
      ' Assess whether or not the objective has been accomplished'
    ' Response:';

    const prompt: PromptTemplate = new PromptTemplate({
      template: executionTemplate,
      inputVariables: ['objective', 'context', 'collected_data', 'task'],
    });

    return new ReflectionChain({
      prompt: prompt,
      llm: llm,
      verbose: verbose,
    });
  }
}

export { ReflectionChain };