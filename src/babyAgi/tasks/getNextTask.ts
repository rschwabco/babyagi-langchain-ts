import { LLMChain } from "langchain";
import { Task } from "../../../types/task";
import { ChainValues } from "langchain/dist/schema";


// This function gets the next tasks given a set of incomplete tasks.
// The tasks are returned as an array of objects.
// Each object contains the task name as a property.
async function getNextTasks(
  taskCreationChain: LLMChain,
  result: string,
  taskDescription: string,
  taskList: string[],
  objective: string
): Promise<Task[]> {
  // Get the next task.
  const incompleteTasks: string = taskList.join(', ');
  const response: ChainValues = await taskCreationChain.call({
    result: result,
    task_description: taskDescription,
    incomplete_tasks: incompleteTasks,
    objective: objective,
  });

  const newTasks: string[] = response.text.split('\n');
  return newTasks
    .filter((taskName) => taskName.trim())
    .map((taskName) => ({ taskName }));
}

export { getNextTasks };