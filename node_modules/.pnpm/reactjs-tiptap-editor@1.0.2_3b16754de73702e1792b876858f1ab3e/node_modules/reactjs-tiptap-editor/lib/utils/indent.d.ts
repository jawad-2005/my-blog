import { Command } from '@tiptap/core';
import { Transaction } from '@tiptap/pm/state';
export declare const enum IndentProps {
    max = 7,
    min = 0,
    more = 1,
    less = -1
}
export declare function clamp(val: number, min: number, max: number): number;
export declare function setNodeIndentMarkup(tr: Transaction, pos: number, delta: number): Transaction;
export declare function createIndentCommand({ delta, types }: {
    delta: number;
    types: string[];
}): Command;
