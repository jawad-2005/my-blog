import { Editor } from '@tiptap/core';
export declare function useAttributes<T, R = T>(editor: Editor, attrbute: string, defaultValue?: T, map?: (arg: T) => R): R;
