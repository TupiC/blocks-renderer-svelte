<script lang="ts">
    let { plainText, level }: { plainText?: string; level?: number } = $props();
</script>

<section data-testid="custom-heading" data-level={level}>{plainText}</section>
