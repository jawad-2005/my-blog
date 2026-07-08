import { Extension, Range } from '@tiptap/core';
export * from './components/RichTextSearchAndReplace';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        search: {
            setSearchTerm: (searchTerm: string) => ReturnType;
            setReplaceTerm: (replaceTerm: string) => ReturnType;
            setCaseSensitive: (caseSensitive: boolean) => ReturnType;
            resetIndex: () => ReturnType;
            nextSearchResult: () => ReturnType;
            previousSearchResult: () => ReturnType;
            replace: () => ReturnType;
            replaceAll: () => ReturnType;
        };
    }
}
export interface SearchAndReplaceOptions {
    searchResultClass: string;
    disableRegex: boolean;
}
export interface SearchAndReplaceStorage {
    searchTerm: string;
    replaceTerm: string;
    results: Range[];
    lastSearchTerm: string;
    caseSensitive: boolean;
    lastCaseSensitive: boolean;
    resultIndex: number;
    lastResultIndex: number;
}
declare module '@tiptap/core' {
    interface Storage {
        searchAndReplace: SearchAndReplaceStorage;
    }
}
export declare const SearchAndReplace: Extension<SearchAndReplaceOptions, SearchAndReplaceStorage>;
