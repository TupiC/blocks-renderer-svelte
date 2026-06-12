<script lang="ts">
    import { setContext } from 'svelte';
    import Block from './Block.svelte';
    import {
        COMPONENTS_CONTEXT_KEY,
        createComponentsContext,
        type BlocksComponents,
        type ModifiersComponents,
    } from './components-context';
    import type { BlocksContent } from './types';

    type Props = {
        content: BlocksContent;
        blocks?: Partial<BlocksComponents>;
        modifiers?: Partial<ModifiersComponents>;
    };

    let props: Props = $props();

    function getInitialComponentsContext() {
        return createComponentsContext({
            blocks: (props.blocks ?? {}) as BlocksComponents,
            modifiers: (props.modifiers ?? {}) as ModifiersComponents,
            missingBlockTypes: [],
            missingModifierTypes: [],
        });
    }

    const componentsContext = getInitialComponentsContext();

    setContext(COMPONENTS_CONTEXT_KEY, componentsContext);
</script>

{#each props.content as block}
    <Block content={block} />
{/each}
