<script lang="ts">
	import Reader from '$lib/v2/Reader.svelte';
	import { today } from '$lib/v2/mock';
</script>

<svelte:head>
	<title>오늘의 질문 · 매일함</title>
</svelte:head>

<Reader item={today} isToday />
