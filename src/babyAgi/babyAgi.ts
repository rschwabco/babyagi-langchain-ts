import { BaseLLM } from 'langchain/llms/base';
import { TaskCreationChain } from './chains/taskCreationChain';
import { TaskPrioritizationChain } from './chains/taskPrioritizationChain';
import { ExecutionChain } from './chains/executionChain';
import { VectorStore } from 'langchain/vectorstores';
import { prioritizeTasks } from './tasks/priotizeTask';
import { getNextTasks } from './tasks/getNextTask';
import { executeTask } from './tasks/getTopTasks';
import { Task } from '../../types/task';
import { Document } from "langchain/document";
import chalk from 'chalk';

class BabyAGI {
  private taskList: Task[];
  private taskCreationChain: TaskCreationChain;
  private taskPrioritizationChain: TaskPrioritizationChain;
  private executionChain: ExecutionChain;
  private taskIdCounter: number;
  private vectorStore: VectorStore;
  private maxIterations: number | null;

  constructor(
    llm: BaseLLM,
    verbose = true,
    vectorStore: VectorStore,
    maxIterations: number | null = null
  ) {
    this.taskList = [];
    this.taskCreationChain = TaskCreationChain.fromLLM(llm, verbose)
    this.taskPrioritizationChain = TaskPrioritizationChain.fromLLM(llm, verbose)
    this.executionChain = ExecutionChain.fromLLM(llm, verbose)
    this.taskIdCounter = 1;
    this.vectorStore = vectorStore;
    this.maxIterations = maxIterations;
  }

  addTask(task: Task): void {
    this.taskList.push(task);
  }

  printTaskList(): void {
    console.log(chalk.blue("\n*****TASK LIST*****\n"))
    for (const t of this.taskList) {
      console.log(`${t.taskId}: ${t.taskName}`);
    }
  }

  printNextTask(task: Task): void {
    console.log(chalk.cyan("\n*****NEXT TASK*****\n"))
    console.log(`${task.taskId}: ${task.taskName}`);
  }

  printTaskResult(result: string): void {
    console.log(chalk.green("\n*****TASK RESULT*****\n"))
    console.log(result);
  }

  get inputKeys(): string[] {
    return ['objective'];
  }

  get outputKeys(): string[] {
    return [];
  }

  async execute(inputs: { [key: string]: any }): Promise<{ [key: string]: any }> {
    const objective = inputs['objective'];
    const firstTask = inputs['first_task'] || 'Make a todo list';
    this.addTask({ taskId: 1, taskName: firstTask });
    let numIters = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {

      if (!(this.taskList.length === 0)) {
        this.printTaskList();

        // Step 1: Pull the first task
        const task = this.taskList.shift()!;
        this.printNextTask(task);

        // Step 2: Execute the task
        const result = await executeTask(
          this.vectorStore,
          this.executionChain,
          objective,
          task.taskName
        );

        const this_task_id = task.taskId;
        this.printTaskResult(result);

        // Step 3: Store the result in the VectorStore
        const result_id = `result_${task.taskId}`;

        const document: Document = {
          pageContent: result,
          metadata: { task: task.taskName, resultId: result_id },
        }

        await this.vectorStore.addDocuments([document])

        // Step 4: Create new tasks and reprioritize task list
        const new_tasks = await getNextTasks(
          this.taskCreationChain,
          result,
          task.taskName,
          this.taskList.map(t => t.taskName),
          objective
        );

        for (const new_task of new_tasks) {
          this.taskIdCounter += 1;
          new_task.taskId = this.taskIdCounter;
          this.addTask(new_task);
        }

        this.taskList = await prioritizeTasks(
          this.taskPrioritizationChain,
          this_task_id!,
          this.taskList,
          objective
        )
      }

      numIters += 1;
      if (this.maxIterations !== null && numIters === this.maxIterations) {
        console.log(chalk.red("\n*****TASK ENDING*****\n"))
        break;
      }
    }
    return {};
  }
}

export { BabyAGI };
