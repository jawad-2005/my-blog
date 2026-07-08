import { GeneralOptions } from '../../types';
import { ItalicOptions as TiptapItalicOptions } from '@tiptap/extension-italic';
export * from './components/RichTextItalic';
export interface ItalicOptions extends TiptapItalicOptions, GeneralOptions<ItalicOptions> {
}
export declare const Italic: import('@tiptap/core').Mark<ItalicOptions, any>;
