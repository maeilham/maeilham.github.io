<script lang="ts">
	import { week, type Item } from '$lib/v2/mock';
	import { renderMarkdown } from '$lib/v2/markdown';
	import { auth } from '$lib/v2/auth.svelte';

	let { item, isToday = false }: { item: Item; isToday?: boolean } = $props();

	let revealed = $state(false);
	const open = $derived(revealed || item.read);
	// 답을 펼칠 때만 렌더한다($derived는 읽힐 때 계산됨). 결과는 살균된 HTML이다.
	const bodyHtml = $derived(renderMarkdown(item.body));
	const notesHtml = $derived(item.notes ? renderMarkdown(item.notes) : '');
</script>

<article class="reader">
	<header class="head">
		{#if !isToday}
			<a class="back" href="/v2/archive">← 지난 질문</a>
		{/if}
		<p class="meta">
			<span>{isToday ? '오늘의 질문' : item.dateLabel}</span>
			<span class="dot" aria-hidden="true">·</span>
			<span>{item.category}</span>
			<span class="dot" aria-hidden="true">·</span>
			<span>{item.minutes}분</span>
		</p>
		<h1 class="title">{item.title}</h1>
		<p class="preview">{item.preview}</p>
		<ul class="tags">
			{#each item.tags as tag (tag)}
				<li class="mono">#{tag}</li>
			{/each}
		</ul>
	</header>

	{#if !open}
		<section class="think" aria-labelledby="think-title">
			<h2 id="think-title">먼저 생각해보세요</h2>
			<p>30초만 내 답을 떠올려 본 뒤에 확인하면 훨씬 오래 남아요.</p>
		</section>

		<div class="sticky">
			<button class="primary" onclick={() => (revealed = true)}>답 확인하기</button>
		</div>
	{:else}
		<section class="prose">
			{@html bodyHtml}
		</section>

		{#if item.notes}
			<section class="notes" aria-labelledby="notes-title">
				<h2 id="notes-title">커뮤니티 학습 노트</h2>
				<p class="notes-sub">댓글 {item.comments}개를 AI가 읽고 정리했어요</p>
				<div class="notes-body">{@html notesHtml}</div>
			</section>
		{/if}

		<section class="reply">
			<h2>내 생각은 어땠나요?</h2>
			<p>{item.comments}명이 답을 남겼어요. 나의 답도 한 줄 남겨보세요.</p>
			<a class="primary" href={item.discussionUrl} target="_blank" rel="noreferrer">
				내 답 남기기
			</a>
			<!-- 비구독자에게만. 'unknown'(서버 확인 전)에는 그리지 않아 구독자에게 깜빡이지 않게 한다 -->
			{#if auth.status === 'visitor'}
				<a class="secondary" href="/v2/subscribe">매일 아침 메일로 받기</a>
			{/if}
		</section>

		{#if auth.status === 'subscriber' && isToday}
			<section class="complete" aria-label="오늘 완료">
				<p class="complete-title">오늘은 여기까지</p>
				<p class="complete-sub">내일 아침에 다음 질문이 도착해요.</p>
				<ol class="week" aria-label="이번 주 기록">
					{#each week as day (day.label)}
						{@const state = day.state === 'today' ? 'done' : day.state}
						<li class="day is-{state}">
							<span class="cell" aria-hidden="true"></span>
							<span class="day-label">{day.label}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}
	{/if}
</article>

<style>
	.reader {
		padding-top: 20px;
	}

	.back {
		display: inline-block;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: 600;
		color: var(--v2-mute);
		text-decoration: none;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0 0 12px;
		font-size: 13px;
		font-weight: 600;
		color: var(--v2-sub);
	}
	.meta .dot {
		color: var(--v2-mute);
	}
	.mono {
		font-family: var(--v2-mono);
	}

	.title {
		margin: 0;
		font-size: 26px;
		font-weight: 700;
		line-height: 1.4;
		letter-spacing: -0.5px;
	}
	.preview {
		margin: 14px 0 0;
		font-size: 16px;
		line-height: 1.7;
		color: var(--v2-sub);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 16px 0 0;
		padding: 0;
		list-style: none;
	}
	.tags li {
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--v2-surface);
		font-size: 12px;
		color: var(--v2-sub);
	}

	/* 생각해보기 */
	.think {
		margin-top: 32px;
		padding: 24px 20px;
		border-radius: 16px;
		background: var(--v2-surface);
	}
	.think h2 {
		margin: 0 0 6px;
		font-size: 16px;
		font-weight: 700;
	}
	.think p {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
		color: var(--v2-sub);
	}

	.sticky {
		position: fixed;
		left: 50%;
		bottom: calc(56px + env(safe-area-inset-bottom) + 12px);
		transform: translateX(-50%);
		width: calc(100% - 40px);
		max-width: calc(var(--v2-max) - 40px); /* 컬럼 폭 - 좌우 패딩 */
		z-index: 10;
	}

	.primary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 52px;
		border: 0;
		border-radius: 14px;
		background: var(--v2-ink);
		color: var(--v2-bg);
		font: inherit;
		font-size: 16px;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.primary:active {
		opacity: 0.85;
	}
	.primary:focus-visible {
		outline: 3px solid var(--v2-border);
		outline-offset: 2px;
	}
	.reply .primary {
		color: var(--v2-bg);
	}
	/* 보조 버튼: 주 CTA(내 답 남기기)와 구분되는 옅은 회색 */
	.secondary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 52px;
		margin-top: 10px;
		border-radius: 14px;
		background: var(--v2-surface);
		color: var(--v2-ink);
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	.secondary:active {
		opacity: 0.85;
	}
	.secondary:focus-visible {
		outline: 3px solid var(--v2-border);
		outline-offset: 2px;
	}

	/* 본문 */
	.prose {
		margin-top: 32px;
		padding-top: 28px;
		border-top: 1px solid var(--v2-line);
		font-size: 17px;
		line-height: 1.85;
	}
	.prose :global(p) {
		margin: 0 0 18px;
	}
	.prose :global(h2) {
		margin: 32px 0 12px;
		font-size: 19px;
		font-weight: 700;
		letter-spacing: -0.3px;
	}
	.prose :global(ul) {
		margin: 0 0 18px;
		padding-left: 20px;
		list-style: disc;
	}
	.prose :global(li) {
		margin-bottom: 6px;
	}
	.prose :global(a) {
		color: var(--v2-accent-text);
		text-underline-offset: 3px;
	}
	.prose :global(.table-wrap) {
		margin: 0 -20px 18px;
		padding: 0 20px;
		overflow-x: auto;
	}
	.prose :global(table) {
		min-width: 460px;
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
		line-height: 1.6;
	}
	.prose :global(th),
	.prose :global(td) {
		padding: 10px 12px;
		border-bottom: 1px solid var(--v2-line);
		text-align: left;
		vertical-align: top;
	}
	.prose :global(th) {
		font-weight: 700;
		background: var(--v2-surface);
	}

	/* 본문 - 마크다운이 만드는 나머지 요소 */
	.prose {
		overflow-wrap: anywhere; /* 긴 URL·토큰이 화면 밖으로 밀어내지 않게 */
	}
	.prose :global(h3) {
		margin: 24px 0 8px;
		font-size: 17px;
		font-weight: 700;
	}
	.prose :global(ol) {
		margin: 0 0 18px;
		padding-left: 22px;
		list-style: decimal;
	}
	.prose :global(blockquote) {
		margin: 0 0 18px;
		padding: 2px 0 2px 16px;
		border-left: 3px solid var(--v2-border);
		color: var(--v2-sub);
	}
	.prose :global(blockquote > :last-child) {
		margin-bottom: 0;
	}
	.prose :global(hr) {
		margin: 28px 0;
		border: 0;
		border-top: 1px solid var(--v2-line);
	}
	.prose :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0 0 18px;
		border-radius: 12px;
	}
	.prose :global(code) {
		padding: 2px 6px;
		border-radius: 6px;
		background: var(--v2-surface);
		font-family: var(--v2-mono);
		font-size: 0.88em;
	}
	.prose :global(pre) {
		margin: 0 0 18px;
		padding: 14px 16px;
		overflow-x: auto; /* 폰에서 긴 줄은 가로 스크롤 */
		border-radius: 12px;
		background: var(--v2-surface);
		font-size: 13px;
		line-height: 1.7;
		word-break: normal;
		overflow-wrap: normal;
		-webkit-overflow-scrolling: touch;
	}
	.prose :global(pre code) {
		padding: 0;
		background: none;
		font-size: inherit;
	}

	/* 코드 하이라이트 - 색은 v2 토큰만 쓴다(녹색/주황을 은근히) */
	.prose :global(.hljs-comment),
	.prose :global(.hljs-quote),
	.prose :global(.hljs-meta) {
		color: var(--v2-mute);
		font-style: italic;
	}
	.prose :global(.hljs-keyword),
	.prose :global(.hljs-selector-tag),
	.prose :global(.hljs-doctag) {
		color: var(--v2-accent-text);
		font-weight: 600;
	}
	.prose :global(.hljs-string),
	.prose :global(.hljs-regexp),
	.prose :global(.hljs-number),
	.prose :global(.hljs-literal),
	.prose :global(.hljs-symbol),
	.prose :global(.hljs-bullet) {
		color: var(--v2-warm-text);
	}
	.prose :global(.hljs-title),
	.prose :global(.hljs-section),
	.prose :global(.hljs-built_in) {
		color: var(--v2-ink);
		font-weight: 600;
	}
	.prose :global(.hljs-attr),
	.prose :global(.hljs-attribute),
	.prose :global(.hljs-name),
	.prose :global(.hljs-type),
	.prose :global(.hljs-variable),
	.prose :global(.hljs-params) {
		color: var(--v2-sub);
	}

	/* 커뮤니티 노트 */
	.notes {
		margin-top: 12px;
		padding: 20px;
		border-radius: 16px;
		background: var(--v2-surface);
	}
	.notes h2 {
		margin: 0;
		font-size: 16px;
		font-weight: 700;
	}
	.notes-sub {
		margin: 4px 0 12px;
		font-size: 12px;
		color: var(--v2-mute);
	}
	.notes-body :global(p) {
		margin: 0;
		font-size: 15px;
		line-height: 1.75;
		color: var(--v2-sub);
	}

	/* 답변 유도 */
	.reply {
		margin-top: 32px;
	}
	.reply h2 {
		margin: 0 0 6px;
		font-size: 18px;
		font-weight: 700;
	}
	.reply p {
		margin: 0 0 16px;
		font-size: 14px;
		color: var(--v2-sub);
	}

	/* 완료 */
	.complete {
		margin-top: 40px;
		padding: 32px 0 8px;
		border-top: 1px solid var(--v2-line);
		text-align: center;
	}
	.complete-title {
		margin: 0;
		font-size: 18px;
		font-weight: 700;
	}
	.complete-sub {
		margin: 6px 0 20px;
		font-size: 14px;
		color: var(--v2-mute);
	}
	.week {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.day {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.cell {
		width: 28px;
		height: 28px;
		border-radius: 7px;
		background: var(--v2-surface);
	}
	.day.is-done .cell {
		background: var(--v2-accent);
	}
	.day.is-missed .cell {
		background: var(--v2-line);
	}
	.day-label {
		font-size: 11px;
		color: var(--v2-mute);
	}
</style>
