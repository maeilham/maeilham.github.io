<script lang="ts">
	import { week, type Item } from '$lib/v2/mock';

	let { item, isToday = false }: { item: Item; isToday?: boolean } = $props();

	let revealed = $state(false);
	const open = $derived(revealed || item.read);
</script>

<article class="reader">
	<header class="head">
		{#if !isToday}
			<a class="back" href="/v2/archive">← 지난 질문</a>
		{/if}
		<p class="meta">
			<span>{isToday ? '오늘의 질문' : item.dateLabel}</span>
			<span class="dot" aria-hidden="true">·</span>
			<span class="mono">#{item.no}</span>
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
			{@html item.body}
		</section>

		{#if item.notes}
			<section class="notes" aria-labelledby="notes-title">
				<h2 id="notes-title">커뮤니티 학습 노트</h2>
				<p class="notes-sub">댓글 {item.comments}개를 AI가 읽고 정리했어요</p>
				<div class="notes-body">{@html item.notes}</div>
			</section>
		{/if}

		<section class="reply">
			<h2>내 생각은 어땠나요?</h2>
			<p>{item.comments}명이 답을 남겼어요. 나의 답도 한 줄 남겨보세요.</p>
			<a class="primary" href={item.discussionUrl} target="_blank" rel="noreferrer">
				내 답 남기기
			</a>
		</section>

		{#if isToday}
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
		color: var(--v2-accent);
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
		max-width: 440px;
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
		background: var(--v2-accent);
		color: var(--v2-accent-ink);
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
		outline: 3px solid var(--v2-accent-soft);
		outline-offset: 2px;
	}
	.reply .primary {
		color: var(--v2-accent-ink);
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
		color: var(--v2-accent);
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
