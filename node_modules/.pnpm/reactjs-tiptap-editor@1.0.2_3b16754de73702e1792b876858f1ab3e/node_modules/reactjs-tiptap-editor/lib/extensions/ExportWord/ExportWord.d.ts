import { Extension } from '@tiptap/core';
import { GeneralOptions } from '../../types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        exportWord: {
            exportToWord: (docState: any) => ReturnType;
        };
    }
}
interface ExportWordOptions extends GeneralOptions<ExportWordOptions> {
}
export * from './components/RichTextExportWord';
export declare const ExportWord: Extension<ExportWordOptions, any>;
