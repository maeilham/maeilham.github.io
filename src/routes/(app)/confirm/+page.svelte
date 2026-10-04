<script lang="ts">
	import { page } from '$app/state';
	import Notice from '$lib/Notice.svelte';

	// 서버가 확인 링크를 처리한 뒤 ?status=confirmed 또는 ?status=invalid로 보낸다.
	// 알 수 없는 값(주소를 직접 연 경우 등)은 성공으로 보여주지 않고 실패 안내를 쓴다.
	const confirmed = $derived(page.url.searchParams.get('status') === 'confirmed');
</script>

<svelte:head>
	<title>{confirmed ? '구독 완료' : '링크를 확인해주세요'} · 매일함</title>
</svelte:head>

{#if confirmed}
	<Notice title="구독이 완료됐어요">
		<p>내일 아침부터 질문이 메일로 도착해요.</p>
		<a class="btn" href="/">오늘의 질문 보기</a>
	</Notice>
{:else}
	<Notice title="링크가 유효하지 않아요">
		<p>확인 링크가 만료됐거나 올바르지 않아요. 링크는 발송 후 48시간 동안만 유효해요.</p>
		<a class="btn" href="/subscribe">다시 구독하기</a>
	</Notice>
{/if}
