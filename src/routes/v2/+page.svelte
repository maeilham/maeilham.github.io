<script lang="ts">
	import { today } from '$lib/v2/mock';

	let email = $state('');
	let submitted = $state(false);

	function subscribe(e: SubmitEvent) {
		e.preventDefault();
		// TODO: POST /api/subscribe 연동
		submitted = true;
	}
</script>

<svelte:head>
	<title>매일함</title>
</svelte:head>

<header class="top">
	<span class="logo">매일함</span>
</header>

<main>
	<!-- 슬로건 대신 실제 콘텐츠가 첫 화면. 서비스가 무엇인지 예시로 보여준다 -->
	<article class="today" aria-labelledby="today-title">
		<p class="today-meta">
			오늘의 질문 · <span class="mono">{today.date.replaceAll('-', '.')}</span> · {today.category}
		</p>
		<h1 id="today-title" class="today-title">{today.title}</h1>
		<p class="today-preview">{today.preview}</p>
		<a class="today-cta" href="/v2/today">답 읽어보기 →</a>
	</article>

	<section class="subscribe" aria-labelledby="sub-title">
		<h2 id="sub-title">이런 질문이 매일 아침 메일로 도착해요</h2>

		{#if submitted}
			<div class="sent" role="status">
				<p class="sent-title">메일함을 확인해주세요</p>
				<p class="sent-sub"><strong>{email}</strong>로 확인 링크를 보냈어요.</p>
			</div>
		{:else}
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
				<button type="submit">구독하기</button>
			</form>
			<p class="note">메일 하단의 링크로 언제든 해지할 수 있어요.</p>
		{/if}
	</section>

	<section class="how" aria-labelledby="how-title">
		<h2 id="how-title" class="sr-only">이렇게 읽어요</h2>
		<ol>
			<li><span class="num">1</span>아침에 메일이 도착해요</li>
			<li><span class="num">2</span>탭 한 번으로 질문을 열어요</li>
			<li><span class="num">3</span>먼저 생각해보고, 답을 확인해요</li>
			<li><span class="num">4</span>내 답을 GitHub에 남겨보세요</li>
		</ol>
	</section>
</main>

<footer class="foot">
	<span>© 2026 maeilham</span>
	<span class="links">
		<a href="/">터미널로 보기</a>
		<a href="https://github.com/maeilham" target="_blank" rel="noreferrer">GitHub</a>
	</span>
</footer>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
	.mono {
		font-family: var(--v2-mono);
	}

	.top {
		padding: 24px 0 0;
	}
	.logo {
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.2px;
	}

	/* 오늘의 질문 (첫 화면) */
	.today {
		padding: 56px 0 40px;
	}
	.today-meta {
		margin: 0 0 14px;
		font-size: 13px;
		color: var(--v2-mute);
	}
	.today-title {
		margin: 0;
		font-size: 28px;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: -0.4px;
	}
	.today-preview {
		margin: 16px 0 20px;
		font-size: 16px;
		line-height: 1.75;
		color: var(--v2-sub);
	}
	.today-cta {
		font-size: 15px;
		font-weight: 600;
		color: var(--v2-accent-text);
		text-decoration: none;
	}
	.today-cta:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* 구독 */
	.subscribe {
		padding: 32px 0 8px;
		border-top: 1px solid var(--v2-line);
	}
	.subscribe h2 {
		margin: 0 0 16px;
		font-size: 16px;
		font-weight: 600;
		line-height: 1.5;
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
		padding: 20px;
		border-radius: 14px;
		background: var(--v2-accent-soft);
	}
	.sent-title {
		margin: 0 0 4px;
		font-size: 16px;
		font-weight: 700;
	}
	.sent-sub {
		margin: 0;
		font-size: 14px;
		color: var(--v2-sub);
		overflow-wrap: anywhere;
	}

	.how {
		padding: 40px 0 8px;
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
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 40px 0 calc(28px + env(safe-area-inset-bottom));
		font-size: 13px;
		color: var(--v2-mute);
	}
	.links {
		display: flex;
		gap: 16px;
	}
	.foot a {
		color: var(--v2-mute);
		text-decoration: none;
	}
</style>
