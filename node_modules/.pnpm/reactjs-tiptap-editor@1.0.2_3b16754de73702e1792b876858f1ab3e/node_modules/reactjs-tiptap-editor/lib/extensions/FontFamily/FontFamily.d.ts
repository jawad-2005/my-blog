import { FontFamilyOptions as TiptapFontFamilyOptions } from '@tiptap/extension-text-style';
import { GeneralOptions, NameValueOption } from '../../types';
export * from './components/RichTextFontFamily';
export interface FontFamilyOptions extends TiptapFontFamilyOptions, GeneralOptions<FontFamilyOptions> {
    /**
     * Font family list.
     */
    fontFamilyList: (string | NameValueOption)[];
}
export declare const FontFamily: import('@tiptap/core').Extension<FontFamilyOptions, any>;
