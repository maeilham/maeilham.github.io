<script lang="ts">
	const API = import.meta.env.VITE_API_URL ?? "";

	type Phase = "idle" | "writing" | "dragging" | "inserting" | "sent" | "error";
	let phase = $state<Phase>("idle");
	let email = $state("");
	let errorMsg = $state("");
	let overSlot = $state(false);

	const CARD_W = 360;
	const ENV_W  = 80;
	const ENV_H  = 62;

	let dragX = $state(0);
	let dragY = $state(0);
	let snapBack = $state(false);
	let grabOffsetX = 0;
	let grabOffsetY = 0;

	let isDragging = $derived(phase === "dragging" || phase === "inserting");

	let letterCardEl: HTMLElement | null = null;
	let dropBoxEl: HTMLElement | null = null;

	const LETTER_BOX = 7;   // 1행 7열 = 오른쪽 상단 (편지 출처)
	const DROP_BOX   = 10;  // 2행 3열
	const DISPLAY_POS = 9;
	const SKIP_POS = 16;

	type Item = number | "display" | "letter" | "drop";
	const items: Item[] = [];
	for (let i = 1; i <= 35; i++) {
		if (i === SKIP_POS) continue;
		if (i === DISPLAY_POS) { items.push("display"); continue; }
		if (i === LETTER_BOX)  { items.push("letter");  continue; }
		if (i === DROP_BOX)    { items.push("drop");    continue; }
		items.push(i);
	}

	function openCard() {
		dragX = window.innerWidth / 2 - CARD_W / 2;
		dragY = window.innerHeight / 2 - 160;
		errorMsg = "";
		snapBack = false;
		phase = "writing";
	}

	function startDrag(e: MouseEvent) {
		if (phase === "inserting" || phase === "sent") return;
		e.preventDefault();
		if (!letterCardEl) return;
		// 봉투 크기로 전환, 커서가 봉투 중앙에 오도록
		grabOffsetX = ENV_W / 2;
		grabOffsetY = ENV_H / 2;
		dragX = e.clientX - ENV_W / 2;
		dragY = e.clientY - ENV_H / 2;
		snapBack = false;
		phase = "dragging";
	}

	function onMouseMove(e: MouseEvent) {
		if (phase !== "dragging") return;
		dragX = e.clientX - grabOffsetX;
		dragY = e.clientY - grabOffsetY;

		if (dropBoxEl) {
			const r = dropBoxEl.getBoundingClientRect();
			overSlot = e.clientX >= r.left - 24 && e.clientX <= r.right + 24
				&& e.clientY >= r.top - 24 && e.clientY <= r.bottom + 24;
		}
	}

	async function onMouseUp() {
		if (phase !== "dragging") return;

		if (overSlot) {
			if (!email) {
				errorMsg = "이메일을 입력해주세요.";
				doSnapBack();
				return;
			}
			await doInsert();
		} else {
			doSnapBack();
		}
		overSlot = false;
	}

	function doSnapBack() {
		snapBack = true;
		dragX = window.innerWidth / 2 - CARD_W / 2;
		dragY = window.innerHeight / 2 - 160;
		phase = "writing";
		setTimeout(() => { snapBack = false; }, 500);
	}

	async function doInsert() {
		if (!dropBoxEl) return;
		const r = dropBoxEl.getBoundingClientRect();
		dragX = r.left + r.width / 2 - ENV_W / 2;
		dragY = r.top + r.height / 2 - ENV_H / 2;
		phase = "inserting";
		overSlot = false;

		const [res] = await Promise.all([
			fetch(`${API}/api/subscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			}).catch(() => null),
			new Promise(r => setTimeout(r, 750)),
		]);

		if (!res) {
			errorMsg = "네트워크 오류가 발생했습니다.";
			phase = "error";
			doSnapBack();
			return;
		}
		if (res.ok) {
			phase = "sent";
		} else {
			const data = await res.json().catch(() => ({}));
			errorMsg = data.error ?? "오류가 발생했습니다.";
			phase = "error";
			doSnapBack();
		}
	}

	let cardStyle = $derived((() => {
		if (phase === "writing") {
			const base = `position:fixed;left:${dragX}px;top:${dragY}px;width:${CARD_W}px;`;
			return base + (snapBack
				? "transition:left 0.45s cubic-bezier(0.34,1.3,0.64,1),top 0.45s cubic-bezier(0.34,1.3,0.64,1);"
				: "");
		}
		if (phase === "dragging") {
			return `position:fixed;left:${dragX}px;top:${dragY}px;width:${ENV_W}px;height:${ENV_H}px;cursor:grabbing;transform:rotate(3deg);`;
		}
		if (phase === "inserting") {
			return `position:fixed;left:${dragX}px;top:${dragY}px;width:${ENV_W}px;height:${ENV_H}px;transform:scale(0.04) rotate(5deg);opacity:0;transition:transform 0.6s cubic-bezier(0.6,0,1,0.5),opacity 0.35s 0.2s,left 0.6s cubic-bezier(0.6,0,1,0.5),top 0.6s cubic-bezier(0.6,0,1,0.5);`;
		}
		return `position:fixed;left:${dragX}px;top:${dragY}px;width:${CARD_W}px;`;
	})());
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

<svelte:head>
	<title>매일함</title>
</svelte:head>

<div class="wall">
	<div class="title-bar">
		<span class="title-icon">✉</span>
		<span class="title-text">SMART POST BOX</span>
	</div>

	<div class="locker-grid">
		{#each items as item}

			{#if item === "display"}
				<div class="box display-box">
					<div class="display-screen">
						<p class="display-label">매일함</p>
						<p class="display-sub">매일함으로, 매일 함.</p>
						<div class="display-dot"></div>
					</div>
				</div>

			{:else if item === "letter"}
				<div class="box letter-box">
					{#if phase !== "sent"}
						<button class="letter-peek" onclick={openCard} aria-label="편지 열기">
							<div class="envelope-flap"></div>
							<div class="envelope-body">
								<span class="envelope-label">매일함</span>
							</div>
						</button>
					{:else}
						<div class="letter-peek sent-peek">
							<div class="envelope-flap flap-closed"></div>
							<div class="envelope-body">
								<span class="envelope-label">✓</span>
							</div>
						</div>
					{/if}
					<div class="slot"></div>
					<div class="lock"></div>
				</div>

			{:else if item === "drop"}
				<div
					class="box drop-box"
					class:drop-ready={overSlot && isDragging}
					class:drop-calling={isDragging && !overSlot}
					bind:this={dropBoxEl}
				>
					<span class="drop-corner-label">이메일 넣는 곳</span>
					<div class="slot" class:slot-active={overSlot && isDragging}></div>
					<div class="lock"></div>
				</div>

			{:else}
				<div class="box">
					<div class="slot"></div>
					<div class="lock"></div>
				</div>
			{/if}

		{/each}
	</div>

	{#if phase === "sent"}
		<p class="sent-notice">✉ 확인 메일을 보냈습니다 — 메일함을 확인해주세요</p>
	{/if}
</div>

<!-- 드래그 가능한 편지 카드 -->
{#if phase !== "idle" && phase !== "sent"}
<div
	class="letter-card"
	class:is-over={overSlot && isDragging}
	style={cardStyle}
	bind:this={letterCardEl}
	onmousedown={startDrag}
>
	{#if isDragging}
		<!-- 드래그 중: 미니 봉투 모양 -->
		<div class="mini-env-flap"></div>
		<div class="mini-env-body">
			<span class="mini-env-label">매일함</span>
		</div>
	{:else}
		<!-- 편지 작성 상태 -->
		<div class="lc-top">
			<div class="lc-header">
				<span class="lc-to">To. 매일함</span>
				<span class="lc-date">{new Date().toLocaleDateString("ko-KR", { year:"numeric", month:"long", day:"numeric" })}</span>
				<button
					class="lc-close"
					onmousedown={(e) => e.stopPropagation()}
					onclick={() => phase = "idle"}
				>✕</button>
			</div>
			<p class="lc-body">
				매일 아침, 오늘의 질문을 받겠습니다.<br />
				GitHub Discussion에서 함께 답을 만들어가겠습니다.
			</p>
		</div>

		<div class="lc-inputs" onmousedown={(e) => e.stopPropagation()}>
			<span class="lc-from-label">From.</span>
			<input
				type="email"
				bind:value={email}
				placeholder="이메일 주소를 적어주세요"
				class="lc-input"
			/>
			{#if errorMsg}
				<p class="lc-error">{errorMsg}</p>
			{/if}
		</div>

		<div class="lc-hint">
			<span class="lc-hint-text">잡아서 반짝이는 칸에 넣어주세요</span>
			<span class="lc-hint-arrow">✦</span>
		</div>
	{/if}
</div>
{/if}

<style>
	.wall {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #d0d0d0;
		padding: 32px 16px;
	}

	.title-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		max-width: 800px;
		padding: 8px 16px;
		background: #c0c0c0;
		border: 1px solid #aaa;
		border-bottom: none;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
	}
	.title-icon { font-size: 0.75rem; color: #666; }
	.title-text {
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		color: #666;
		font-family: 'DM Sans', sans-serif;
		font-weight: 500;
	}

	.locker-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 3px;
		padding: 10px;
		background: #b0b0b0;
		border: 2px solid #aaa;
		border-top: none;
		box-shadow: 0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
		width: 100%;
		max-width: 800px;
	}

	.box {
		position: relative;
		height: 72px;
		background: linear-gradient(175deg, #d8d8d8 0%, #c8c8c8 60%, #bfbfbf 100%);
		border: 1px solid #b0b0b0;
		border-top: 1px solid #ddd;
		border-left: 1px solid #d5d5d5;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
		box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), inset 1px 0 0 rgba(255,255,255,0.2);
		transition: box-shadow 0.2s, background 0.2s;
	}

	.display-box {
		grid-row: span 2;
		height: auto;
		background: linear-gradient(160deg, #c8c8c8 0%, #b0b0b0 50%, #a8a8a8 100%);
		border: 2px solid #888;
		box-shadow:
			inset 0 2px 0 rgba(255,255,255,0.5),
			inset 0 -2px 0 rgba(0,0,0,0.15),
			0 0 0 1px #aaa;
		overflow: hidden;
		cursor: default;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.display-screen {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		background: linear-gradient(135deg, #1e2a1e, #111a11);
		box-shadow: inset 0 0 16px rgba(0,0,0,0.9), 0 0 0 1px #333;
	}

	.display-label {
		font-family: 'Noto Sans KR', sans-serif;
		font-weight: 700;
		font-size: 1rem;
		color: #90ee90;
		letter-spacing: 0.08em;
		text-shadow: 0 0 8px rgba(144,238,144,0.6);
	}

	.display-sub {
		font-size: 0.42rem;
		color: #4a8a4a;
		letter-spacing: 0.1em;
		font-family: 'Noto Sans KR', sans-serif;
		font-weight: 700;
		text-align: center;
	}

	.display-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #90ee90;
		box-shadow: 0 0 6px rgba(144,238,144,0.8);
		animation: blink 2s ease-in-out infinite;
	}

	.letter-box {
		background: linear-gradient(175deg, #dadadf 0%, #cacacf 60%, #c0c0c8 100%);
	}

	.slot {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 10;
		width: 62%;
		height: 5px;
		background: #555;
		border-radius: 1px;
		box-shadow: inset 0 2px 3px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.2);
		transition: height 0.2s, width 0.2s, box-shadow 0.2s, background 0.2s;
	}

	/* 슬롯 진입 효과 */
	.slot-active {
		height: 9px;
		width: 72%;
		background: #222;
		box-shadow:
			inset 0 3px 6px rgba(0,0,0,0.9),
			0 0 10px rgba(144,238,144,0.7),
			0 0 22px rgba(144,238,144,0.3);
		animation: slot-breathe 0.7s ease-in-out infinite alternate;
	}

	@keyframes slot-breathe {
		from { box-shadow: inset 0 3px 6px rgba(0,0,0,0.9), 0 0 6px rgba(144,238,144,0.5), 0 0 14px rgba(144,238,144,0.2); }
		to   { box-shadow: inset 0 3px 6px rgba(0,0,0,0.9), 0 0 14px rgba(144,238,144,0.9), 0 0 30px rgba(144,238,144,0.4); }
	}

	/* ── 투함구 ── */
	.drop-box {
		transition: box-shadow 0.2s, background 0.2s;
	}

	/* 드래그 중 — 슬롯 쪽으로 유도 */
	.drop-calling {
		animation: drop-pulse 2s ease-in-out infinite;
	}

	@keyframes drop-pulse {
		0%, 100% {
			box-shadow: 0 0 0 1px rgba(144,238,144,0.3), inset 0 0 6px rgba(144,238,144,0.05);
		}
		50% {
			box-shadow: 0 0 0 3px rgba(144,238,144,0.7), inset 0 0 14px rgba(144,238,144,0.15);
			background: linear-gradient(175deg, #d2ddd2 0%, #c2d0c2 60%, #bacabc 100%);
		}
	}

	.drop-ready {
		background: linear-gradient(175deg, #c8d8c8 0%, #b5c8b5 60%, #adc0ad 100%) !important;
		box-shadow:
			0 0 0 2px rgba(144,238,144,0.8),
			inset 0 0 12px rgba(144,238,144,0.15) !important;
		animation: none !important;
	}

	.drop-corner-label {
		position: absolute;
		top: 5px;
		left: 6px;
		font-size: 0.44rem;
		color: #aaa;
		font-family: 'DM Sans', sans-serif;
		font-weight: 500;
		letter-spacing: 0.06em;
		z-index: 2;
		white-space: nowrap;
		text-shadow:
			0 0.7px 0 rgba(255,255,255,0.85),
			0 -0.7px 0 rgba(0,0,0,0.28);
	}

	.lock {
		position: absolute;
		bottom: 6px;
		right: 7px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #ccc, #888);
		border: 1px solid #777;
		box-shadow: 0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
	}

	.letter-peek {
		position: absolute;
		bottom: calc(50% + 1px);
		left: 50%;
		transform: translateX(-48%) rotate(-1deg);
		width: 58%;
		height: 56px;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		z-index: 5;
		transition: bottom 0.25s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.25s;
		filter: drop-shadow(0 -2px 6px rgba(0,0,0,0.25));
	}
	.letter-peek:hover {
		bottom: calc(50% + 10px);
		transform: translateX(-48%) rotate(-1deg) scale(1.03);
		filter: drop-shadow(0 -4px 10px rgba(0,0,0,0.3));
	}
	.sent-peek {
		cursor: default;
		bottom: calc(50% - 6px);
	}
	.sent-peek:hover {
		bottom: calc(50% - 6px);
		transform: translateX(-48%) rotate(-1deg);
	}

	.envelope-flap {
		width: 100%;
		height: 0;
		border-left: 50% solid transparent;
		border-right: 50% solid transparent;
		border-bottom: 18px solid #d4c9ae;
	}
	.flap-closed {
		border-bottom-color: #c8bfae;
	}

	.envelope-body {
		width: 100%;
		height: 38px;
		background: #f0e8d2;
		border: 1px solid #d4c9ae;
		border-top: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.envelope-label {
		font-size: 0.55rem;
		color: #888;
		letter-spacing: 0.1em;
		font-family: 'DM Sans', sans-serif;
	}

	.sent-notice {
		margin-top: 14px;
		font-size: 0.7rem;
		color: #555;
		letter-spacing: 0.05em;
		font-family: 'DM Sans', sans-serif;
		animation: fadeIn 0.5s ease-out;
	}

	/* ── 드래그 편지 카드 ── */
	.letter-card {
		z-index: 100;
		background: #F5EFDF;
		border: 1px solid #d4c9ae;
		box-shadow: 4px 10px 40px rgba(0,0,0,0.28);
		user-select: none;
		cursor: grab;
		overflow: hidden;
		/* 가로 줄 (헤더 아래부터) */
		background-image: repeating-linear-gradient(
			transparent,
			transparent 31px,
			#e4dac5 31px,
			#e4dac5 32px
		);
		background-position: 0 72px;
	}

	/* 드래그 중 봉투 상태 */
	.letter-card.is-over {
		box-shadow: 0 0 0 2px rgba(144,238,144,0.85), 4px 10px 32px rgba(0,0,0,0.3);
	}

	/* 미니 봉투 */
	.mini-env-flap {
		width: 0;
		height: 0;
		border-left: 40px solid transparent;
		border-right: 40px solid transparent;
		border-bottom: 22px solid #d4c9ae;
		position: relative;
		z-index: 2;
		flex-shrink: 0;
	}

	.mini-env-body {
		flex: 1;
		background: #f0e8d2;
		border: 1px solid #d4c9ae;
		border-top: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mini-env-label {
		font-size: 0.5rem;
		color: #999;
		letter-spacing: 0.12em;
		font-family: 'DM Sans', sans-serif;
	}

	/* 미니 봉투 일 때 카드 배경선 제거 */
	.letter-card:has(.mini-env-flap) {
		background-image: none;
		display: flex;
		flex-direction: column;
	}

	.letter-card.is-over {
		box-shadow: 0 0 0 2px rgba(144,238,144,0.8), 4px 10px 40px rgba(0,0,0,0.28);
	}

	.lc-top {
		cursor: grab;
	}

	.lc-header {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 18px 20px 12px;
		border-bottom: 1px solid #d0c5b0;
	}

	.lc-to {
		font-family: 'DM Serif Display', serif;
		font-size: 1.1rem;
		color: #1a1108;
		flex: 1;
	}

	.lc-date {
		font-size: 0.65rem;
		color: #aaa;
		font-family: 'DM Sans', sans-serif;
	}

	.lc-close {
		background: none;
		border: none;
		font-size: 0.8rem;
		color: #bbb;
		cursor: pointer;
		padding: 2px 4px;
		line-height: 1;
	}
	.lc-close:hover { color: #555; }

	.lc-body {
		padding: 14px 20px 10px;
		font-size: 0.82rem;
		line-height: 2;
		color: #3d2b1f;
		font-family: 'DM Sans', sans-serif;
	}

	/* 이메일 입력 영역 */
	.lc-inputs {
		padding: 8px 20px 16px;
		cursor: default;
	}

	.lc-from-label {
		display: block;
		font-size: 0.65rem;
		color: #aaa;
		font-family: 'DM Sans', sans-serif;
		margin-bottom: 6px;
		letter-spacing: 0.08em;
	}

	.lc-input {
		width: 100%;
		padding: 9px 12px;
		font-size: 0.875rem;
		border: 1px solid #c8bfb0;
		background: rgba(255,255,255,0.6);
		font-family: 'DM Sans', sans-serif;
		color: #1a1108;
		outline: none;
		cursor: text;
	}
	.lc-input:focus { border-color: #888; }

	.lc-error {
		font-size: 0.7rem;
		color: #c0392b;
		margin-top: 5px;
		font-family: 'DM Sans', sans-serif;
	}

	/* 드래그 힌트 */
	.lc-hint {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 20px;
		border-top: 1px dashed #ccc;
		cursor: grab;
	}

	.lc-hint-icon {
		font-size: 0.75rem;
		opacity: 0.5;
	}

	.lc-hint-text {
		font-size: 0.62rem;
		color: #bbb;
		font-family: 'DM Sans', sans-serif;
		letter-spacing: 0.06em;
	}

	.lc-hint-arrow {
		font-size: 0.75rem;
		color: #bbb;
		animation: bounce 1.6s ease-in-out infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 0.4; } 50% { opacity: 1; }
	}
	@keyframes fadeIn {
		from { opacity: 0; } to { opacity: 1; }
	}
	@keyframes bounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(5px); }
	}
</style>
