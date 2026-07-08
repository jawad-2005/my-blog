import { GeneralOptions } from '../../types';
import { HorizontalRuleOptions as TiptapHorizontalRuleOptions } from '@tiptap/extension-horizontal-rule';
export * from './components/RichTextHorizontalRule';
export interface HorizontalRuleOptions extends TiptapHorizontalRuleOptions, GeneralOptions<HorizontalRuleOptions> {
}
export declare const HorizontalRule: import('@tiptap/core').Node<HorizontalRuleOptions, any>;
