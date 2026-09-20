<script lang="ts">
	import type { Snippet } from 'svelte';

	// 탭 없이 화면 가운데에 안내 하나만 보여주는 단독 화면(구독 완료, 해지 등).
	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="page">
	<main class="center">
		<div class="inner">
			<h1>{title}</h1>
			{@render children()}
		</div>
	</main>
	<footer class="foot">© 2026 maeilham</footer>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		min-height: 100dvh;
		padding: 20px 0 calc(28px + env(safe-area-inset-bottom));
	}
	.center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-bottom: 48px; /* 시각적으로 정중앙보다 살짝 위에 놓이게 */
	}
	.inner {
		width: 100%;
		max-width: 400px;
	}
	h1 {
		margin: 0 0 12px;
		font-size: 24px;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: -0.3px;
	}
	.inner :global(p) {
		margin: 0 0 8px;
		font-size: 16px;
		line-height: 1.7;
		color: var(--v2-sub);
	}
	.inner :global(.error) {
		color: var(--v2-warm-text);
	}
	.inner :global(.btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 52px;
		margin-top: 24px;
		border: 0;
		border-radius: 14px;
		background: var(--v2-ink);
		color: var(--v2-bg);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}
	.inner :global(.btn:not(:disabled):active) {
		opacity: 0.85;
	}
	.inner :global(.btn:disabled) {
		opacity: 0.6;
		cursor: default;
	}
	.inner :global(.link) {
		display: inline-block;
		margin-top: 20px;
		font-size: 15px;
		font-weight: 600;
		color: var(--v2-accent-text);
		text-decoration: none;
	}
	.inner :global(.link:hover) {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.foot {
		padding-top: 32px;
		font-size: 13px;
		color: var(--v2-mute);
	}
</style>
