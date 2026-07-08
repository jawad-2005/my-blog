import { ButtonViewParams, ButtonViewReturn, ExtensionNameKeys } from '../../types';
import { Editor } from '@tiptap/react';
/** Represents the size types for bubble images or videos */
type BubbleImageOrVideoSizeType = 'size-small' | 'size-medium' | 'size-large';
/** Represents the various types for bubble images */
type BubbleImageType = `image-${BubbleImageOrVideoSizeType}` | `video-${BubbleImageOrVideoSizeType}` | 'image' | 'image-aspect-ratio' | 'remove';
/** Represents the types for bubble videos */
type BubbleVideoType = 'video' | 'remove';
/** Represents the overall types for bubbles */
type BubbleAllType = BubbleImageType | BubbleVideoType | ExtensionNameKeys | 'divider' | (string & {});
/** Represents the key types for node types */
export type NodeTypeKey = 'image' | 'text' | 'video';
/** Represents the menu of bubble types for each node type */
export type BubbleTypeMenu = Partial<Record<NodeTypeKey, BubbleMenuItem[]>>;
/** Represents the menu of overall bubble types for each node type */
export type NodeTypeMenu = Partial<Record<NodeTypeKey, BubbleAllType[]>>;
/**
 * Represents the structure of a bubble menu item.
 */
export interface BubbleMenuItem extends ButtonViewReturn {
    /** The type of the bubble item */
    type: BubbleAllType;
}
/**
 * Represents a function to generate a bubble menu
 */
/**
 * Generates a bubble menu based on the provided options.
 * @param {ButtonViewParams<T>} options - The options for generating the bubble menu.
 * @returns {BubbleTypeMenu} The generated bubble menu.
 */
type BubbleView<T = any> = (options: ButtonViewParams<T>) => BubbleTypeMenu;
/**
 * Represents the options for configuring bubbles.
 * @interface BubbleOptions
 * @template T
 */
export interface BubbleOptions<T> {
    /** The menu of bubble types for each node type. */
    list: NodeTypeMenu;
    /** The default list of bubble types. */
    defaultBubbleList: any;
    /** The function to generate a bubble menu. */
    button: BubbleView<T>;
}
export declare function getBubbleImage(editor: Editor, t: any): BubbleMenuItem[];
export declare function getBubbleImageGif(editor: Editor, t: any): BubbleMenuItem[];
export declare function getBubbleMermaid(editor: Editor, t: any): BubbleMenuItem[];
export declare function getBubbleDrawer(editor: Editor, t: any): BubbleMenuItem[];
export declare function getBubbleVideo(editor: Editor, t: any): BubbleMenuItem[];
/**
 * Bubble menu text list
 */
export declare function getBubbleText(editor: Editor, t: any): any[];
export {};
