import { GeneralOptions } from '../../types';
import { BlockquoteOptions as TiptapBlockquoteOptions } from '@tiptap/extension-blockquote';
export * from './components/RichTextBlockquote';
export interface BlockquoteOptions extends TiptapBlockquoteOptions, GeneralOptions<BlockquoteOptions> {
}
export declare const Blockquote: import('@tiptap/core').Node<BlockquoteOptions, any>;
