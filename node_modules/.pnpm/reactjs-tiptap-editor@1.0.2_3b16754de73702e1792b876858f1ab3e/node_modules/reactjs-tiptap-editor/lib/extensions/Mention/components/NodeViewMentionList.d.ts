import { default as React } from 'react';
import { Editor } from '@tiptap/core';
interface IProps {
    editor: Editor;
    items: Array<{
        id: string;
        label: string;
        avatar?: {
            src: string;
        };
    }>;
    command: any;
    onClose?: () => void;
}
export declare const NodeViewMentionList: React.FC<IProps>;
export {};
