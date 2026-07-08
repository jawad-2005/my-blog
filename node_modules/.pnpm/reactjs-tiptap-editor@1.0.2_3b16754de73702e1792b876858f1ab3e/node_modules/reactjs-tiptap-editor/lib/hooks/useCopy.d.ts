declare function useCopy(): {
    isCopied: boolean;
    copyToClipboard: (text: string) => Promise<void>;
};
export default useCopy;
