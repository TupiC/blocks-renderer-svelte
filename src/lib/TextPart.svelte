<script lang="ts">
    import TextPart from './TextPart.svelte';
    import { getComponentsContext } from './components-context';
    import type { Modifier } from './types';

    type Props = {
        content: string;
        modifiers: Modifier[];
    };

    let { content, modifiers }: Props = $props();

    const componentsContext = getComponentsContext();

    function getModifierComponent(modifierName: Modifier) {
        const component = componentsContext.getModifierComponent(modifierName);
        if (!component) {
            componentsContext.addMissingModifierType(modifierName);
        }
        return component;
    }
</script>

{#if modifiers.length === 0}
    {content}
{:else}
    {@const modifier = modifiers[0]}
    {@const remainingModifiers = modifiers.slice(1)}
    {@const CustomModifier = getModifierComponent(modifier)}

    {#if CustomModifier}
        <CustomModifier>
            <TextPart content={content} modifiers={remainingModifiers} />
        </CustomModifier>
    {:else if modifier === 'bold'}
        <strong><TextPart content={content} modifiers={remainingModifiers} /></strong>
    {:else if modifier === 'italic'}
        <em><TextPart content={content} modifiers={remainingModifiers} /></em>
    {:else if modifier === 'underline'}
        <u><TextPart content={content} modifiers={remainingModifiers} /></u>
    {:else if modifier === 'strikethrough'}
        <del><TextPart content={content} modifiers={remainingModifiers} /></del>
    {:else if modifier === 'code'}
        <code><TextPart content={content} modifiers={remainingModifiers} /></code>
    {/if}
{/if}
