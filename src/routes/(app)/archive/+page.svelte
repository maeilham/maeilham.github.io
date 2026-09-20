<script lang="ts">
	import { getContentList, type ContentSummary } from '$lib/v2/api';
	import { ALL_REPOS, dateLabel, filterByRepo, repoNames } from '$lib/v2/list';

	type Status = { kind: 'loading' } | { kind: 'ready'; items: ContentSummary[] } | { kind: 'error' };

	let status = $state<Status>({ kind: 'loading' });
	let attempt = $state(0); // 다시 시도를 누르면 올라가서 아래 effect가 다시 돈다
	let filter = $state(ALL_REPOS);

	$effect(() => {
		void attempt;
		const ctrl = new AbortController();
		status = { kind: 'loading' };
		getContentList(ctrl.signal)
			.then((items) => (status = { kind: 'ready', items }))
			.catch(() => {
				if (!ctrl.signal.aborted) status = { kind: 'error' };
			});
		return () => ctrl.abort();
	});

	const items = $derived(status.kind === 'ready' ? status.items : []);
	const names = $derived(repoNames(items));
	// 선택해 둔 repo가 새 목록에 없으면 전체로 되돌린다
	const activeFilter = $derived(names.includes(filter) ? filter : ALL_REPOS);
	const list = $derived(filterByRepo(items, activeFilter));
</script>

<svelte:head>
	<title>지난 질문 · 매일함</title>
</svelte:head>

<header class="head">
	<h1>지난 질문</h1>
	<p>놓친 날도, 다시 보고 싶은 날도 여기서 읽어요.</p>
</header>

{#if status.kind === 'loading'}
	<p class="msg" role="status">불러오는 중…</p>
{:else if status.kind === 'error'}
	<div class="msg">
		<p>질문 목록을 불러오지 못했어요.</p>
		<button onclick={() => attempt++}>다시 시도</button>
	</div>
{:else}
	{#if names.length > 0}
		<div class="chips" role="group" aria-label="분야 필터">
			{#each [ALL_REPOS, ...names] as f (f)}
				<button class="chip" class:on={activeFilter === f} aria-pressed={activeFilter === f} onclick={() => (filter = f)}>
					{f}
				</button>
			{/each}
		</div>
	{/if}

	<ul class="list">
		{#each list as item (item.repo + '/' + item.id)}
			<li>
				<a class="row" href="/q/{encodeURIComponent(item.repo)}/{encodeURIComponent(item.id)}">
					<p class="row-meta">
						<span>{dateLabel(item.authoredAt)}</span>
						<span>{item.repoName}</span>
					</p>
					<p class="row-title">{item.title}</p>
				</a>
			</li>
		{:else}
			<li class="empty">{items.length ? '이 분야의 질문이 아직 없어요.' : '아직 질문이 없어요.'}</li>
		{/each}
	</ul>
{/if}

<style>
	.head {
		padding: 28px 0 20px;
	}
	.head h1 {
		margin: 0 0 6px;
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.5px;
	}
	.head p {
		margin: 0;
		font-size: 14px;
		color: var(--v2-mute);
	}

	.msg {
		padding-top: 48px;
		text-align: center;
		color: var(--v2-sub);
	}
	.msg p {
		margin: 0;
	}
	.msg button {
		margin-top: 12px;
		padding: 0;
		border: 0;
		background: none;
		color: var(--v2-accent-text);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}

	.chips {
		display: flex;
		gap: 8px;
		margin: 0 -20px;
		padding: 0 20px 16px;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.chips::-webkit-scrollbar {
		display: none;
	}
	.chip {
		flex: none;
		height: 36px;
		padding: 0 14px;
		border: 0;
		border-radius: 999px;
		background: var(--v2-surface);
		color: var(--v2-sub);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}
	.chip.on {
		background: var(--v2-ink);
		color: var(--v2-bg);
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: block;
		padding: 16px 0;
		border-bottom: 1px solid var(--v2-line);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.row:active {
		opacity: 0.7;
	}
	.row-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 4px;
		font-size: 12px;
		color: var(--v2-mute);
	}
	.row-title {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: -0.2px;
	}
	.empty {
		padding: 48px 0;
		text-align: center;
		font-size: 14px;
		color: var(--v2-mute);
	}
</style>
