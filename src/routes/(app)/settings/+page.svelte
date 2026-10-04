<script lang="ts">
	// 이 화면은 아직 서버에 연결되지 않은 목 화면이다. 탭(+layout.svelte)에서는 구독자에게 노출되지만
	// 아래 값은 모두 가짜다. 실제 API 연결은 별도 작업이다.
	const email = 'me@example.com';

	let sources = $state([
		{ repo: 'maeilham/backend-ops', name: '백엔드 · 인프라', desc: '서버, 네트워크, 런타임', enabled: true },
		{ repo: 'maeilham/frontend', name: '프론트엔드', desc: '브라우저, 렌더링, 프레임워크', enabled: true },
		{ repo: 'maeilham/cs-basics', name: 'CS 기초', desc: 'OS, 자료구조, 네트워크 기본기', enabled: false }
	]);
	let confirming = $state(false);
	let unsubscribed = $state(false);

	const enabledCount = $derived(sources.filter((s) => s.enabled).length);
</script>

<svelte:head>
	<title>설정 · 매일함</title>
</svelte:head>

<header class="head">
	<h1>설정</h1>
	<p class="email">{email}</p>
</header>

{#if unsubscribed}
	<div class="notice" role="status">
		<p class="notice-title">구독이 해지됐어요</p>
		<p class="notice-sub">그동안 함께해서 고마웠어요. 언제든 다시 구독할 수 있어요.</p>
		<a href="/">처음으로</a>
	</div>
{:else}
	<section class="block" aria-labelledby="src-title">
		<h2 id="src-title">받아볼 분야</h2>
		<p class="hint">
			{enabledCount}개 선택됨 · 여러 분야를 골라도 메일은 하루 한 통으로 묶여서 와요.
		</p>
		<ul class="sources">
			{#each sources as s (s.repo)}
				<li class="source">
					<div class="source-text">
						<p class="source-name">{s.name}</p>
						<p class="source-desc">{s.desc}</p>
					</div>
					<button
						class="switch"
						class:on={s.enabled}
						role="switch"
						aria-checked={s.enabled}
						aria-label="{s.name} 받기"
						onclick={() => (s.enabled = !s.enabled)}
					>
						<span class="knob"></span>
					</button>
				</li>
			{/each}
		</ul>
	</section>

	<section class="block danger">
		{#if confirming}
			<p class="confirm-text">정말 구독을 해지할까요?</p>
			<div class="confirm-actions">
				<button class="ghost" onclick={() => (confirming = false)}>취소</button>
				<button class="warn" onclick={() => (unsubscribed = true)}>해지하기</button>
			</div>
		{:else}
			<button class="link-danger" onclick={() => (confirming = true)}>구독 해지</button>
		{/if}
	</section>
{/if}

<style>
	.head {
		padding: 28px 0 24px;
	}
	.head h1 {
		margin: 0 0 6px;
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.5px;
	}
	.email {
		margin: 0;
		font-size: 14px;
		color: var(--mute);
	}

	.block {
		padding: 8px 0 24px;
	}
	.block h2 {
		margin: 0 0 4px;
		font-size: 17px;
		font-weight: 700;
	}
	.hint {
		margin: 0 0 8px;
		font-size: 13px;
		line-height: 1.6;
		color: var(--mute);
	}

	.sources {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.source {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 0;
		border-bottom: 1px solid var(--line);
	}
	.source-name {
		margin: 0 0 2px;
		font-size: 16px;
		font-weight: 600;
	}
	.source-desc {
		margin: 0;
		font-size: 13px;
		color: var(--mute);
	}

	.switch {
		position: relative;
		flex: none;
		width: 51px;
		height: 31px;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--border);
		cursor: pointer;
		transition: background 0.15s;
		-webkit-tap-highlight-color: transparent;
	}
	.switch.on {
		background: var(--ink);
	}
	.knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 27px;
		height: 27px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
		transition: transform 0.15s;
	}
	.switch.on .knob {
		transform: translateX(20px);
	}

	.danger {
		padding-top: 24px;
	}
	.link-danger {
		padding: 8px 0;
		border: 0;
		background: none;
		color: var(--mute);
		font: inherit;
		font-size: 14px;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
	.confirm-text {
		margin: 0 0 12px;
		font-size: 15px;
		font-weight: 600;
	}
	.confirm-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.confirm-actions button {
		height: 48px;
		border: 0;
		border-radius: 12px;
		font: inherit;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
	}
	.ghost {
		background: var(--surface);
		color: var(--ink);
	}
	.warn {
		background: #f04452;
		color: #fff;
	}

	.notice {
		padding: 32px 20px;
		border-radius: 16px;
		background: var(--surface);
		text-align: center;
	}
	.notice-title {
		margin: 0 0 6px;
		font-size: 18px;
		font-weight: 700;
	}
	.notice-sub {
		margin: 0 0 16px;
		font-size: 14px;
		color: var(--sub);
	}
	.notice a {
		color: var(--accent-text);
		font-weight: 600;
	}
</style>
