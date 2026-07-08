import { BulletListOptions as TiptapBulletListOptions } from '@tiptap/extension-list';
import { GeneralOptions } from '../../types';
export * from './components/RichTextBulletList';
export interface BulletListOptions extends TiptapBulletListOptions, GeneralOptions<BulletListOptions> {
}
export declare const BulletList: import('@tiptap/core').Node<BulletListOptions, any>;
