import { GeneralOptions } from '../../types';
import { LinkOptions as TiptapLinkOptions } from '@tiptap/extension-link';
export * from './components/RichTextLink';
export interface LinkOptions extends TiptapLinkOptions, GeneralOptions<LinkOptions> {
}
export declare const Link: import('@tiptap/core').Mark<LinkOptions, any>;
