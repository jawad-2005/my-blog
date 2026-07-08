import { GeneralOptions } from '../../types';
import { UnderlineOptions as TiptapUnderlineOptions } from '@tiptap/extension-underline';
export * from './components/RichTextUnderline';
export interface UnderlineOptions extends TiptapUnderlineOptions, GeneralOptions<UnderlineOptions> {
}
export declare const TextUnderline: import('@tiptap/core').Mark<UnderlineOptions, any>;
