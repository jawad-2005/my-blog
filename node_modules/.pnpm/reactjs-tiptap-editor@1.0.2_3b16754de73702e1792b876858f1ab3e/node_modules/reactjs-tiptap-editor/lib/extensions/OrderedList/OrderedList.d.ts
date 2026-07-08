import { OrderedListOptions as TiptapOrderedListOptions } from '@tiptap/extension-list';
import { GeneralOptions } from '../../types';
export * from './components/RichTextOrderedList';
export interface OrderedListOptions extends TiptapOrderedListOptions, GeneralOptions<OrderedListOptions> {
}
export declare const OrderedList: import('@tiptap/core').Node<OrderedListOptions, any>;
