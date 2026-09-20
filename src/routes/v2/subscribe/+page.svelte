<script lang="ts">
	let email = $state('');
	let submitted = $state(false);

	function subscribe(e: SubmitEvent) {
		e.preventDefault();
		// TODO: POST /api/subscribe 연동. 성공해도 확인 메일 링크를 눌러야 구독이 확정된다.
		submitted = true;
	}

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
	<a class="back" href="/v2/today" onclick={goBack}>← 돌아가기</a>

	<h1>매일 아침 메일로 받아보기</h1>

	{#if submitted}
		<div class="sent" role="status">
			<p class="sent-title">메일함을 확인해주세요</p>
			<p class="sent-sub"><strong>{email}</strong>로 확인 링크를 보냈어요.</p>
			<p class="sent-sub">링크를 누르면 구독이 완료돼요.</p>
		</div>
		<a class="link" href="/v2/today">오늘의 질문으로 돌아가기</a>
	{:else}
		<p class="desc">입력한 주소로 확인 링크를 보내드려요. 링크를 누르면 구독이 완료돼요.</p>

		<form class="form" onsubmit={subscribe}>
			<label class="sr-only" for="email">이메일</label>
			<input
				id="email"
				type="email"
				inputmode="email"
				autocomplete="email"
				placeholder="이메일 주소"
				required
				bind:value={email}
			/>
			<button type="submit">메일로 받기</button>
		</form>
		<p class="note">메일 하단의 링크로 언제든 해지할 수 있어요.</p>

		<section class="how" aria-labelledby="how-title">
			<h2 id="how-title" class="sr-only">이렇게 읽어요</h2>
			<ol>
				<li><span class="num">1</span>아침에 메일이 도착해요</li>
				<li><span class="num">2</span>탭 한 번으로 질문을 열어요</li>
				<li><span class="num">3</span>먼저 생각해보고, 답을 확인해요</li>
				<li><span class="num">4</span>내 답을 GitHub에 남겨보세요</li>
			</ol>
		</section>
	{/if}

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
		padding: 20px 0 calc(40px + env(safe-area-inset-bottom));
	}
	.back {
		display: inline-block;
		margin-bottom: 40px;
		font-size: 14px;
		font-weight: 600;
		color: var(--v2-mute);
		text-decoration: none;
	}
	h1 {
		margin: 0 0 12px;
		font-size: 26px;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: -0.4px;
	}
	.desc {
		margin: 0 0 28px;
		font-size: 16px;
		line-height: 1.7;
		color: var(--v2-sub);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.form input {
		height: 52px;
		padding: 0 16px;
		border: 1px solid var(--v2-border);
		border-radius: 14px;
		background: var(--v2-bg);
		color: var(--v2-ink);
		font: inherit;
		font-size: 16px; /* iOS 자동 확대 방지 */
	}
	.form input::placeholder {
		color: var(--v2-mute);
	}
	.form input:focus {
		outline: 2px solid var(--v2-accent);
		outline-offset: -1px;
		border-color: transparent;
	}
	.form button {
		height: 52px;
		border: 0;
		border-radius: 14px;
		background: var(--v2-ink);
		color: var(--v2-bg);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
	}
	.form button:active {
		opacity: 0.85;
	}
	.note {
		margin: 12px 0 0;
		font-size: 13px;
		color: var(--v2-mute);
	}

	.sent {
		margin-top: 24px;
		padding: 20px;
		border-radius: 14px;
		background: var(--v2-accent-soft);
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
		color: var(--v2-sub);
		overflow-wrap: anywhere;
	}
	.link {
		display: inline-block;
		margin-top: 20px;
		font-size: 15px;
		font-weight: 600;
		color: var(--v2-accent-text);
		text-decoration: none;
	}
	.link:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.how {
		padding: 40px 0 0;
	}
	.how ol {
		display: flex;
		flex-direction: column;
		gap: 14px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.how li {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 15px;
		color: var(--v2-sub);
	}
	.num {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--v2-surface);
		font-family: var(--v2-mono);
		font-size: 12px;
		font-weight: 600;
		color: var(--v2-ink);
	}

	.foot {
		padding-top: 56px;
		font-size: 13px;
		color: var(--v2-mute);
	}
</style>
