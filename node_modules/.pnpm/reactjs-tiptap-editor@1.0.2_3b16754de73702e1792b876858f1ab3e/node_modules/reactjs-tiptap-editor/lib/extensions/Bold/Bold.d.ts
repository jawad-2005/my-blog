import { GeneralOptions } from '../../types';
import { BoldOptions as TiptapImageOptions } from '@tiptap/extension-bold';
export * from './components/RichTextBold';
export interface BoldOptions extends TiptapImageOptions, GeneralOptions<BoldOptions> {
}
export declare const Bold: import('@tiptap/core').Mark<BoldOptions, any>;
