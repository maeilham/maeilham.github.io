<script lang="ts">
	import { page } from '$app/state';
	import Reader from '$lib/v2/Reader.svelte';
	import { ApiError, getContent, toReaderItem } from '$lib/v2/api';
	import type { ReaderItem } from '$lib/v2/types';

	type Status =
		| { kind: 'loading' }
		| { kind: 'ready'; item: ReaderItem }
		| { kind: 'notfound' }
		| { kind: 'error' };

	let status = $state<Status>({ kind: 'loading' });
	let attempt = $state(0); // 다시 시도를 누르면 올라가서 아래 effect가 다시 돈다

	// 주소(repo/id)나 다시 시도가 바뀌면 다시 가져온다. 이전 요청은 취소한다.
	$effect(() => {
		const repo = page.params.repo ?? '';
		const id = page.params.id ?? '';
		void attempt;

		const ctrl = new AbortController();
		status = { kind: 'loading' };
		getContent(repo, id, ctrl.signal)
			.then((c) => (status = { kind: 'ready', item: toReaderItem(c) }))
			.catch((e) => {
				if (ctrl.signal.aborted) return;
				status = e instanceof ApiError && e.status === 404 ? { kind: 'notfound' } : { kind: 'error' };
			});
		return () => ctrl.abort();
	});
</script>

<svelte:head>
	<title>{status.kind === 'ready' ? status.item.title : '질문'} · 매일함</title>
</svelte:head>

{#if status.kind === 'ready'}
	<Reader item={status.item} />
{:else if status.kind === 'loading'}
	<p class="msg" role="status">불러오는 중…</p>
{:else if status.kind === 'notfound'}
	<div class="msg">
		<p>찾을 수 없는 질문이에요.</p>
		<a href="/archive">지난 질문으로 돌아가기</a>
	</div>
{:else}
	<div class="msg">
		<p>질문을 불러오지 못했어요.</p>
		<button onclick={() => attempt++}>다시 시도</button>
	</div>
{/if}

<style>
	.msg {
		padding-top: 96px;
		text-align: center;
		color: var(--v2-sub);
	}
	.msg p {
		margin: 0;
	}
	.msg a,
	.msg button {
		display: inline-block;
		margin-top: 12px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--v2-accent-text);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
</style>
