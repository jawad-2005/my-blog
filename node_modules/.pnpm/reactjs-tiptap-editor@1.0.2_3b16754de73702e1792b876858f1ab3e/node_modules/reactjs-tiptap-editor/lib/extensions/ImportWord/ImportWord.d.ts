import { Extension } from '@tiptap/core';
import { GeneralOptions } from '../../types';
import { default as Mammoth } from 'mammoth';
export * from './components/RichTextImportWord';
interface ImportWordOptions extends GeneralOptions<ImportWordOptions> {
    /** Function for converting Word files to HTML */
    convert?: (file: File) => Promise<string>;
    /** Function for uploading images */
    upload?: (files: File[]) => Promise<unknown>;
    /**
     * File Size limit(10 MB)
     *
     * @default 1024 * 1024 * 10
     */
    limit?: number;
    mammothOptions?: Parameters<(typeof Mammoth)['convertToHtml']>[1];
}
export declare const ImportWord: Extension<ImportWordOptions, any>;
