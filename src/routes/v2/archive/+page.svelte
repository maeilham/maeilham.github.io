<script lang="ts">
	import { items, today, type Category } from '$lib/v2/mock';

	const filters: ('전체' | Category)[] = ['전체', '백엔드', '프론트엔드', 'CS'];
	let filter = $state<'전체' | Category>('전체');

	const list = $derived(filter === '전체' ? items : items.filter((i) => i.category === filter));
</script>

<svelte:head>
	<title>지난 질문 · 매일함</title>
</svelte:head>

<header class="head">
	<h1>지난 질문</h1>
	<p>놓친 날도, 다시 보고 싶은 날도 여기서 읽어요.</p>
</header>

<div class="chips" role="group" aria-label="분야 필터">
	{#each filters as f (f)}
		<button class="chip" class:on={filter === f} aria-pressed={filter === f} onclick={() => (filter = f)}>
			{f}
		</button>
	{/each}
</div>

<ul class="list">
	{#each list as item (item.id)}
		<li>
			<a class="row" href="/v2/q/{item.id}">
				<div class="row-main">
					<p class="row-meta">
						<span>{item.date.slice(5).replace('-', '.')}</span>
						<span class="mono">#{item.no}</span>
						{#if item.id === today.id}<span class="badge">오늘</span>{/if}
					</p>
					<p class="row-title">{item.title}</p>
				</div>
				<span class="state" class:read={item.read} class:unread={!item.read} aria-label={item.read ? '읽음' : '안 읽음'}>
					{#if item.read}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
					{/if}
				</span>
			</a>
		</li>
	{:else}
		<li class="empty">이 분야의 질문이 아직 없어요.</li>
	{/each}
</ul>

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
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 0;
		border-bottom: 1px solid var(--v2-line);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.row:active {
		opacity: 0.7;
	}
	.row-main {
		flex: 1;
		min-width: 0;
	}
	.row-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 4px;
		font-size: 12px;
		color: var(--v2-mute);
	}
	.mono {
		font-family: var(--v2-mono);
	}
	.badge {
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--v2-warm-soft);
		color: var(--v2-warm-text);
		font-weight: 700;
	}
	.row-title {
		margin: 0;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.5;
		letter-spacing: -0.2px;
	}
	.state {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		color: var(--v2-accent-ink);
	}
	.state.read {
		background: var(--v2-accent);
	}
	.state.unread::after {
		content: '';
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--v2-warm);
	}
	.empty {
		padding: 48px 0;
		text-align: center;
		font-size: 14px;
		color: var(--v2-mute);
	}
</style>
