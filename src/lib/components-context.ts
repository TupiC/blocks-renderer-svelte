import { getContext } from 'svelte';
import type { Component, Snippet } from 'svelte';
import type { Modifier } from './types';

export interface BlockComponentProps {
    [key: string]: unknown;
    children?: unknown;
    plainText?: string;
}

export type BlockComponent = Component<BlockComponentProps>;
export type ModifierComponent = Component<{ children?: Snippet }>;

export interface BlocksComponents {
    [key: string]: BlockComponent;
}

export interface ModifiersComponents {
    [key: string]: ModifierComponent;
}

export interface ComponentsContextValue {
    blocks: BlocksComponents;
    modifiers: ModifiersComponents;
    missingBlockTypes: string[];
    missingModifierTypes: string[];
}

export interface ComponentsContext extends ComponentsContextValue {
    getContext(): ComponentsContextValue;
    getBlockComponent(type: string): BlockComponent | undefined;
    getModifierComponent(modifier: Modifier): ModifierComponent | undefined;
    addMissingBlockType(type: string): void;
    addMissingModifierType(modifier: string): void;
}

export const COMPONENTS_CONTEXT_KEY = Symbol('blocks-renderer-svelte');

export function createComponentsContext(context: ComponentsContextValue): ComponentsContext {
    return {
        ...context,
        getContext() {
            return {
                blocks: this.blocks,
                modifiers: this.modifiers,
                missingBlockTypes: this.missingBlockTypes,
                missingModifierTypes: this.missingModifierTypes,
            };
        },
        getBlockComponent(type: string) {
            return this.blocks[type];
        },
        getModifierComponent(modifier: Modifier) {
            return this.modifiers[modifier];
        },
        addMissingBlockType(type: string) {
            if (!this.missingBlockTypes.includes(type)) {
                console.warn(`[blocks-renderer-svelte] No component found for block type "${type}"`);
                this.missingBlockTypes.push(type);
            }
        },
        addMissingModifierType(modifier: string) {
            if (!this.missingModifierTypes.includes(modifier)) {
                console.warn(`[blocks-renderer-svelte] No component found for modifier "${modifier}"`);
                this.missingModifierTypes.push(modifier);
            }
        },
    };
}

export function getComponentsContext(): ComponentsContext {
    return (
        getContext<ComponentsContext | undefined>(COMPONENTS_CONTEXT_KEY) ??
        createComponentsContext({
            blocks: {},
            modifiers: {},
            missingBlockTypes: [],
            missingModifierTypes: [],
        })
    );
}
