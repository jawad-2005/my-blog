import { Plugin } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
export declare function UploadImagesPlugin(): Plugin<any>;
export interface ImageUploadOptions {
    validateFn?: (file: File) => boolean;
    onUpload: (file: File) => Promise<string | object>;
    postUpload?: (src: string) => Promise<string>;
    defaultInline?: boolean;
}
export type UploadFn = (files: File[], view: EditorView, pos: number) => void;
export declare function createImageUpload({ validateFn, onUpload, postUpload, defaultInline, }: ImageUploadOptions): UploadFn;
export declare function handleImagePaste(view: EditorView, event: ClipboardEvent, uploadFn: UploadFn): boolean;
export declare function handleImageDrop(view: EditorView, event: DragEvent, moved: boolean, uploadFn: UploadFn): boolean;
