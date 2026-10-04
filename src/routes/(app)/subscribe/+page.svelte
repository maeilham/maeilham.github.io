<script lang="ts">
	import { SubscribeForm } from '$lib/subscribe.svelte';

	// 이메일 형식이 맞을 때만 버튼을 활성화한다(form.valid). 성공해도 메일의 링크를 눌러야 구독이 확정된다.
	const form = new SubscribeForm();

	// 오던 화면(오늘/지난 질문)으로 돌아간다. 주소를 직접 열어 히스토리가 없으면 링크 기본 동작(오늘)을 쓴다.
	function goBack(e: MouseEvent) {
		if (history.length > 1) {
			e.preventDefault();
			history.back();
		}
	}
</script>

<svelte:head>
	<title>메일로 받기 · 매일함</title>
</svelte:head>

<div class="page">
	<a class="back" href="/" onclick={goBack}>← 돌아가기</a>

	<!-- 화면 세로 중앙: 이용 흐름(제목 자리) + 이메일 입력 -->
	<main class="center">
		<h1 class="sr-only">매일 아침 메일로 받아보기</h1>

		<div class="inner">
			{#if form.status === 'sent'}
				<div class="sent" role="status">
					<p class="sent-title">메일함을 확인해주세요</p>
					<p class="sent-sub"><strong>{form.email}</strong>로 확인 링크를 보냈어요.</p>
					<p class="sent-sub">링크를 누르면 구독이 완료돼요.</p>
				</div>
				<a class="link" href="/">오늘의 질문으로 돌아가기</a>
			{:else}
				<ol class="how" aria-label="이렇게 읽어요">
					<li><span class="num">1</span>아침에 메일이 도착해요</li>
					<li><span class="num">2</span>탭 한 번으로 질문을 열어요</li>
					<li><span class="num">3</span>먼저 생각해보고, 답을 확인해요</li>
					<li><span class="num">4</span>내 답을 GitHub에 남겨보세요</li>
				</ol>

				<form class="form" onsubmit={form.submit}>
					<label class="sr-only" for="email">이메일</label>
					<input
						id="email"
						type="email"
						inputmode="email"
						autocomplete="email"
						placeholder="이메일 주소"
						required
						bind:value={form.email}
					/>
					<button type="submit" disabled={!form.valid || form.status === 'sending'}>
						{form.status === 'sending' ? '보내는 중…' : '메일로 받기'}
					</button>
				</form>
				{#if form.status === 'error'}
					<p class="error" role="alert">{form.error}</p>
				{/if}
				<p class="note">메일 하단의 링크로 언제든 해지할 수 있어요.</p>
			{/if}
		</div>
	</main>

	<footer class="foot">© 2026 maeilham</footer>
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

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
		align-items: center; /* 가로 중앙 */
		justify-content: center; /* 세로 중앙 */
		padding-bottom: 48px; /* 시각적으로 정중앙보다 살짝 위에 놓이게 */
	}
	/* 폰에서는 화면 폭을 그대로 쓰고, 넓은 화면에서는 400px 블록이 가운데에 놓인다. 글은 블록 안에서 왼쪽 정렬 */
	.inner {
		width: 100%;
		max-width: 400px;
	}
	.back {
		align-self: flex-start;
		font-size: 14px;
		font-weight: 600;
		color: var(--mute);
		text-decoration: none;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.form input {
		height: 52px;
		padding: 0 16px;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--bg);
		color: var(--ink);
		font: inherit;
		font-size: 16px; /* iOS 자동 확대 방지 */
	}
	.form input::placeholder {
		color: var(--mute);
	}
	.form input:focus {
		outline: 2px solid var(--accent);
		outline-offset: -1px;
		border-color: transparent;
	}
	.form button {
		height: 52px;
		border: 0;
		border-radius: 14px;
		background: var(--ink);
		color: var(--bg);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
	}
	.form button:not(:disabled):active {
		opacity: 0.85;
	}
	.form button:disabled {
		background: var(--line);
		color: var(--mute);
		cursor: not-allowed;
	}
	.error {
		margin: 12px 0 0;
		font-size: 14px;
		color: var(--warm-text);
	}
	.note {
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--mute);
	}

	.sent {
		margin-top: 24px;
		padding: 20px;
		border-radius: 14px;
		background: var(--accent-soft);
	}
	.sent-title {
		margin: 0 0 8px;
		font-size: 16px;
		font-weight: 700;
	}
	.sent-sub {
		margin: 0 0 4px;
		font-size: 14px;
		line-height: 1.6;
		color: var(--sub);
		overflow-wrap: anywhere;
	}
	.link {
		display: inline-block;
		margin-top: 20px;
		font-size: 15px;
		font-weight: 600;
		color: var(--accent-text);
		text-decoration: none;
	}
	.link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.how {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin: 0 0 36px;
		padding: 0;
		list-style: none;
	}
	.how li {
		display: flex;
		align-items: center;
		gap: 14px;
		font-size: 17px;
		line-height: 1.5;
		color: var(--ink);
	}
	.num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--surface);
		font-family: var(--mono);
		font-size: 12px;
		font-weight: 600;
		color: var(--ink);
	}

	.foot {
		padding-top: 32px;
		font-size: 13px;
		color: var(--mute);
	}
</style>
