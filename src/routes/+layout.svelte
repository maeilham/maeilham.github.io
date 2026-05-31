<script lang="ts">
	import "../app.css";
	let { children } = $props();
</script>

<svelte:head>
	<meta name="description" content="하루 한 통, 개발 면접 질문을 드립니다." />
</svelte:head>

{@render children()}
