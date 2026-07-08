import { CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight';
import { GeneralOptions } from '../../types';
export * from './components/RichTextCodeBlock';
export interface CodeBlockOptions extends CodeBlockLowlightOptions, GeneralOptions<CodeBlockOptions> {
}
export declare const CodeBlock: import('@tiptap/core').Node<CodeBlockOptions, any>;
