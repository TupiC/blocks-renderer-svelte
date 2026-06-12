# blocks-renderer-svelte

Svelte library for rendering [Strapi blocks content](https://docs.strapi.io/cms/features/content-type-builder#rich-text-blocks) with customizable components.

## Installation

```bash
npm install blocks-renderer-svelte
```

## Usage

```svelte
<script lang="ts">
    import { BlocksRenderer, type BlocksContent } from 'blocks-renderer-svelte';
    import MyHeading from './MyHeading.svelte';

    const blocksContent: BlocksContent = [
        { type: 'paragraph', children: [{ type: 'text', text: 'Hello world' }] },
    ];

    const customBlocks = {
        heading: MyHeading,
    };
</script>

<BlocksRenderer content={blocksContent} blocks={customBlocks} />
```

Custom block components receive the block's non-`type` props. For `heading` and `code` blocks, they also receive a `plainText` prop.

## Development

```bash
pnpm install
pnpm test
pnpm build:lib
pnpm start:playground
```

## Releasing

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Pushing to `main` with [conventional commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `BREAKING CHANGE:`) triggers a release to npm and a GitHub release. No manual version bumping is required.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
