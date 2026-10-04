<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/toast.svelte';
</script>

<!-- 오류 안내라서 role=alert로 바로 읽히게 한다. -->
{#if toast.visible}
	<div class="toast" role="alert" transition:fade={{ duration: 150 }}>
		<!-- 탭바 아이콘과 같은 선 굵기·끝 모양. 흰 원 안에 배경색 느낌표 -->
		<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path class="glyph" d="M12 7.5v5.5M12 16.3v.1" />
		</svg>
		<!-- 새 메시지로 바뀔 때마다 이 span만 다시 만들어서 살짝 나타나게 한다(바뀐 걸 알아보게) -->
		{#key toast.seq}<span class="msg">{toast.message}</span>{/key}
	</div>
{/if}

<style>
	.toast {
		--err-bg: #d93a2f; /* 다홍. 흰 글자 대비가 4.5:1 이상 나오도록 너무 밝지 않은 값을 썼다 */
		position: fixed;
		left: 50%;
		/* 탭바(56px) 위에 띄운다 */
		bottom: calc(56px + env(safe-area-inset-bottom) + 16px);
		transform: translateX(-50%);
		/* 콘텐츠 컬럼 폭에 맞춘 가로 막대. 글자는 왼쪽에 붙는다 */
		width: calc(100% - 40px);
		max-width: calc(var(--max) - 40px);
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: 14px 16px;
		border-radius: 12px;
		background: var(--err-bg);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.4;
		text-align: left;
		box-shadow: 0 4px 16px rgb(0 0 0 / 0.18);
		z-index: 30;
		pointer-events: none;
	}
	.icon {
		flex: none;
		margin-top: 1px; /* 첫 줄(line-height 1.4)의 가운데에 맞춘다 */
	}
	.icon circle {
		fill: currentColor;
	}
	.icon .glyph {
		stroke: var(--err-bg);
	}
	.msg {
		flex: 1;
		min-width: 0;
		display: block;
		animation: nudge 180ms ease-out;
	}
	@keyframes nudge {
		from {
			opacity: 0.35;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.msg {
			animation: none;
		}
	}
</style>
