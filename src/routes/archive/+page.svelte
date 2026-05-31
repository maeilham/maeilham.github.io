<script lang="ts">
	type Letter = {
		id: number;
		date: string;
		tag: string;
		question: string;
		preview: string;
	};

	const letters: Letter[] = [
		{
			id: 1,
			date: "2026년 5월 31일",
			tag: "백엔드",
			question: "인덱스(Index)란 무엇이고, 언제 사용하면 좋을까요?",
			preview: "DB 인덱스는 데이터 검색 속도를 높이기 위해 별도로 관리하는 자료구조입니다. B-Tree 구조로 O(log n) 탐색을 지원합니다.",
		},
		{
			id: 2,
			date: "2026년 5월 30일",
			tag: "프론트엔드",
			question: "브라우저의 렌더링 과정을 설명해주세요.",
			preview: "브라우저는 HTML을 파싱해 DOM을, CSS를 파싱해 CSSOM을 생성하고, 이를 합쳐 렌더 트리를 만든 후 레이아웃과 페인팅을 수행합니다.",
		},
		{
			id: 3,
			date: "2026년 5월 29일",
			tag: "공통",
			question: "RESTful API 설계 원칙에 대해 설명해주세요.",
			preview: "REST는 자원(Resource), 행위(HTTP Method), 표현(Representation)으로 구성됩니다. 무상태성, 캐시 가능성, 일관된 인터페이스가 핵심입니다.",
		},
		{
			id: 4,
			date: "2026년 5월 28일",
			tag: "백엔드",
			question: "트랜잭션의 ACID 속성에 대해 설명해주세요.",
			preview: "ACID는 원자성(Atomicity), 일관성(Consistency), 격리성(Isolation), 지속성(Durability)의 약자로 데이터베이스 트랜잭션의 안정성을 보장합니다.",
		},
		{
			id: 5,
			date: "2026년 5월 27일",
			tag: "프론트엔드",
			question: "이벤트 버블링과 캡처링의 차이는 무엇인가요?",
			preview: "버블링은 이벤트가 자식에서 부모 방향으로 전파되는 것이고, 캡처링은 그 반대입니다. addEventListener의 세 번째 인자로 제어할 수 있습니다.",
		},
		{
			id: 6,
			date: "2026년 5월 26일",
			tag: "공통",
			question: "객체지향 프로그래밍의 4가지 특징을 설명해주세요.",
			preview: "캡슐화, 상속, 다형성, 추상화가 핵심입니다. 각 개념이 코드 재사용성과 유지보수성에 어떤 영향을 미치는지 함께 설명해보세요.",
		},
	];

	let fanned = $state(false);
	let opened = $state<Letter | null>(null);

	function toggleFan() {
		if (opened) return;
		fanned = !fanned;
	}

	function openLetter(letter: Letter) {
		opened = letter;
	}

	function closeLetter() {
		opened = null;
	}

	// 카드 fan-out 위치 계산
	function cardStyle(i: number, total: number): string {
		if (!fanned) {
			const baseRotate = (i - Math.floor(total / 2)) * 3;
			const baseY = Math.abs(i - Math.floor(total / 2)) * 2;
			return `transform: rotate(${baseRotate}deg) translateY(${baseY}px); z-index: ${i};`;
		}
		// 펼쳐진 상태
		const spread = 140;
		const mid = (total - 1) / 2;
		const x = (i - mid) * spread;
		const rotate = (i - mid) * 8;
		return `transform: translateX(${x}px) rotate(${rotate}deg) translateY(${Math.abs(i - mid) * 10}px); z-index: ${i};`;
	}
</script>

<svelte:head>
	<title>아카이브 — 매일함</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative" style="background:#D9D0C4;">

	<!-- 헤더 -->
	<div class="absolute top-6 left-6">
		<a href="/" class="text-sm" style="color:#666;">← 매일함</a>
	</div>

	<div class="text-center mb-16">
		<h1 class="font-normal text-3xl mb-2" style="font-family:'DM Serif Display',serif;">지난 질문들</h1>
		<p class="text-sm" style="color:#666;">클릭해서 편지를 펼쳐보세요</p>
	</div>

	<!-- 편지 묶음 -->
	<div class="relative flex items-end justify-center" style="height: 280px; width: 100%;">
		{#each letters as letter, i}
			<button
				class="letter-card absolute"
				style={cardStyle(i, letters.length)}
				onclick={() => fanned ? openLetter(letter) : toggleFan()}
				aria-label={letter.question}
			>
				<!-- 봉투 뒷면 플랩 -->
				<div class="flap"></div>
				<!-- 봉투 앞면 -->
				<div class="envelope-front">
					<div class="stamp">📬</div>
					<div class="address">
						<p class="text-xs" style="color:#999;">{letter.date}</p>
						<p class="text-xs font-medium mt-1">{letter.tag}</p>
					</div>
				</div>
			</button>
		{/each}

		<!-- 펼치기 힌트 -->
		{#if !fanned}
			<div class="absolute -bottom-10 text-xs" style="color:#888;">
				클릭하면 펼쳐져요
			</div>
		{:else}
			<div class="absolute -bottom-10 text-xs" style="color:#888;">
				편지를 선택하세요
			</div>
		{/if}
	</div>

	<!-- 닫기 버튼 (펼쳐진 상태) -->
	{#if fanned && !opened}
		<button class="mt-16 text-sm underline" style="color:#888;" onclick={toggleFan}>
			접기
		</button>
	{/if}
</div>

<!-- 편지 열림 모달 -->
{#if opened}
	<div class="modal-overlay" onclick={closeLetter}>
		<div class="modal-letter" onclick={(e) => e.stopPropagation()}>

			<!-- 봉투 플랩 (열린 상태) -->
			<div class="modal-flap-open"></div>

			<!-- 편지지 -->
			<div class="letter-content">
				<div class="flex items-center justify-between mb-6">
					<div>
						<p class="text-xs mb-1" style="color:#999;">{opened.date}</p>
						<span class="text-xs font-medium px-2 py-0.5 border border-black">{opened.tag}</span>
					</div>
					<button onclick={closeLetter} class="text-xs" style="color:#999;">닫기 ×</button>
				</div>

				<h2 class="font-normal text-xl leading-snug mb-5" style="font-family:'DM Serif Display',serif; word-break:keep-all;">
					{opened.question}
				</h2>

				<hr class="border-black mb-5" />

				<p class="text-sm leading-7 mb-6" style="color:#444;">
					{opened.preview}
				</p>

				<p class="text-xs italic mb-6" style="color:#999;">
					* 매일함은 정답을 제공하지 않습니다.<br />
					GitHub Discussion에서 함께 모범답안을 만들어가세요.
				</p>

				<a
					href="https://github.com/maeilham"
					target="_blank"
					rel="noopener"
					class="inline-block w-full py-3 text-center text-sm font-medium tracking-wide hover:opacity-80 transition-opacity"
					style="background:#111; color:#D9D0C4;"
				>
					GitHub에서 토론하기 →
				</a>
			</div>
		</div>
	</div>
{/if}

<style>
	/* ── 편지 카드 ── */
	.letter-card {
		width: 160px;
		height: 220px;
		position: absolute;
		bottom: 0;
		cursor: pointer;
		transition: transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
		transform-origin: bottom center;
		filter: drop-shadow(2px 4px 8px rgba(0,0,0,0.2));
	}
	.letter-card:hover {
		filter: drop-shadow(4px 8px 16px rgba(0,0,0,0.3));
		transform: translateY(-8px) !important;
	}

	.flap {
		width: 0;
		height: 0;
		border-left: 80px solid transparent;
		border-right: 80px solid transparent;
		border-bottom: 60px solid #c8bfb0;
		position: absolute;
		top: 0;
		z-index: 2;
	}

	.envelope-front {
		position: absolute;
		inset: 0;
		background: #F2ECD8;
		border: 1px solid #c8bfb0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 12px;
		top: 40px;
		border-top: none;
	}

	.stamp {
		position: absolute;
		top: 8px;
		right: 10px;
		font-size: 1.2rem;
		border: 1px solid #c8bfb0;
		padding: 4px 6px;
		background: #fff;
	}

	.address {
		margin-top: auto;
		text-align: left;
	}

	/* ── 모달 ── */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0,0,0,0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		padding: 20px;
		animation: fadeIn 0.2s ease-out;
	}

	.modal-letter {
		width: 100%;
		max-width: 480px;
		position: relative;
		animation: slideUp 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
	}

	.modal-flap-open {
		width: 0;
		height: 0;
		border-left: 240px solid transparent;
		border-right: 240px solid transparent;
		border-top: 80px solid #c8bfb0;
		transform: rotateX(0deg);
	}

	.letter-content {
		background: #F2ECD8;
		border: 1px solid #c8bfb0;
		border-top: none;
		padding: 28px;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to   { opacity: 1; }
	}

	@keyframes slideUp {
		from { transform: translateY(40px) scale(0.95); opacity: 0; }
		to   { transform: translateY(0) scale(1); opacity: 1; }
	}
</style>
