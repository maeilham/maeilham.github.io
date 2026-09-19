<script lang="ts">
	import { page } from '$app/state';
	import Reader from '$lib/v2/Reader.svelte';
	import { getItem, today } from '$lib/v2/mock';

	const item = $derived(getItem(page.params.id ?? ''));
</script>

<svelte:head>
	<title>{item?.title ?? '질문을 찾을 수 없어요'} · 매일함</title>
</svelte:head>

{#if item}
	{#key item.id}
		<Reader {item} isToday={item.id === today.id} />
	{/key}
{:else}
	<div class="missing">
		<p>찾을 수 없는 질문이에요.</p>
		<a href="/v2/archive">지난 질문으로 돌아가기</a>
	</div>
{/if}

<style>
	.missing {
		padding-top: 96px;
		text-align: center;
		color: var(--v2-sub);
	}
	.missing a {
		display: inline-block;
		margin-top: 12px;
		color: var(--v2-accent);
		font-weight: 600;
	}
</style>
