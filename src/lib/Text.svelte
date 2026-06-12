<script lang="ts">
    import { getComponentsContext } from './components-context';
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

    const componentsContext = getComponentsContext();

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

    function escapeHtml(content: string): string {
        return content
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function getModifierComponent(modifierName: Modifier): unknown {
        const component = componentsContext.getModifierComponent(modifierName);
        if (!component) {
            componentsContext.addMissingModifierType(modifierName);
        }
        return component;
    }

    function applyModifiers(content: string): string {
        let result = escapeHtml(content);
        const modifiers = [...getModifiers()].reverse();

        for (const modifier of modifiers) {
            getModifierComponent(modifier);
            result = getDefaultModifierHtml(result, modifier);
        }

        return result;
    }

    function getDefaultModifierHtml(content: string, modifier: Modifier): string {
        switch (modifier) {
            case 'bold':
                return `<strong>${content}</strong>`;
            case 'italic':
                return `<em>${content}</em>`;
            case 'underline':
                return `<u>${content}</u>`;
            case 'strikethrough':
                return `<del>${content}</del>`;
            case 'code':
                return `<code>${content}</code>`;
            default:
                return content;
        }
    }
</script>

{#each getTextParts() as part, index}{#if index > 0}<br />{/if}<span>{@html applyModifiers(part)}</span>{/each}
