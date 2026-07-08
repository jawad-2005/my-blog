import { Node, Extension } from '@tiptap/core';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        columns: {
            insertColumns: (attrs?: {
                cols: number;
            }) => ReturnType;
            addColBefore: () => ReturnType;
            addColAfter: () => ReturnType;
            deleteCol: () => ReturnType;
        };
    }
}
export * from './components/RichTextColumn';
export declare const Column: Extension<any, any>;
export declare const ColumnNode: Node<any, any>;
export declare const MultipleColumnNode: Node<any, any>;
