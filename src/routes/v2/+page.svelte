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
	<section class="hero">
		<h1>출근길,<br />질문 하나.</h1>
		<p>
			아는 것 같았는데 막히는 것들. 매일 아침 한 통, 지하철에서 3분이면 끝나요. 다 읽으면
			“오늘은 여기까지”, 끝이 있어서 부담 없어요.
		</p>

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
				<button type="submit">무료로 구독하기</button>
			</form>
		{/if}
	</section>

	<section class="preview" aria-labelledby="preview-title">
		<h2 id="preview-title">오늘 도착한 질문</h2>
		<a class="card" href="/v2/today">
			<p class="card-meta">{today.dateLabel} · #{today.no}</p>
			<p class="card-title">{today.title}</p>
			<p class="card-desc">{today.preview}</p>
			<span class="card-cta">읽어보기 →</span>
		</a>
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

	.top {
		padding: 24px 0 0;
	}
	.logo {
		font-size: 16px;
		font-weight: 700;
		letter-spacing: -0.2px;
	}

	.hero {
		padding: 56px 0 40px;
	}
	.hero h1 {
		margin: 0;
		font-size: 36px;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -1px;
	}
	.hero > p {
		margin: 16px 0 28px;
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
		border: 1px solid var(--v2-line);
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
		background: var(--v2-accent);
		color: var(--v2-accent-ink);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		cursor: pointer;
	}
	.form button:active {
		opacity: 0.85;
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

	.preview h2 {
		margin: 0 0 12px;
		font-size: 14px;
		font-weight: 600;
		color: var(--v2-mute);
	}
	.card {
		display: block;
		padding: 20px;
		border-radius: 16px;
		background: var(--v2-surface);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.card:active {
		opacity: 0.85;
	}
	.card-meta {
		margin: 0 0 8px;
		font-size: 12px;
		font-weight: 600;
		color: var(--v2-accent);
	}
	.card-title {
		margin: 0 0 8px;
		font-size: 18px;
		font-weight: 700;
		line-height: 1.45;
		letter-spacing: -0.3px;
	}
	.card-desc {
		margin: 0 0 14px;
		font-size: 14px;
		line-height: 1.65;
		color: var(--v2-sub);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.card-cta {
		font-size: 14px;
		font-weight: 700;
		color: var(--v2-accent);
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
