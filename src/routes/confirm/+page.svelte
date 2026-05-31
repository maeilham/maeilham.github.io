<script lang="ts">
	import { page } from "$app/stores";
	const ok = $derived($page.url.searchParams.get("ok") === "1");
	const error = $derived($page.url.searchParams.get("error"));
</script>

<svelte:head>
	<title>구독 확인 — 매일함</title>
</svelte:head>

<div class="min-h-screen bg-white flex flex-col items-center justify-center px-6">
	<div class="w-full max-w-sm text-center">
		{#if ok}
			<div class="text-5xl mb-6">🎉</div>
			<h1 class="text-2xl font-bold mb-3">구독이 완료됐습니다!</h1>
			<p class="text-sm text-zinc-500 leading-relaxed">
				내일부터 매일 아침 면접 질문이 도착합니다.<br />
				GitHub에서 답하고, 함께 모범답안을 만들어가요.
			</p>
		{:else}
			<div class="text-5xl mb-6">😢</div>
			<h1 class="text-2xl font-bold mb-3">링크가 유효하지 않습니다</h1>
			<p class="text-sm text-zinc-500 leading-relaxed">
				{error ?? "만료됐거나 이미 사용된 링크입니다."}
			</p>
		{/if}
		<a href="/" class="inline-block mt-8 px-6 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity" style="background: #FF7002;">
			홈으로
		</a>
	</div>
</div>
