import { Node } from '@tiptap/core';
export * from './components/RichTextIframe';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        iframe: {
            /**
             * Add an iframe
             */
            setIframe: (options: {
                src: string;
                service: string;
            }) => ReturnType;
        };
    }
}
export declare const Iframe: Node<any, any>;
