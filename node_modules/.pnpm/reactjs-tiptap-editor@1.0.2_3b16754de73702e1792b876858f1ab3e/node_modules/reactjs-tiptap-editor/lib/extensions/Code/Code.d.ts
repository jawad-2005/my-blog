import { GeneralOptions } from '../../types';
import { CodeOptions as TiptapCodeOptions } from '@tiptap/extension-code';
export * from './components/RichTextCode';
export interface CodeOptions extends TiptapCodeOptions, GeneralOptions<CodeOptions> {
}
export declare const Code: import('@tiptap/core').Mark<CodeOptions, any>;
