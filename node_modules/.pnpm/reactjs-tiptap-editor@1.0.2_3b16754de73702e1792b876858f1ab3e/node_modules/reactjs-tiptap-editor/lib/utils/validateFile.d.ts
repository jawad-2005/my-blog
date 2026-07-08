import { ToastProps } from '../components/ui/toast';
interface ValidateFileOptions {
    acceptMimes: string[];
    maxSize: number;
    t: any;
    toast: (props: ToastProps) => void;
    onError?: (error: {
        type: 'size' | 'type' | 'upload';
        message: string;
        file?: File;
    }) => void;
}
export declare function validateFiles(files: File[] | {
    [key: string]: File;
}, options: ValidateFileOptions): File[];
export {};
