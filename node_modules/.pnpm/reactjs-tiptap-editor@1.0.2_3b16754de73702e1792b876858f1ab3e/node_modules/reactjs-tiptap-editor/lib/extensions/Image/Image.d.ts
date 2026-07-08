import { GeneralOptions } from '../../types';
export * from './components/RichTextImage';
export interface SetImageAttrsOptions {
    src?: string;
    /** The alternative text for the image. */
    alt?: string;
    /** The caption of the image. */
    caption?: string;
    /** The width of the image. */
    width?: number | string | null;
    /** The alignment of the image. */
    align?: 'left' | 'center' | 'right';
    /** Whether the image is inline. */
    inline?: boolean;
    /** image FlipX */
    flipX?: boolean;
    /** image FlipY */
    flipY?: boolean;
}
export declare const DEFAULT_OPTIONS: any;
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageUpload: {
            /**
             * Add an image
             */
            setImageInline: (options: Partial<SetImageAttrsOptions>) => ReturnType;
            /**
             * Update an image
             */
            updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType;
            /**
             * Set image alignment
             */
            setAlignImage: (align: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}
export interface IImageOptions extends GeneralOptions<IImageOptions> {
    /** Function for uploading files */
    upload?: (file: File) => Promise<string>;
    HTMLAttributes?: any;
    multiple?: boolean;
    acceptMimes?: string[];
    maxSize?: number;
    /** The source URL of the image */
    resourceImage: 'upload' | 'link' | 'both';
    defaultInline?: boolean;
    enableAlt?: boolean;
    /** Function to handle errors during file validation */
    onError?: (error: {
        type: 'size' | 'type' | 'upload';
        message: string;
        file?: File;
    }) => void;
}
export declare const Image: import('@tiptap/core').Node<IImageOptions, any>;
