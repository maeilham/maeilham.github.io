<script lang="ts">
	import {
		ApiError,
		fetchMe,
		getSubscriptions,
		setSubscription,
		unsubscribeMe,
		type RepoSubscription
	} from '$lib/api';
	import { auth, endSession, getAccessToken } from '$lib/auth.svelte';

	let email = $state('');
	let sources = $state<RepoSubscription[]>([]);
	let loadState = $state<'loading' | 'ready' | 'error'>('loading');
	let pending = $state<Record<string, boolean>>({});
	let actionError = $state<string | null>(null);
	let confirming = $state(false);
	let unsubscribing = $state(false);
	let unsubscribed = $state(false);

	const enabledCount = $derived(sources.filter((s) => s.enabled).length);

	// 서버가 401이면 링크가 무효하다는 뜻이다. 토큰을 버리면 아래에서 방문자 안내로 바뀐다.
	function handleAuthError(err: unknown): boolean {
		if (err instanceof ApiError && err.status === 401) {
			endSession();
			return true;
		}
		return false;
	}

	async function load(token: string, signal: AbortSignal) {
		loadState = 'loading';
		try {
			const [me, list] = await Promise.all([fetchMe(token, signal), getSubscriptions(token, signal)]);
			email = me.email;
			sources = list;
			loadState = 'ready';
		} catch (err) {
			if (signal.aborted) return;
			if (handleAuthError(err)) return;
			loadState = 'error';
		}
	}

	// 구독자로 확인된 뒤에 불러온다. 판정 전('unknown')에는 기다리고, 방문자면 불러오지 않는다.
	$effect(() => {
		if (auth.status !== 'subscriber' || unsubscribed) return;
		const token = getAccessToken();
		if (!token) return;
		const ctrl = new AbortController();
		load(token, ctrl.signal);
		return () => ctrl.abort();
	});

	// 화면을 먼저 바꾸고 서버에 보낸다. 실패하면 되돌리고 안내한다.
	async function toggle(s: RepoSubscription) {
		const token = getAccessToken();
		if (!token || pending[s.repo]) return;
		const next = !s.enabled;
		s.enabled = next;
		pending[s.repo] = true;
		actionError = null;
		try {
			await setSubscription(token, s.repo, next);
		} catch (err) {
			s.enabled = !next;
			if (!handleAuthError(err)) actionError = '변경하지 못했어요. 잠시 뒤에 다시 시도해 주세요.';
		} finally {
			pending[s.repo] = false;
		}
	}

	async function unsubscribe() {
		const token = getAccessToken();
		if (!token || unsubscribing) return;
		unsubscribing = true;
		actionError = null;
		try {
			await unsubscribeMe(token);
			unsubscribed = true;
			endSession();
		} catch (err) {
			if (!handleAuthError(err)) actionError = '해지하지 못했어요. 잠시 뒤에 다시 시도해 주세요.';
		} finally {
			unsubscribing = false;
		}
	}
</script>

<svelte:head>
	<title>설정 · 매일함</title>
</svelte:head>

<header class="head">
	<h1>설정</h1>
	{#if email}<p class="email">{email}</p>{/if}
</header>

{#if unsubscribed}
	<div class="notice" role="status">
		<p class="notice-title">구독이 해지됐어요</p>
		<p class="notice-sub">그동안 함께해서 고마웠어요. 언제든 다시 구독할 수 있어요.</p>
		<a href="/">처음으로</a>
	</div>
{:else if auth.status === 'visitor'}
	<div class="notice" role="status">
		<p class="notice-title">메일의 개인 링크로 들어와 주세요</p>
		<p class="notice-sub">구독 중인 분만 설정을 바꿀 수 있어요.</p>
		<a href="/subscribe">구독하기</a>
	</div>
{:else if loadState === 'error'}
	<div class="notice" role="alert">
		<p class="notice-title">설정을 불러오지 못했어요</p>
		<p class="notice-sub">잠시 뒤에 다시 시도해 주세요.</p>
		<button class="retry" onclick={() => location.reload()}>다시 시도</button>
	</div>
{:else if auth.status === 'unknown' || loadState === 'loading'}
	<p class="state" role="status">불러오는 중…</p>
{:else}
	<section class="block" aria-labelledby="src-title">
		<h2 id="src-title">받아볼 분야</h2>
		{#if sources.length === 0}
			<p class="hint">아직 받아볼 수 있는 분야가 없어요.</p>
		{:else}
			<p class="hint">
				{enabledCount}개 선택됨 · 여러 분야를 골라도 메일은 하루 한 통으로 묶여서 와요.
			</p>
			<ul class="sources">
				{#each sources as s (s.repo)}
					<li class="source">
						<div class="source-text">
							<p class="source-name">{s.name}</p>
							{#if s.description}<p class="source-desc">{s.description}</p>{/if}
						</div>
						<button
							class="switch"
							class:on={s.enabled}
							role="switch"
							aria-checked={s.enabled}
							aria-label="{s.name} 받기"
							disabled={pending[s.repo]}
							onclick={() => toggle(s)}
						>
							<span class="knob"></span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		{#if actionError}<p class="error" role="alert">{actionError}</p>{/if}
	</section>

	<section class="block danger">
		{#if confirming}
			<p class="confirm-text">정말 구독을 해지할까요?</p>
			<div class="confirm-actions">
				<button class="ghost" onclick={() => (confirming = false)} disabled={unsubscribing}>취소</button>
				<button class="warn" onclick={unsubscribe} disabled={unsubscribing}>
					{unsubscribing ? '해지하는 중…' : '해지하기'}
				</button>
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
	.retry {
		padding: 8px 16px;
		border: 0;
		border-radius: 10px;
		background: var(--ink);
		color: var(--bg);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}

	.state {
		margin: 0;
		padding: 32px 0;
		font-size: 14px;
		color: var(--mute);
		text-align: center;
	}
	.error {
		margin: 12px 0 0;
		font-size: 13px;
		color: #f04452;
	}
	.switch:disabled,
	.confirm-actions button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
