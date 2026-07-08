import { GeneralOptions } from '../../types';
import { HeadingOptions as TiptapHeadingOptions } from '@tiptap/extension-heading';
export * from './components/RichTextHeading';
export interface HeadingOptions extends TiptapHeadingOptions, GeneralOptions<HeadingOptions> {
}
export declare const Heading: import('@tiptap/core').Node<HeadingOptions, any>;
