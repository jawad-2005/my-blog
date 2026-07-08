import { Node } from '@tiptap/core';
import { GeneralOptions } from '../../types';
export interface ClearOptions extends GeneralOptions<ClearOptions> {
}
export * from './components/RichTextClear';
export declare const Clear: Node<ClearOptions, any>;
