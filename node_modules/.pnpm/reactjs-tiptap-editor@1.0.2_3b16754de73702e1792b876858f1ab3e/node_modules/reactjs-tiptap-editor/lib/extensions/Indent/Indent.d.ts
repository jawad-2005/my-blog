import { Extension } from '@tiptap/core';
import { GeneralOptions } from '../../types';
export * from './components/RichTextIndent';
export interface IndentOptions extends GeneralOptions<IndentOptions> {
    types: string[];
    minIndent: number;
    maxIndent: number;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            /**
             * Set the indent attribute
             */
            indent: () => ReturnType;
            /**
             * Set the outdent attribute
             */
            outdent: () => ReturnType;
        };
    }
}
export declare const Indent: Extension<IndentOptions, any>;
