import { ColorOptions as TiptapColorOptions } from '@tiptap/extension-text-style';
import { GeneralOptions } from '../../types';
export * from './components/RichTextColor';
export interface ColorOptions extends TiptapColorOptions, GeneralOptions<ColorOptions> {
    /**
     * An array of color options to display in the color picker
     */
    colors?: string[];
    /**
     * The default color to use when no color is selected
     */
    defaultColor?: string;
}
export interface ColorStorage {
    currentColor?: string;
}
declare module '@tiptap/core' {
    interface Storage {
        color: ColorStorage;
    }
}
export declare const Color: import('@tiptap/core').Extension<ColorOptions, any>;
