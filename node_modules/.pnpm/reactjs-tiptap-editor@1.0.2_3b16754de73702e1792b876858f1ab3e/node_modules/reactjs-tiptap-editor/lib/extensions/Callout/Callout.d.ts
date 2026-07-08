import { Node } from '@tiptap/core';
import { GeneralOptions } from '../../types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        callout: {
            setCallout: (attrs?: {
                type?: string;
                title?: string;
                body?: string;
            }) => ReturnType;
        };
    }
}
export interface CalloutOptions extends GeneralOptions<CalloutOptions> {
    HTMLAttributes: Record<string, any>;
}
export * from './components/RichTextCallout';
export declare const Callout: Node<CalloutOptions, any>;
