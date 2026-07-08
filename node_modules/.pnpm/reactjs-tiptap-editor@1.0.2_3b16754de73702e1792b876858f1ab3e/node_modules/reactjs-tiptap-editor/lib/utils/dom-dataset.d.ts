/**
 * @param json
 */
export declare function jsonToStr(json: Record<string, unknown>): string;
/**
 * @param str
 */
export declare function strToJSON(str: string): any;
/**
 * @param element
 * @param json
 */
export declare function jsonToDOMDataset(json: Record<string, unknown>): {
    key: string;
    value: string;
}[];
/**
 * @param element
 * @param attribute
 * @param transformToJSON
 */
export declare function getDatasetAttribute(attribute: string, transformToJSON?: boolean): (element: HTMLElement) => any;
/**
 * 将节点属性转换为 dataset
 * @param node
 * @returns
 */
export declare function nodeAttrsToDataset(node: Node): any;
