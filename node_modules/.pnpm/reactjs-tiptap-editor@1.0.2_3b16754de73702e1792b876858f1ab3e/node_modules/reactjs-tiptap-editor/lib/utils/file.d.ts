/**
 * 获取文件名
 *
 * @example
 *   > extractFilename('https://gitlab.com/images/logo-full.png')
 *   < 'logo-full'
 *
 * @param {string} src The URL to extract filename from
 * @returns {string}
 */
export declare function extractFilename(src: any): any;
/**
 * extractFileExtension
 * @param {string} fileName The file name to extract extension from
 * @returns  {string}
 */
export declare function extractFileExtension(fileName: any): any;
export declare function normalizeFileSize(size: any): string;
export type FileType = 'image' | 'audio' | 'video' | 'pdf' | 'word' | 'excel' | 'ppt' | 'file';
export declare function normalizeFileType(fileType: any): FileType;
export declare function readImageAsBase64(file: File): Promise<{
    alt: string;
    src: string;
}>;
export declare function getImageWidthHeight(url: string): Promise<{
    width: number | string;
    height: number | string;
}>;
export declare const FILE_CHUNK_SIZE: number;
export declare function dataURLtoFile(dataurl: string, filename: string): File;
