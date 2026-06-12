<script lang="ts">
    import Block from './Block.svelte';
    import Text from './Text.svelte';
    import { getComponentsContext } from './components-context';
    import type {
        DefaultInlineNode,
        LinkInlineNode,
        ListBlockNode,
        ListItemInlineNode,
        Node,
    } from './types';

    const VOID_TYPES = ['image'];

    const KNOWN_BLOCK_TYPES = [
        'paragraph',
        'quote',
        'code',
        'heading',
        'list',
        'list-item',
        'link',
        'image',
    ] as const;

    type Props = {
        content: Node;
    };

    let { content }: Props = $props();

    const componentsContext = getComponentsContext();

    function getBlockComponent(node: Node) {
        return componentsContext.getBlockComponent(node.type);
    }

    function isKnownType(node: Node): boolean {
        return (KNOWN_BLOCK_TYPES as readonly string[]).includes(node.type);
    }

    function shouldRender(node: Node): boolean {
        const shouldRenderNode = !!getBlockComponent(node) || isKnownType(node);
        if (!shouldRenderNode) {
            componentsContext.addMissingBlockType(node.type);
        }
        return shouldRenderNode;
    }

    function isVoidType(node: Node): boolean {
        return VOID_TYPES.includes(node.type);
    }

    function isEmptyParagraph(node: Node): boolean {
        return (
            node.type === 'paragraph' &&
            node.children.length === 1 &&
            node.children[0].type === 'text' &&
            node.children[0].text === ''
        );
    }

    function getPlainText(children: DefaultInlineNode[]): string {
        return children.reduce((currentPlainText: string, node) => {
            if (node.type === 'text') {
                return currentPlainText.concat(node.text);
            }
            if (node.type === 'link') {
                return currentPlainText.concat(getPlainText(node.children));
            }
            return currentPlainText;
        }, '');
    }

    function plainText(node: Node): string | undefined {
        if (node.type === 'code' || node.type === 'heading') {
            return getPlainText(node.children);
        }
        return undefined;
    }

    function blockProps(node: Node): Record<string, unknown> {
        const { children, type, ...props } = node as Node & { children?: unknown };
        if (node.type === 'code' || node.type === 'heading') {
            return {
                ...props,
                children,
                plainText: plainText(node),
            };
        }
        return {
            ...props,
            children,
        };
    }

    function childrenNodes(node: Node): DefaultInlineNode[] {
        return node.children as DefaultInlineNode[];
    }
</script>

{#if !shouldRender(content)}
    <!-- Block type not found, silently ignore -->
{:else if isEmptyParagraph(content)}
    <br />
{:else if isVoidType(content)}
    {#if content.type === 'image'}
        <img src={content.image.url} alt={content.image.alternativeText || ''} />
    {/if}
{:else if getBlockComponent(content)}
    {@const CustomBlock = getBlockComponent(content)}
    <CustomBlock {...blockProps(content)} />
{:else if content.type === 'paragraph'}
    <p>{#each childrenNodes(content) as childNode}{#if childNode.type === 'text'}<Text text={childNode.text} bold={childNode.bold} italic={childNode.italic} underline={childNode.underline} strikethrough={childNode.strikethrough} code={childNode.code} />{:else}<Block content={childNode} />{/if}{/each}</p>
{:else if content.type === 'quote'}
    <blockquote>{#each childrenNodes(content) as childNode}{#if childNode.type === 'text'}<Text text={childNode.text} bold={childNode.bold} italic={childNode.italic} underline={childNode.underline} strikethrough={childNode.strikethrough} code={childNode.code} />{:else}<Block content={childNode} />{/if}{/each}</blockquote>
{:else if content.type === 'code'}
    <pre><code>{plainText(content)}</code></pre>
{:else if content.type === 'heading'}
    {#if content.level === 1}
        <h1>{plainText(content)}</h1>
    {:else if content.level === 2}
        <h2>{plainText(content)}</h2>
    {:else if content.level === 3}
        <h3>{plainText(content)}</h3>
    {:else if content.level === 4}
        <h4>{plainText(content)}</h4>
    {:else if content.level === 5}
        <h5>{plainText(content)}</h5>
    {:else if content.level === 6}
        <h6>{plainText(content)}</h6>
    {/if}
{:else if content.type === 'list'}
    {#if content.format === 'ordered'}
        <ol>
            {#each content.children as childNode}
                <Block content={childNode as ListItemInlineNode | ListBlockNode} />
            {/each}
        </ol>
    {:else}
        <ul>
            {#each content.children as childNode}
                <Block content={childNode as ListItemInlineNode | ListBlockNode} />
            {/each}
        </ul>
    {/if}
{:else if content.type === 'list-item'}
    <li>{#each childrenNodes(content) as childNode}{#if childNode.type === 'text'}<Text text={childNode.text} bold={childNode.bold} italic={childNode.italic} underline={childNode.underline} strikethrough={childNode.strikethrough} code={childNode.code} />{:else}<Block content={childNode} />{/if}{/each}</li>
{:else if content.type === 'link'}
    <a href={(content as LinkInlineNode).url}>{#each childrenNodes(content) as childNode}{#if childNode.type === 'text'}<Text text={childNode.text} bold={childNode.bold} italic={childNode.italic} underline={childNode.underline} strikethrough={childNode.strikethrough} code={childNode.code} />{:else}<Block content={childNode} />{/if}{/each}</a>
{/if}
