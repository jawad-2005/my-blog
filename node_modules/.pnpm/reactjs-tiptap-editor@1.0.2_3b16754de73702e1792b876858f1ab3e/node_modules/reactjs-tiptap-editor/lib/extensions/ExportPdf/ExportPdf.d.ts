import { Extension } from '@tiptap/core';
import { GeneralOptions, PaperSize, PageMargin } from '../../types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        exportPdf: {
            exportToPdf: () => ReturnType;
        };
    }
}
export interface ExportPdfOptions extends GeneralOptions<ExportPdfOptions> {
    paperSize: PaperSize;
    title?: string;
    margins: {
        top?: PageMargin;
        right?: PageMargin;
        bottom?: PageMargin;
        left?: PageMargin;
    };
}
export * from './components/RichTextExportPdf';
export declare const ExportPdf: Extension<ExportPdfOptions, any>;
