declare class Node {
    key: string;
    value: string | number;
    prev: Node | null;
    next: Node | null;
    constructor(key: any, value: any);
}
export declare class LRUCache {
    private capacity;
    private usedCapacity;
    private head;
    private tail;
    private store;
    constructor(capacity: any);
    private removeNode;
    private addToHead;
    private moveToHead;
    private removeTail;
    get(key: any): string | number;
    put(key: any, value: any): void;
    keys(): any[];
    values(): any[];
    toJSON(): Record<string, Node>;
}
export declare function createKeysLocalStorageLRUCache(storageKey: any, capacity: any): {
    syncFromStorage(): void;
    syncToStorage(): void;
    put(key: any): void;
    get(key?: string): string | number | any[];
};
export {};
