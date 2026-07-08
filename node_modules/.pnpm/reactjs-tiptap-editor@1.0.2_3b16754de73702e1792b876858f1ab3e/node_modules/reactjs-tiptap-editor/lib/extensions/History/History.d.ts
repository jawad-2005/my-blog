import { UndoRedoOptions } from '@tiptap/extensions';
import { GeneralOptions } from '../../types';
export interface HistoryOptions extends UndoRedoOptions, GeneralOptions<HistoryOptions> {
}
export declare const History: import('@tiptap/core').Extension<HistoryOptions, any>;
export * from './components/RichTextHistory';
