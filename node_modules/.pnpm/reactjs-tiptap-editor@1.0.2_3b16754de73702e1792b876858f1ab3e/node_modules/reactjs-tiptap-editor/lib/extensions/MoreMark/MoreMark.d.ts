import { Extension } from '@tiptap/core';
import { GeneralOptions } from '../../types';
import { SubscriptExtensionOptions as TiptapSubscriptOptions } from '@tiptap/extension-subscript';
import { SuperscriptExtensionOptions as TiptapSuperscriptOptions } from '@tiptap/extension-superscript';
export * from './components/RichTextMoreMark';
export interface MoreMarkOptions extends GeneralOptions<MoreMarkOptions> {
    /**
     * // options for Subscript Extension
     *
     * @default true
     */
    subscript: Partial<TiptapSubscriptOptions> | false;
    /**
     * // options for Superscript Extension
     *
     * @default true
     */
    superscript: Partial<TiptapSuperscriptOptions> | false;
}
export declare const MoreMark: Extension<MoreMarkOptions, any>;
