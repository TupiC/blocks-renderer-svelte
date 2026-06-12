<script lang="ts">
    import TextPart from './TextPart.svelte';
    import type { Modifier } from './types';

    type Props = {
        text: string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        strikethrough?: boolean;
        code?: boolean;
    };

    let {
        text,
        bold = false,
        italic = false,
        underline = false,
        strikethrough = false,
        code = false,
    }: Props = $props();

    function getModifiers(): Modifier[] {
        const modifiers: Modifier[] = [];
        if (bold) modifiers.push('bold');
        if (italic) modifiers.push('italic');
        if (underline) modifiers.push('underline');
        if (strikethrough) modifiers.push('strikethrough');
        if (code) modifiers.push('code');
        return modifiers;
    }

    function getTextParts(): string[] {
        return text.split(/\r?\n|\r/g);
    }

    const modifiers = $derived(getModifiers());
</script>

{#each getTextParts() as part, index}{#if index > 0}<br />{/if}<span><TextPart content={part} {modifiers} /></span>{/each}
