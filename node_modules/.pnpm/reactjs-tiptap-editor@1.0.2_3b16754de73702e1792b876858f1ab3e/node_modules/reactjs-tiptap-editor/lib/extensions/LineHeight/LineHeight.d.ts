import { LineHeightOptions as TiptapLineHeightOptions } from '@tiptap/extension-text-style';
import { GeneralOptions } from '../../types';
export * from './components/RichTextLightHeight';
export interface LineHeightOptions extends GeneralOptions<TiptapLineHeightOptions> {
    lineHeights: string[];
}
export declare const LineHeight: import('@tiptap/core').Extension<LineHeightOptions, any>;
