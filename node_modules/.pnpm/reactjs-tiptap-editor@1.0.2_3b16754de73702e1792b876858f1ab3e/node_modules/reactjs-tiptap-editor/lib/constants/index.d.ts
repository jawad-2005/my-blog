/** Default lang */
export declare const DEFAULT_LANG_VALUE = "en";
/** Throttle time for editor input (milliseconds) */
export declare const EDITOR_UPDATE_THROTTLE_WAIT_TIME = 200;
/**
 * watch throttling time must be less than the update time
 * otherwise the cursor position will reach the end
 */
export declare const EDITOR_UPDATE_WATCH_THROTTLE_WAIT_TIME: number;
/** Minimum size for image adjustments */
export declare const IMAGE_MIN_SIZE = 20;
/** Maximum size for image adjustments */
export declare const IMAGE_MAX_SIZE = 100000;
/** Throttle time during adjustments for images (milliseconds) */
export declare const IMAGE_THROTTLE_WAIT_TIME = 16;
/** Default number of rows and columns for grids when creating a table */
export declare const TABLE_INIT_GRID_SIZE = 10;
/** Maximum number of rows and columns for grids when creating a table */
export declare const TABLE_MAX_GRID_SIZE = 10;
/** Minimum number of rows and columns for grids when creating a table */
export declare const TABLE_DEFAULT_SELECTED_GRID_SIZE = 2;
export declare const DEFAULT_COLOR = "#262626";
/** Default color list for text color and text highlight */
export declare const COLORS_LIST: readonly ["#000000", "#262626", "#595959", "#8C8C8C", "#BFBFBF", "#D9D9D9", "#E9E9E9", "#F5F5F5", "#FAFAFA", "#FFFFFF", "#F5222D", "#FA541C", "#FA8C16", "#FADB14", "#52C41A", "#13C2C2", "#1890FF", "#2F54EB", "#722ED1", "#EB2F96", "#FFE8E6", "#FFECE0", "#FFEFD1", "#FCFCCA", "#E4F7D2", "#D3F5F0", "#D4EEFC", "#DEE8FC", "#EFE1FA", "#FAE1EB", "#FFA39E", "#FFBB96", "#FFD591", "#FFFB8F", "#B7EB8F", "#87E8DE", "#91D5FF", "#ADC6FF", "#D3ADF7", "#FFADD2", "#FF4D4F", "#FF7A45", "#FFA940", "#FFEC3D", "#73D13D", "#36CFC9", "#40A9FF", "#597EF7", "#9254DE", "#F759AB", "#CF1322", "#D4380D", "#D46B08", "#D4B106", "#389E0D", "#08979C", "#096DD9", "#1D39C4", "#531DAB", "#C41D7F", "#820014", "#871400", "#873800", "#614700", "#135200", "#00474F", "#003A8C", "#061178", "#22075E", "#780650"];
/** Default font family list */
export declare const DEFAULT_FONT_FAMILY_LIST: string[];
/** Default font size list */
export declare const DEFAULT_FONT_SIZE_LIST: readonly ["Default", "10px", "11px", "12px", "14px", "16px", "18px", "20px", "22px", "24px", "26px", "28px", "36px", "48px", "72px"];
/** Options for setting image size in the bubble menu */
export declare enum IMAGE_SIZE {
    'size-small' = 200,
    'size-medium' = 500,
    'size-large' = "100%"
}
/** Options for setting video size in the bubble menu */
export declare enum VIDEO_SIZE {
    'size-small' = 480,
    'size-medium' = 640,
    'size-large' = "100%"
}
/** Line Height List */
export declare const DEFAULT_LINE_HEIGHT_LIST: string[];
/** display in menus */
export declare const NODE_TYPE_MENU: any;
/** display in bubble text menu */
export declare const BUBBLE_TEXT_LIST: string[];
export declare const HEADINGS: (string | number)[];
