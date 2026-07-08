import { GeneralOptions } from '../../types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        mermaid: {
            setMermaid: (options: any, replace?: any) => ReturnType;
            setAlignImageMermaid: (align: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}
export * from './components/RichTextMermaid';
export interface MermaidOptions extends GeneralOptions<MermaidOptions> {
    /** Function for uploading files */
    upload?: (file: File) => Promise<string>;
}
export declare const Mermaid: import('@tiptap/core').Node<MermaidOptions, any>;
