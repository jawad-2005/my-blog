import { Extension } from '@tiptap/core';
export interface TableCellBackgroundOptions {
    HTMLAttributes: Record<string, any>;
    types?: any;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        tableCellBackground: {
            setTableCellBackground: (color: string) => ReturnType;
            unsetTableCellBackground: () => ReturnType;
        };
    }
}
export declare const TableCellBackground: Extension<TableCellBackgroundOptions, any>;
