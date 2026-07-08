import { Node } from '@tiptap/core';
export * from './components/RichTextKatex';
export interface IKatexAttrs {
    text?: string;
    macros?: string;
}
interface IKatexOptions {
    HTMLAttributes: Record<string, any>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        katex: {
            setKatex: (arg?: IKatexAttrs) => ReturnType;
        };
    }
}
export declare const Katex: Node<IKatexOptions, any>;
