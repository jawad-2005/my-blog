export declare function useActive(isActive?: () => boolean): {
    disabled: boolean;
    dataState: any;
    editorDisabled: boolean;
};
/**
 * export type Mark =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "underline"
  | "superscript"
  | "subscript"
 */
export declare function useToggleActive(isActive?: () => boolean): {
    disabled: boolean;
    dataState: boolean;
    editorDisabled: boolean;
    update: () => void;
};
