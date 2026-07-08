import { TaskItemOptions, TaskListOptions as TiptapTaskListOptions } from '@tiptap/extension-list';
import { GeneralOptions } from '../../types';
export * from './components/RichTextTaskList';
/**
 * Represents the interface for task list options, extending TiptapTaskListOptions and GeneralOptions.
 */
export interface TaskListOptions extends TiptapTaskListOptions, GeneralOptions<TaskListOptions> {
    /** options for task items */
    taskItem: Partial<TaskItemOptions>;
}
export declare const TaskList: import('@tiptap/core').Node<TaskListOptions, any>;
