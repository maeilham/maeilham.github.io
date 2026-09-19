<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	const isLanding = $derived(path === '/v2');

	const tabs = [
		{ href: '/v2/today', label: '오늘', match: (p: string) => p === '/v2/today' },
		{ href: '/v2/archive', label: '지난 질문', match: (p: string) => p === '/v2/archive' || p.startsWith('/v2/q/') },
		{ href: '/v2/settings', label: '설정', match: (p: string) => p === '/v2/settings' }
	];
</script>

<svelte:head>
	<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#17171c" media="(prefers-color-scheme: dark)" />
</svelte:head>

<div class="v2" class:with-tabs={!isLanding}>
	{@render children()}

	{#if !isLanding}
		<nav class="tabbar" aria-label="주요 메뉴">
			{#each tabs as tab (tab.href)}
				{@const active = tab.match(path)}
				<a href={tab.href} class="tab" class:active aria-current={active ? 'page' : undefined}>
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						{#if tab.label === '오늘'}
							<rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4M16 3v4M4 10h16" />
						{:else if tab.label === '지난 질문'}
							<path d="M5 6h14M5 12h14M5 18h9" />
						{:else}
							<circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" />
						{/if}
					</svg>
					<span>{tab.label}</span>
				</a>
			{/each}
		</nav>
	{/if}
</div>

<style>
	:global(:root) {
		--v2-bg: #ffffff;
		--v2-surface: #f2f4f6;
		--v2-ink: #191f28;
		--v2-sub: #4e5968;
		--v2-mute: #8b95a1;
		--v2-line: #e5e8eb;
		--v2-accent: #3182f6;
		--v2-accent-ink: #ffffff;
		--v2-accent-soft: #e8f3ff;
		--v2-mono: ui-monospace, 'SF Mono', 'DM Mono', Menlo, Consolas, monospace;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--v2-bg: #17171c;
			--v2-surface: #202027;
			--v2-ink: #f2f4f6;
			--v2-sub: #c3c8d0;
			--v2-mute: #8b95a1;
			--v2-line: #2c2c35;
			--v2-accent: #4593fc;
			--v2-accent-ink: #ffffff;
			--v2-accent-soft: #1c2a3f;
		}
	}
	:global(body:has(.v2)) {
		background: var(--v2-bg);
	}

	.v2 {
		min-height: 100dvh;
		max-width: 480px;
		margin: 0 auto;
		padding: 0 20px;
		background: var(--v2-bg);
		color: var(--v2-ink);
		font-family: 'SF Pro KR', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
			'Noto Sans KR', sans-serif;
		-webkit-font-smoothing: antialiased;
		word-break: keep-all;
	}
	.v2.with-tabs {
		padding-bottom: calc(72px + env(safe-area-inset-bottom));
	}
	.v2 :global(a) {
		color: inherit;
	}

	.tabbar {
		position: fixed;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: 100%;
		max-width: 480px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding-bottom: env(safe-area-inset-bottom);
		background: var(--v2-bg);
		border-top: 1px solid var(--v2-line);
		z-index: 20;
	}
	.tab {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		height: 56px;
		font-size: 11px;
		font-weight: 600;
		color: var(--v2-mute);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.tab.active {
		color: var(--v2-ink);
	}
</style>
