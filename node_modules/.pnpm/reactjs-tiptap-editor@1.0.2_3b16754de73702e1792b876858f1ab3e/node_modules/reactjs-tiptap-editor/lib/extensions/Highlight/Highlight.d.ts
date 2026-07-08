import { GeneralOptions } from '../../types';
import { HighlightOptions as TiptapHighlightOptions } from '@tiptap/extension-highlight';
export * from './components/RichTextHighlight';
export interface HighlightOptions extends TiptapHighlightOptions, GeneralOptions<HighlightOptions> {
    /**
     * The default color to use initially
     */
    defaultColor?: string;
}
export interface HighlightStorage {
    currentColor?: string;
}
declare module '@tiptap/core' {
    interface Storage {
        highlight: HighlightStorage;
    }
}
export declare const Highlight: import('@tiptap/core').Mark<HighlightOptions, any>;
