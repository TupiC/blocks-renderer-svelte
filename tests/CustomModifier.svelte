<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children }: { children?: Snippet } = $props();
</script>

<mark data-testid="custom-bold">
    {#if children}
        {@render children()}
    {/if}
</mark>
