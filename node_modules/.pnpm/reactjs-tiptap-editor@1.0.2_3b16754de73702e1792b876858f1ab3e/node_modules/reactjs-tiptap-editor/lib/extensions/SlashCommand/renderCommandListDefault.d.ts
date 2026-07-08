import { CommandList } from './types';
export declare function renderCommandListDefault({ t }: any): CommandList[];
export declare function useFilterCommandList(commandList: CommandList[], query: string): {
    commands: import('./types').Command[];
    name: string;
    title: string;
}[];
