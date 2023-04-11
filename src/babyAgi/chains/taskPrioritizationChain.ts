import { LLMChain, PromptTemplate } from "langchain";
import { BaseLLM } from "langchain/llms/base";

class TaskPrioritizationChain extends LLMChain {
  // Chain to prioritize tasks.

  static fromLLM(llm: BaseLLM, verbose = true): LLMChain {
    // Get the response parser.
    const taskPrioritizationTemplate: string =
      'You are an task prioritization AI tasked with cleaning the formatting of and reprioritizing' +
      ' the following tasks: {task_names}.' +
      ' Consider the ultimate objective of your team: {objective}.' +
      ' Do not remove any tasks. Return the result as a numbered list, like:' +
      ' #. First task' +
      ' #. Second task' +
      ' Start the task list with number {next_task_id}.';

    const prompt: PromptTemplate = new PromptTemplate({
      template: taskPrioritizationTemplate,
      inputVariables: ['task_names', 'next_task_id', 'objective'],
    });

    return new TaskPrioritizationChain({
      prompt: prompt,
      llm: llm,
      verbose: verbose,
    });
  }
}

export { TaskPrioritizationChain };