<script lang="ts">
	import Reader from '$lib/v2/Reader.svelte';
	import { ApiError, getContent, getToday, toReaderItem } from '$lib/v2/api';
	import type { ReaderItem } from '$lib/v2/types';

	type Status =
		| { kind: 'loading' }
		| { kind: 'ready'; item: ReaderItem }
		| { kind: 'none' }
		| { kind: 'error' };

	let status = $state<Status>({ kind: 'loading' });
	let attempt = $state(0); // 다시 시도를 누르면 올라가서 아래 effect가 다시 돈다

	// 오늘의 질문(repo/id)을 먼저 받고, 그 글의 본문을 상세 API로 이어서 가져온다.
	// 오늘의 질문 API는 본문이 무거워서 일부러 본문을 넣지 않는다.
	$effect(() => {
		void attempt;
		const ctrl = new AbortController();
		status = { kind: 'loading' };
		(async () => {
			try {
				const today = await getToday(ctrl.signal);
				const content = await getContent(today.repo, today.id, ctrl.signal);
				if (!ctrl.signal.aborted) status = { kind: 'ready', item: toReaderItem(content) };
			} catch (e) {
				if (ctrl.signal.aborted) return;
				// 글이 하나도 없거나(오늘의 질문 404), 그 사이 삭제됐으면(상세 404) "아직 없음"으로 본다
				status = e instanceof ApiError && e.status === 404 ? { kind: 'none' } : { kind: 'error' };
			}
		})();
		return () => ctrl.abort();
	});
</script>

<svelte:head>
	<title>{status.kind === 'ready' ? status.item.title : '오늘의 질문'} · 매일함</title>
</svelte:head>

{#if status.kind === 'ready'}
	<Reader item={status.item} isToday />
{:else if status.kind === 'loading'}
	<p class="msg" role="status">불러오는 중…</p>
{:else if status.kind === 'none'}
	<div class="msg">
		<p>아직 오늘의 질문이 없어요.</p>
		<a href="/archive">지난 질문 보기</a>
	</div>
{:else}
	<div class="msg">
		<p>오늘의 질문을 불러오지 못했어요.</p>
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
