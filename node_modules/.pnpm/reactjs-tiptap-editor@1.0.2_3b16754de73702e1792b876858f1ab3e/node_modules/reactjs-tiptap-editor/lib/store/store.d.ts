declare function useEditableEditor(): boolean;
declare function useStoreEditableEditor(): (val: boolean | ((oldVal: boolean) => boolean)) => void;
export { useStoreEditableEditor, useEditableEditor };
