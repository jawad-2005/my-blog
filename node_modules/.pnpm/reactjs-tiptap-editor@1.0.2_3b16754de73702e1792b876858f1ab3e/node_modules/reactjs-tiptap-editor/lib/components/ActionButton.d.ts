import { default as React } from 'react';
import { ButtonViewReturnComponentProps } from '../types';
import { TooltipContentProps } from '@radix-ui/react-tooltip';
export interface ActionButtonProps {
    icon?: string;
    title?: string;
    tooltip?: string;
    disabled?: boolean;
    shortcutKeys?: string[];
    customClass?: string;
    loading?: boolean;
    tooltipOptions?: TooltipContentProps;
    color?: string;
    action?: ButtonViewReturnComponentProps['action'];
    isActive?: ButtonViewReturnComponentProps['isActive'];
    children?: React.ReactNode;
    asChild?: boolean;
    upload?: boolean;
    initialDisplayedColor?: string;
    dataState?: boolean;
}
declare const ActionButton: React.ForwardRefExoticComponent<Partial<ActionButtonProps> & React.RefAttributes<HTMLButtonElement>>;
export { ActionButton };
