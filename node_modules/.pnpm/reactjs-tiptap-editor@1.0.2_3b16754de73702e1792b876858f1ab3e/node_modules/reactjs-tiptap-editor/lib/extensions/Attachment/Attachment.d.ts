import { Node } from '@tiptap/core';
import { GeneralOptions } from '../../types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        attachment: {
            setAttachment: (attrs?: unknown) => ReturnType;
        };
    }
}
export interface AttachmentOptions extends GeneralOptions<AttachmentOptions> {
    /** Function for uploading files */
    upload?: (file: File) => Promise<string>;
}
export * from './components/RichTextAttachment';
export declare const Attachment: Node<AttachmentOptions, any>;
