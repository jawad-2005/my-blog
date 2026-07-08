import { Node } from '@tiptap/core';
export * from './components/RichTextExcalidraw';
export interface IExcalidrawAttrs {
    defaultShowPicker?: boolean;
    createUser?: any;
    width?: number | string;
    height?: number;
    data?: Record<string, unknown>;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        excalidraw: {
            setExcalidraw: (attrs?: IExcalidrawAttrs) => ReturnType;
        };
    }
}
export declare const Excalidraw: Node<any, any>;
