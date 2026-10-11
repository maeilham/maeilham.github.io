<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		ApiError,
		fetchMe,
		getSubscriptions,
		rotateLink,
		setSubscription,
		unsubscribeMe,
		type RepoSubscription
	} from '$lib/api';
	import { auth, endSession, getAccessToken } from '$lib/auth.svelte';
	import { showError } from '$lib/toast.svelte';

	let email = $state('');
	let sources = $state<RepoSubscription[]>([]);
	let loadState = $state<'loading' | 'ready' | 'error'>('loading');
	// 행마다의 저장 표시. 응답이 느릴 때만 스피너('saving')를 보여주고, 성공하면 체크('saved')를 잠깐
	// 보여준 뒤 지운다. 실패하면 바로 비우고 오류 토스트로 알린다. 표시가 없어도 요청은 진행 중일 수
	// 있어서(스피너를 늦게 띄우므로) 중복 요청 방지는 inflight로 따로 본다.
	let rowState = $state<Record<string, 'saving' | 'saved'>>({});
	let inflight = $state<Record<string, boolean>>({});
	const timers: Record<string, ReturnType<typeof setTimeout>> = {};
	let confirming = $state(false);
	let unsubscribing = $state(false);
	let unsubscribed = $state(false);
	let confirmingRotate = $state(false);
	let rotating = $state(false);
	let rotated = $state(false);

	const SPINNER_DELAY_MS = 300; // 이보다 빨리 끝나면 스피너 없이 곧바로 체크
	const SPINNER_MIN_MS = 400; // 스피너가 나타났으면 최소 이만큼은 보여준다(번쩍임 방지)
	const SAVED_VISIBLE_MS = 1200;
	const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
		if (auth.status !== 'subscriber' || unsubscribed || rotated) return;
		const token = getAccessToken();
		if (!token) return;
		const ctrl = new AbortController();
		load(token, ctrl.signal);
		return () => ctrl.abort();
	});

	// 화면을 먼저 바꾸고 서버에 보낸다. 실패하면 되돌리고 안내한다.
	async function toggle(s: RepoSubscription) {
		const token = getAccessToken();
		if (!token || inflight[s.repo]) return;
		const next = !s.enabled;
		s.enabled = next;
		inflight[s.repo] = true;
		clearTimeout(timers[s.repo]);
		delete rowState[s.repo];

		let spinnerShownAt = 0;
		timers[s.repo] = setTimeout(() => {
			spinnerShownAt = Date.now();
			rowState[s.repo] = 'saving';
		}, SPINNER_DELAY_MS);

		try {
			await setSubscription(token, s.repo, next);
			clearTimeout(timers[s.repo]);
			if (spinnerShownAt) {
				const remain = SPINNER_MIN_MS - (Date.now() - spinnerShownAt);
				if (remain > 0) await wait(remain);
			}
			rowState[s.repo] = 'saved';
			timers[s.repo] = setTimeout(() => delete rowState[s.repo], SAVED_VISIBLE_MS);
		} catch (err) {
			clearTimeout(timers[s.repo]);
			s.enabled = !next;
			delete rowState[s.repo];
			if (!handleAuthError(err)) showError('변경하지 못했어요. 다시 시도해 주세요.');
		} finally {
			delete inflight[s.repo];
		}
	}

	onDestroy(() => Object.values(timers).forEach(clearTimeout));

	// 확인 단계는 한 번에 하나만 열어 둔다.
	function openRotateConfirm() {
		confirmingRotate = true;
		confirming = false;
	}
	function openUnsubscribeConfirm() {
		confirming = true;
		confirmingRotate = false;
	}

	// 새 링크는 메일로만 간다. 성공하면 지금 토큰은 이미 무효라서 이 기기도 로그아웃하고 안내만 보여준다.
	async function rotate() {
		const token = getAccessToken();
		if (!token || rotating) return;
		rotating = true;
		try {
			await rotateLink(token);
			rotated = true;
			endSession();
		} catch (err) {
			if (!handleAuthError(err)) showError('새 링크를 보내지 못했어요. 다시 시도해 주세요.');
		} finally {
			rotating = false;
		}
	}

	async function unsubscribe() {
		const token = getAccessToken();
		if (!token || unsubscribing) return;
		unsubscribing = true;
		try {
			await unsubscribeMe(token);
			unsubscribed = true;
			endSession();
		} catch (err) {
			if (!handleAuthError(err)) showError('해지하지 못했어요. 다시 시도해 주세요.');
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
{:else if rotated}
	<div class="notice" role="status">
		<p class="notice-title">새 링크를 메일로 보냈어요</p>
		<p class="notice-sub">
			메일의 새 링크로 다시 들어와 주세요. 북마크와 홈 화면 바로가기도 새 링크로 바꿔 주세요.
		</p>
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
						<div class="controls">
							<!-- 상태 표시 자리를 항상 잡아둬서 나타나도 레이아웃이 밀리지 않는다 -->
							<span class="status" aria-hidden="true">
								{#if rowState[s.repo] === 'saving'}
									<svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
										<circle cx="12" cy="12" r="9" opacity="0.25" />
										<path d="M21 12a9 9 0 0 0-9-9" />
									</svg>
								{:else if rowState[s.repo] === 'saved'}
									<svg class="saved" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M5 12.5l4.5 4.5L19 7.5" />
									</svg>
								{/if}
							</span>
							<!-- 아이콘은 스크린리더에 안 읽히므로 같은 내용을 글로 알린다 -->
							<span class="sr-only" role="status">
								{rowState[s.repo] === 'saving' ? '저장 중' : rowState[s.repo] === 'saved' ? '저장됐어요' : ''}
							</span>
							<button
								class="switch"
								class:on={s.enabled}
								role="switch"
								aria-checked={s.enabled}
								aria-label="{s.name} 받기"
								disabled={inflight[s.repo]}
								onclick={() => toggle(s)}
							>
								<span class="knob"></span>
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="block" aria-labelledby="link-title">
		<h2 id="link-title">나만의 링크</h2>
		<p class="hint">나만의 링크가 다른 사람에게 알려졌다면 새로 받을 수 있어요. 새 링크는 가입한 메일로 보내드려요.</p>
		{#if confirmingRotate}
			<p class="confirm-text">나만의 링크를 새로 받을까요?</p>
			<p class="hint">
				이 기기와 다른 기기의 북마크, 홈 화면 바로가기가 모두 끊겨요. 메일로 받은 새 링크로 다시 들어와야 해요.
			</p>
			<div class="confirm-actions">
				<button class="ghost" onclick={() => (confirmingRotate = false)} disabled={rotating}>취소</button>
				<button class="solid" onclick={rotate} disabled={rotating}>
					{rotating ? '보내는 중…' : '새로 받기'}
				</button>
			</div>
		{:else}
			<button class="rotate-btn" onclick={openRotateConfirm}>나만의 링크 새로 받기</button>
		{/if}
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
			<button class="link-danger" onclick={openUnsubscribeConfirm}>구독 해지</button>
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

	.controls {
		display: flex;
		flex: none;
		align-items: center;
		gap: 12px;
	}
	.status {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		color: var(--mute);
	}
	.status .saved {
		color: var(--accent-text);
		animation: appear 150ms ease-out;
	}
	.spinner {
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes appear {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	/* 모션 줄이기: 회전 대신 천천히 깜빡인다 */
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: pulse 1.2s ease-in-out infinite;
		}
		.status .saved {
			animation: none;
		}
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
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
	.rotate-btn {
		width: 100%;
		height: 48px;
		margin-top: 4px;
		border: 0;
		border-radius: 12px;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}
	.solid {
		background: var(--ink);
		color: var(--bg);
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
	.switch:disabled,
	.confirm-actions button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
