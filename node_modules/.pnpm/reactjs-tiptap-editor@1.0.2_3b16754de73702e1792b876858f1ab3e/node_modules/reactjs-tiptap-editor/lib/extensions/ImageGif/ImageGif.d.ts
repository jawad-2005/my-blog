import { ImageOptions } from '@tiptap/extension-image';
export * from './components/RichTextImageGif';
export interface SetImageAttrsOptions {
    src?: string;
    /** The alternative text for the image. */
    alt?: string;
    /** The title of the image. */
    title?: string;
    /** The width of the image. */
    width?: number | string | null;
    /** The alignment of the image. */
    align?: 'left' | 'center' | 'right';
}
interface ImageGifOptions extends ImageOptions {
    provider: 'giphy' | 'tenor';
    /**
     * The key for the gif https://giphy.com/ or https://tenor.com/
     */
    API_KEY: string;
}
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageGifUpload: {
            /**
             * Add an image gif
             */
            setImageGif: (options: Partial<SetImageAttrsOptions>) => ReturnType;
            /**
             * Update an image gif
             */
            updateImageGif: (options: Partial<SetImageAttrsOptions>) => ReturnType;
            /**
             * Set image alignment
             */
            setAlignImageGif: (align: 'left' | 'center' | 'right') => ReturnType;
        };
    }
}
export declare const ImageGif: import('@tiptap/core').Node<ImageGifOptions, any>;
