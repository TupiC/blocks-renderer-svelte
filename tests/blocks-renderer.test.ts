import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import { BlocksRenderer } from '../src/lib';
import CustomBlock from './CustomBlock.svelte';
import CustomModifier from './CustomModifier.svelte';
import type { BlocksComponents, ModifiersComponents } from '../src/lib/components-context';
import type { BlocksContent, RootNode } from '../src/lib';

const content: RootNode[] = [
    {
        type: 'heading',
        level: 1,
        children: [
            {
                type: 'link',
                url: 'https://test.com',
                children: [{ type: 'text', text: 'A cool website' }],
            },
        ],
    },
    {
        type: 'paragraph',
        children: [
            { type: 'text', text: 'A simple paragraph' },
            { type: 'text', text: 'with bold text', bold: true },
            {
                type: 'text',
                text: ' and bold underlines',
                bold: true,
                underline: true,
            },
        ],
    },
];

function renderBlocks(props: {
    content: BlocksContent;
    blocks?: Partial<BlocksComponents>;
    modifiers?: Partial<ModifiersComponents>;
}) {
    return render(BlocksRenderer, { props });
}

describe('BlocksRenderer', () => {
    describe('Props', () => {
        it('renders content using default components', () => {
            renderBlocks({ content });
            expect(screen.getByText('A simple paragraph')).toBeInTheDocument();
        });

        it('renders when blocks and modifiers inputs are provided', () => {
            renderBlocks({
                content,
                blocks: {},
                modifiers: {},
            });
            expect(screen.getByText('A simple paragraph')).toBeInTheDocument();
            expect(document.querySelector('h1')?.textContent?.trim()).toBe('A cool website');
        });

        it('renders a custom block component when provided', () => {
            renderBlocks({
                content: [
                    {
                        type: 'heading',
                        level: 2,
                        children: [{ type: 'text', text: 'Custom heading' }],
                    },
                ],
                blocks: { heading: CustomBlock },
            });

            const customHeading = screen.getByTestId('custom-heading');
            expect(customHeading).toHaveTextContent('Custom heading');
            expect(customHeading).toHaveAttribute('data-level', '2');
            expect(document.querySelector('h2')).not.toBeInTheDocument();
        });
    });

    describe('Blocks', () => {
        it('renders paragraphs with text split across children', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', text: 'A paragraph' },
                            { type: 'text', text: ' with bold', bold: true },
                        ],
                    },
                ],
            });

            const p = screen.getByText('A paragraph').closest('p');
            expect(p).toBeInTheDocument();
            expect(p?.textContent?.trim()).toBe('A paragraph with bold');
        });

        it('renders a br when there is an empty paragraph', () => {
            const { container } = renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'First paragraph' }],
                    },
                    { type: 'paragraph', children: [{ type: 'text', text: '' }] },
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'Second paragraph' }],
                    },
                ],
            });

            expect(screen.getByText('First paragraph')).toBeInTheDocument();
            expect(screen.getByText('Second paragraph')).toBeInTheDocument();
            expect(container.querySelector('br')).toBeInTheDocument();
        });

        it('renders paragraphs with line breaks', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'First line\nSecond line' }],
                    },
                ],
            });

            const p = screen.getByText(/First line/).closest('p');
            expect(p).toBeInTheDocument();
            expect(p?.textContent?.trim()).toContain('First line');
            expect(p?.textContent?.trim()).toContain('Second line');
            expect(p?.querySelectorAll('br')).toHaveLength(1);
        });

        it('renders quotes', () => {
            renderBlocks({
                content: [
                    {
                        type: 'quote',
                        children: [{ type: 'text', text: 'A quote' }],
                    },
                ],
            });

            expect(screen.getByText('A quote').closest('blockquote')).toBeInTheDocument();
        });

        it('renders code blocks', () => {
            renderBlocks({
                content: [{ type: 'code', children: [{ type: 'text', text: 'my code' }] }],
            });

            const code = screen.getByText('my code');
            expect(code.closest('code')).toBeInTheDocument();
            expect(code.closest('pre')).toBeInTheDocument();
        });

        it('renders links', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'link',
                                url: 'https://test.com',
                                children: [{ type: 'text', text: 'A link' }],
                            },
                        ],
                    },
                ],
            });

            const link = document.querySelector('a[href="https://test.com"]');
            expect(link).toBeInTheDocument();
            expect(link?.textContent?.trim()).toMatch(/a link/i);
        });

        it('renders flat lists', () => {
            renderBlocks({
                content: [
                    {
                        type: 'list',
                        format: 'unordered',
                        children: [
                            { type: 'list-item', children: [{ type: 'text', text: 'Item 1' }] },
                            { type: 'list-item', children: [{ type: 'text', text: 'Item 2' }] },
                        ],
                    },
                ],
            });

            expect(document.querySelector('ul')).toBeInTheDocument();
            const items = document.querySelectorAll('li');
            expect(items).toHaveLength(2);
            expect(items[0].textContent?.trim()).toBe('Item 1');
            expect(items[1].textContent?.trim()).toBe('Item 2');
        });

        it('renders nested lists', () => {
            renderBlocks({
                content: [
                    {
                        type: 'list',
                        format: 'ordered',
                        children: [
                            {
                                type: 'list',
                                format: 'unordered',
                                children: [
                                    {
                                        type: 'list-item',
                                        children: [{ type: 'text', text: 'Nested item 1' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            expect(document.querySelectorAll('ol, ul')).toHaveLength(2);
            expect(screen.getByText('Nested item 1')).toBeInTheDocument();
        });

        it('renders images', () => {
            renderBlocks({
                content: [
                    {
                        type: 'image',
                        image: {
                            name: 'test',
                            alternativeText: 'Test',
                            caption: 'Test',
                            width: 100,
                            height: 100,
                            formats: {},
                            hash: 'test',
                            ext: 'jpg',
                            mime: 'image/jpeg',
                            url: 'https://test.com/test.jpg',
                            size: 100,
                            provider: 'local',
                            createdAt: '2021-01-01',
                            updatedAt: '2021-01-01',
                        },
                        children: [{ type: 'text', text: '' }],
                    },
                ],
            });

            const img = document.querySelector('img[alt="Test"]');
            expect(img).toBeInTheDocument();
            expect(img?.getAttribute('src')).toBe('https://test.com/test.jpg');
        });

        it('handles missing block components', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            renderBlocks({
                content: [
                    {
                        type: 'unknown' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                    {
                        type: 'unknown' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                    {
                        type: 'unknown2' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                ],
            });

            expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
            expect(warnSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-svelte] No component found for block type "unknown"',
            );
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-svelte] No component found for block type "unknown2"',
            );
            warnSpy.mockRestore();
        });
    });

    describe('Modifiers', () => {
        it('renders text without modifiers', () => {
            renderBlocks({ content: [{ type: 'paragraph', children: [{ type: 'text', text: 'My text' }] }] });
            expect(screen.getByText('My text')).toBeInTheDocument();
        });

        it('renders text with enabled modifiers', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'text',
                                text: 'My text',
                                bold: true,
                                italic: true,
                                underline: true,
                                strikethrough: true,
                                code: true,
                            },
                        ],
                    },
                ],
            });

            const text = screen.getByText('My text');
            expect(text.closest('strong')).toBeInTheDocument();
            expect(text.closest('em')).toBeInTheDocument();
            expect(text.closest('u')).toBeInTheDocument();
            expect(text.closest('del')).toBeInTheDocument();
            expect(text.closest('code')).toBeInTheDocument();
        });

        it('renders a custom modifier component when provided', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'Custom bold', bold: true }],
                    },
                ],
                modifiers: { bold: CustomModifier },
            });

            const customBold = screen.getByTestId('custom-bold');
            expect(customBold).toHaveTextContent('Custom bold');
            expect(customBold.closest('strong')).not.toBeInTheDocument();
            expect(warnSpy).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('ignores disabled modifiers', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'My text', bold: false }],
                    },
                ],
            });

            expect(screen.getByText('My text').closest('strong')).not.toBeInTheDocument();
        });

        it('handles missing modifier components', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', text: 'My paragraph', bold: true },
                            { type: 'text', text: 'Still my paragraph', bold: true },
                        ],
                    },
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'My other paragraph', italic: true }],
                    },
                ],
            });

            expect(screen.getAllByText(/my paragraph/i).length).toBeGreaterThan(0);
            expect(warnSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-svelte] No component found for modifier "bold"',
            );
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-svelte] No component found for modifier "italic"',
            );
            warnSpy.mockRestore();
        });

        it('escapes text before applying modifier html', () => {
            renderBlocks({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: '<script>alert(1)</script>', bold: true }],
                    },
                ],
            });

            expect(document.querySelector('script')).not.toBeInTheDocument();
            expect(document.querySelector('strong')?.textContent).toBe('<script>alert(1)</script>');
        });

        it('parses code blocks to plain text', () => {
            renderBlocks({
                content: [
                    {
                        type: 'code',
                        children: [
                            { type: 'text', text: 'const a = 1;' },
                            {
                                type: 'link',
                                url: 'https://test.com',
                                children: [{ type: 'text', text: 'const b = 2;', bold: true }],
                            },
                        ],
                    },
                ],
            });

            expect(screen.getByText('const a = 1;const b = 2;')).toBeInTheDocument();
        });

        it('parses headings to plain text', () => {
            renderBlocks({ content });
            expect(document.querySelector('h1')?.textContent?.trim()).toBe('A cool website');
        });
    });
});
