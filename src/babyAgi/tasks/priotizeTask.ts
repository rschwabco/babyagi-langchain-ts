import { LLMChain } from "langchain";
import { Task } from "../../../types/task";
import { ChainValues } from "langchain/dist/schema";

async function prioritizeTasks(
  taskPrioritizationChain: LLMChain,
  thisTaskID: number,
  taskList: Record<string, unknown>[],
  objective: string
): Promise<Task[]> {
  // Prioritize tasks.
  const taskNames: string[] = taskList.map((t) => t['task_name'] as string);
  const nextTaskID: number = thisTaskID + 1;

  // This code parses the response from the ChainValues type returned by the
  // taskPrioritizationChain.call() method. The response is a string that
  // has the following format:
  //    "0. task 0 name
  //    1. task 1 name
  //    2. task 2 name
  //    3. task 3 name
  //    ...
  //    "
  // It parses the response into a list of Task objects, which are used by the
  // TaskList component.

  const response: ChainValues = await taskPrioritizationChain.call({
    task_names: taskNames,
    next_task_id: nextTaskID,
    objective: objective,
  });

  const newTasks: string[] = response.text.split('\n');
  const prioritizedTaskList: Task[] = [];
  for (const taskString of newTasks) {
    if (!taskString.trim()) {
      continue;
    }

    const taskParts: string[] = taskString.trim().replace(',', '').split('.');

    if (taskParts.length === 2) {
      const taskID: number = parseInt(taskParts[0].trim());
      const taskName: string = taskParts[1].trim();
      prioritizedTaskList.push({ taskId: taskID, taskName: taskName });
    }
  }

  return prioritizedTaskList;
}

export { prioritizeTasks };