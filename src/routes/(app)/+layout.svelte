<script lang="ts">
	import { page } from '$app/state';
	import { auth, initAuth } from '$lib/auth.svelte';

	let { children } = $props();

	// 클라이언트에서만 실행된다(sessionStorage). 주소가 바뀔 때(라우트 이동, #t= 재진입)마다 다시 확인한다.
	$effect(() => {
		initAuth(page.url);
	});

	const path = $derived(page.url.pathname.replace(/\/$/, ''));
	// 구독 폼과 구독 확인·해지 안내는 탭 없이 단독 화면으로 보여준다.
	const hideTabs = $derived(['/subscribe', '/confirm', '/unsubscribe'].includes(path));

	// path는 끝의 /를 뗀 값이라 루트는 빈 문자열이다.
	// 설정 탭은 구독자(auth.status === 'subscriber')에게만 보인다.
	const tabs = $derived([
		{ href: '/', label: '오늘', match: (p: string) => p === '' },
		{ href: '/archive', label: '지난 질문', match: (p: string) => p === '/archive' || p.startsWith('/q/') },
		...(auth.status === 'subscriber'
			? [{ href: '/settings', label: '설정', match: (p: string) => p === '/settings' }]
			: [])
	]);
</script>

<svelte:head>
	<meta name="theme-color" content="#f6f5f2" />
</svelte:head>

<div class="app" class:with-tabs={!hideTabs}>
	{@render children()}

	{#if !hideTabs}
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
		--bg: #f6f5f2;
		--surface: #ebe9e4;
		--ink: #1f231e;
		--sub: #4a4f46;
		--mute: #6b7067;
		--line: #dedcd5;
		--border: #c9c7be;
		--max: 640px; /* 콘텐츠 컬럼 최대 폭. 화면이 이보다 좁으면 화면 폭을 그대로 쓴다 */
		--accent: #4d7c3a;
		--accent-text: #3d6a2c;
		--accent-ink: #ffffff;
		--accent-soft: #e3ebd9;
		--warm: #d9651a;
		--warm-soft: #fbe7d6;
		--warm-text: #a34a0c;
		--mono: ui-monospace, 'SF Mono', 'DM Mono', Menlo, Consolas, monospace;
	}
	/* TODO(dark): 다크모드는 후처리. 아래는 이전(파란 강조색) 팔레트라 새 웜그레이/올리브 그린 체계에 맞게
	   다시 잡은 뒤 <html data-theme="dark">로 켠다. 지금은 어디서도 활성화되지 않는다. */
	:global(:root[data-theme='dark']) {
		--bg: #17171c;
		--surface: #202027;
		--ink: #f2f4f6;
		--sub: #c3c8d0;
		--mute: #8b95a1;
		--line: #2c2c35;
		--accent: #4593fc;
		--accent-ink: #ffffff;
		--accent-soft: #1c2a3f;
	}
	:global(body:has(.app)) {
		background: var(--bg);
	}

	.app {
		min-height: 100dvh;
		max-width: var(--max);
		margin: 0 auto;
		padding: 0 20px;
		background: var(--bg);
		color: var(--ink);
		font-family: 'SF Pro KR', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo',
			'Noto Sans KR', sans-serif;
		-webkit-font-smoothing: antialiased;
		word-break: keep-all;
	}
	.app.with-tabs {
		padding-bottom: calc(72px + env(safe-area-inset-bottom));
	}
	.app :global(a) {
		color: inherit;
	}

	.tabbar {
		position: fixed;
		left: 50%;
		bottom: 0;
		transform: translateX(-50%);
		width: 100%;
		max-width: var(--max);
		display: grid;
		grid-auto-flow: column; /* 탭 개수와 관계없이 폭을 균등하게 나눈다 */
		grid-auto-columns: 1fr;
		padding-bottom: env(safe-area-inset-bottom);
		background: var(--bg);
		border-top: 1px solid var(--line);
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
		color: var(--mute);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.tab.active {
		color: var(--ink);
	}
</style>
