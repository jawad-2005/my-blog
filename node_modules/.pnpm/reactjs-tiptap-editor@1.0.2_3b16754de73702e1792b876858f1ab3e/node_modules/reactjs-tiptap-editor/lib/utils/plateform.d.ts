/**
 * Return true if the user is using a Mac (as opposed to Windows, etc.) device.
 */
export declare function isMac(): boolean;
/**
 * 根据 Mac 和非 Mac 平台，返回应该用于键盘快捷键的修饰键的可读版本。用于直观地指示应该按哪个键。
 */
export declare function getShortcutKey(key: string): string;
export declare function getShortcutKeys(keys: string[]): string;
/** Return true if the user is using a touch-based device. */
export declare function isTouchDevice(): boolean;
