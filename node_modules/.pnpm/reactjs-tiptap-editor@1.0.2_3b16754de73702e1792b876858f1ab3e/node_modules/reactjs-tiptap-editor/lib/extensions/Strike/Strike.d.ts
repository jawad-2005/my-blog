import { GeneralOptions } from '../../types';
import { StrikeOptions as TiptapStrikeOptions } from '@tiptap/extension-strike';
export * from './components/RichTextStrike';
export interface StrikeOptions extends TiptapStrikeOptions, GeneralOptions<StrikeOptions> {
}
export declare const Strike: import('@tiptap/core').Mark<StrikeOptions, any>;
