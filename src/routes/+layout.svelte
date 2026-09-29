<script lang="ts">
	import "../app.css";
	import { browser } from '$app/environment';

	let { children } = $props();

	// 지금 배포된 게 어느 커밋인지 devtools 콘솔에서 확인하려는 용도.
	// 콘솔에 `__BUILD_INFO__`를 쳐보면 {sha, builtAt}이 나온다.
	if (browser) {
		(window as typeof window & { __BUILD_INFO__?: unknown }).__BUILD_INFO__ = __BUILD_INFO__;
		console.log('[매일함] build', __BUILD_INFO__);
	}
</script>

<svelte:head>
	<meta name="description" content="하루 한 통, 개발 면접 질문을 드립니다." />
</svelte:head>

{@render children()}
