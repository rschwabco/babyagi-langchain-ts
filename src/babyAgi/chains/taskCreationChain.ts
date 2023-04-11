import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "langchain";
import { BaseLLM } from "langchain/llms/base";

class TaskCreationChain extends LLMChain {
  // Chain to generates tasks.

  static fromLLM(llm: BaseLLM, verbose = true): LLMChain {
    // Get the response parser.
    const taskCreationTemplate: string =
      'You are an task creation AI that uses the result of an execution agent' +
      ' to create new tasks with the following objective: {objective},' +
      ' The last completed task has the result: {result}.' +
      ' This result was based on this task description: {task_description}.' +
      ' These are incomplete tasks: {incomplete_tasks}.' +
      ' Based on the result, create new tasks to be completed' +
      ' by the AI system that do not overlap with incomplete tasks.' +
      ' Return the tasks as an array.';

    const prompt: PromptTemplate = new PromptTemplate({
      template: taskCreationTemplate,
      inputVariables: ['result', 'task_description', 'incomplete_tasks', 'objective'],
    });

    return new TaskCreationChain({
      prompt: prompt,
      llm: llm,
      verbose: verbose,
    });
  }
}

export { TaskCreationChain };