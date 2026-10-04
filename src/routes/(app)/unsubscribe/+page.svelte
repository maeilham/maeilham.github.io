<script lang="ts">
	import { page } from '$app/state';
	import Notice from '$lib/Notice.svelte';
	import { ApiError, unsubscribe } from '$lib/api';

	const token = $derived(page.url.searchParams.get('token') ?? '');

	type Status = 'idle' | 'sending' | 'done' | 'error';
	let status = $state<Status>('idle');
	let error = $state('');

	// 해지는 버튼을 눌렀을 때만 실행한다. 메일 보안 스캐너나 링크 미리보기가 주소를 열기만 해도
	// 해지되는 일이 없도록 화면을 여는 것만으로는 아무것도 하지 않는다.
	async function submit() {
		if (status === 'sending') return;
		status = 'sending';
		error = '';
		try {
			await unsubscribe(token);
			status = 'done';
		} catch (e) {
			status = 'error';
			error =
				e instanceof ApiError && e.status === 400
					? '링크가 만료됐거나 올바르지 않아요. 링크는 발송 후 48시간 동안만 유효해요.'
					: '해지하지 못했어요. 잠시 후 다시 시도해주세요.';
		}
	}
</script>

<svelte:head>
	<title>구독 해지 · 매일함</title>
</svelte:head>

{#if status === 'done'}
	<Notice title="구독이 해지됐어요">
		<p>그동안 읽어주셔서 고마워요. 마음이 바뀌면 언제든 다시 구독할 수 있어요.</p>
		<a class="link" href="/subscribe">다시 구독하기</a>
	</Notice>
{:else if !token}
	<Notice title="링크가 유효하지 않아요">
		<p>메일 하단의 해지 링크를 다시 눌러주세요.</p>
		<a class="link" href="/">오늘의 질문 보기</a>
	</Notice>
{:else}
	<Notice title="구독을 해지할까요?">
		<p>해지하면 더 이상 매일 아침 메일이 오지 않아요.</p>
		{#if status === 'error'}
			<p class="error" role="alert">{error}</p>
		{/if}
		<button class="btn" type="button" onclick={submit} disabled={status === 'sending'}>
			{status === 'sending' ? '해지하는 중…' : '구독 해지하기'}
		</button>
		<a class="link" href="/">그만두기</a>
	</Notice>
{/if}
