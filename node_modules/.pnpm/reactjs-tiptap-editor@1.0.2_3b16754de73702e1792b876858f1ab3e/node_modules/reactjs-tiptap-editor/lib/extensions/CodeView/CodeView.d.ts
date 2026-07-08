import { Extension } from '@tiptap/core';
import { GeneralOptions } from '../../types';
interface CodeViewOptions extends GeneralOptions<CodeViewOptions> {
    isCodeViewMode?: boolean;
}
export * from './components/RichTextCodeView';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        codeView: {
            /**
             * Toggle code view mode
             */
            toggleCodeView: () => ReturnType;
        };
    }
}
export declare const CodeView: Extension<CodeViewOptions, any>;
