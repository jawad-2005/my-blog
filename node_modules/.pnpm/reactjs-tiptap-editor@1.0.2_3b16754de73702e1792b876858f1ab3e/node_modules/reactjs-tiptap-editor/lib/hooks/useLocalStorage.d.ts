import { Dispatch, SetStateAction } from 'react';
declare global {
    interface WindowEventMap {
        'local-storage': CustomEvent;
    }
}
type UseLocalStorageOptions<T> = {
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
    initializeWithValue?: boolean;
};
export declare function useLocalStorage<T>(key: string, initialValue: T | (() => T), options?: UseLocalStorageOptions<T>): [T, Dispatch<SetStateAction<T>>, () => void];
export {};
