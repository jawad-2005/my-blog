import { default as React } from 'react';
interface IPropsEmojiNodeVIew {
    items: Array<{
        name: string;
        emoji: string;
    }>;
    query: string;
    command: any;
}
declare const _default: React.ForwardRefExoticComponent<IPropsEmojiNodeVIew & React.RefAttributes<unknown>>;
export default _default;
