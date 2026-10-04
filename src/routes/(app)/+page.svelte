<script lang="ts">
	import Reader from '$lib/Reader.svelte';
	import { ApiError, getContent, getToday, toReaderItem } from '$lib/api';
	import type { ReaderItem } from '$lib/types';
	import { linkJustConfirmed, dismissJustConfirmed } from '$lib/auth.svelte';

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

{#if linkJustConfirmed.value}
	<!-- 링크를 처음 여는 순간(서버가 newly_confirmed:true를 준 바로 그 때)에만 한 번 뜬다.
	     오늘의 질문 로딩 상태(status)와 무관하게 항상 보여야 한다 — 콘텐츠가 없는 날에도 가입은
	     완료된 거라서, status.kind === 'ready' 안에 가두면 그런 날엔 배너가 영영 안 뜬다. -->
	<div class="confirmed-banner" role="status">
		<p>가입이 완료됐어요! 다음에 바로 들어오려면 <strong>지금 홈 화면에 추가</strong>해두세요.</p>
		<button onclick={dismissJustConfirmed} aria-label="닫기">✕</button>
	</div>
{/if}

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
	.confirmed-banner {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		margin: 20px 0 0;
		padding: 14px 16px;
		border-radius: 14px;
		background: var(--accent-soft);
		font-size: 13px;
		line-height: 1.6;
		color: var(--sub);
	}
	.confirmed-banner p {
		flex: 1;
		margin: 0;
	}
	.confirmed-banner strong {
		color: var(--ink);
	}
	.confirmed-banner button {
		flex: none;
		padding: 0;
		border: 0;
		background: none;
		font-size: 16px;
		line-height: 1;
		color: var(--mute);
		cursor: pointer;
	}

	.msg {
		padding-top: 96px;
		text-align: center;
		color: var(--sub);
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
		color: var(--accent-text);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
</style>
