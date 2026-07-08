import { TableCellOptions, TableRowOptions, TableHeaderOptions } from '@tiptap/extension-table';
import { TableCellBackgroundOptions } from './TableCellBackground';
import { GeneralOptions } from '../../types';
export interface TableOptions extends GeneralOptions<TableOptions> {
    HTMLAttributes: Record<string, any>;
    resizable: boolean;
    handleWidth: number;
    cellMinWidth: number;
    lastColumnResizable: boolean;
    allowTableNodeSelection: boolean;
    /** options for table rows */
    tableRow: Partial<TableRowOptions>;
    /** options for table headers */
    tableHeader: Partial<TableHeaderOptions>;
    /** options for table cells */
    tableCell: Partial<TableCellOptions>;
    /** options for table cell background */
    tableCellBackground: Partial<TableCellBackgroundOptions>;
}
export * from './components/RichTextTable';
export declare const Table: import('@tiptap/core').Node<TableOptions, any>;
