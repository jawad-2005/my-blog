import { GeneralOptions } from '../../types';
export * from './components/RichTextDrawer';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        drawer: {
            setDrawer: (options: any, replace?: any) => ReturnType;
            setAlignImageDrawer: (align: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}
export interface DrawerOptions extends GeneralOptions<DrawerOptions> {
    /** Function for uploading files */
    upload?: (file: File) => Promise<string>;
}
export declare const Drawer: import('@tiptap/core').Node<DrawerOptions, any>;
