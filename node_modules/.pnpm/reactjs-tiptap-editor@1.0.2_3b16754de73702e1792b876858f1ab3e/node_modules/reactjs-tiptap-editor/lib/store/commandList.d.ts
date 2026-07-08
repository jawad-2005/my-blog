import { CommandList } from '../extensions/SlashCommand/types';
export declare function useSignalCommandList(): readonly [CommandList[], (val: CommandList[] | ((oldVal: CommandList[]) => CommandList[])) => void];
