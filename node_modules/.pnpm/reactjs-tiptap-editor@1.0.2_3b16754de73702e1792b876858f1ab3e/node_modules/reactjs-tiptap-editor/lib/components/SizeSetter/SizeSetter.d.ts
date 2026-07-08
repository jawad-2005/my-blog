interface ISize {
    width: number | string;
    height: number | string;
}
interface IProps {
    width: number | string;
    maxWidth?: number | string;
    height: number | string;
    onOk: (arg: ISize) => void;
    children: React.ReactNode;
}
export declare const SizeSetter: React.FC<IProps>;
export {};
