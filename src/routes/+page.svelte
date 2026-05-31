<script lang="ts">
	const API = import.meta.env.VITE_API_URL ?? "";

	let email = $state("");
	let status = $state<"idle" | "loading" | "done" | "error">("idle");
	let errorMsg = $state("");

	const samples = [
		{ tag: "백엔드", q: "인덱스(Index)란 무엇이고, 언제 사용하면 좋을까요?" },
		{ tag: "백엔드", q: "트랜잭션의 ACID 속성에 대해 설명해주세요." },
		{ tag: "프론트엔드", q: "브라우저의 렌더링 과정을 설명해주세요." },
		{ tag: "공통", q: "RESTful API 설계 원칙에 대해 설명해주세요." },
		{ tag: "프론트엔드", q: "이벤트 버블링과 캡처링의 차이는 무엇인가요?" },
		{ tag: "백엔드", q: "HTTP와 HTTPS의 차이점은 무엇인가요?" },
		{ tag: "공통", q: "객체지향 프로그래밍의 4가지 특징을 설명해주세요." },
	];

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status = "loading";
		try {
			const res = await fetch(`${API}/api/subscribe`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (res.ok) {
				status = "done";
			} else {
				const data = await res.json().catch(() => ({}));
				errorMsg = data.error ?? "오류가 발생했습니다. 다시 시도해주세요.";
				status = "error";
			}
		} catch {
			errorMsg = "네트워크 오류가 발생했습니다. 다시 시도해주세요.";
			status = "error";
		}
	}
</script>

<svelte:head>
	<title>매일함</title>
</svelte:head>

<div class="min-h-screen bg-white text-zinc-900">

	<!-- 헤더 -->
	<header class="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
		<span class="font-bold text-lg tracking-tight">📬 매일함</span>
	</header>

	<!-- 히어로 -->
	<section class="flex flex-col items-center text-center px-6 pt-16 pb-20 max-w-2xl mx-auto">
		<span class="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 text-white" style="background: #FF7002;">
			매일 성장하는 개발자를 위해
		</span>
		<h1 class="text-5xl font-bold leading-tight tracking-tight mb-6" style="word-break: keep-all;">
			매일함으로,<br />매일 함.
		</h1>
		<p class="text-lg text-zinc-500 leading-relaxed mb-10" style="word-break: keep-all;">
			정답은 없습니다. 하루 한 질문에 내 답을 남기고,<br />
			함께 모범답안을 만들어가세요.
		</p>

		{#if status === "done"}
			<div class="w-full max-w-md bg-orange-50 rounded-2xl px-8 py-8 text-center">
				<div class="text-4xl mb-3">🎉</div>
				<p class="font-bold text-lg mb-1">확인 메일을 보냈습니다!</p>
				<p class="text-sm text-zinc-500">메일함을 확인해주세요 :)</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="flex flex-col sm:flex-row gap-3 w-full max-w-md">
				<input
					type="email"
					bind:value={email}
					required
					placeholder="your@email.com"
					class="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-zinc-400"
					style="--tw-ring-color: #FF7002;"
				/>
				<button
					type="submit"
					disabled={status === "loading"}
					class="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap hover:opacity-90 active:scale-95"
					style="background: #FF7002;"
				>
					{status === "loading" ? "전송 중…" : "무료 구독"}
				</button>
			</form>

			{#if status === "error"}
				<p class="mt-3 text-sm text-red-500">{errorMsg}</p>
			{/if}

			<p class="mt-4 text-xs text-zinc-400">언제든 구독 해지할 수 있습니다.</p>
		{/if}
	</section>

	<!-- 마퀴 -->
	<section class="py-6 border-y border-zinc-100 overflow-hidden" style="mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);">
		<div class="marquee-track flex gap-4">
			{#each [...samples, ...samples] as { tag, q }}
				<div class="flex-shrink-0 w-72 px-5 py-4 rounded-xl border border-zinc-100 bg-white shadow-sm">
					<span class="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3 text-white" style="background: #FF7002;">
						{tag}
					</span>
					<p class="text-sm leading-relaxed text-zinc-700">{q}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- 특징 -->
	<section class="max-w-3xl mx-auto px-6 py-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
		{#each [
			{ icon: "📮", title: "매일 아침, 질문 하나", desc: "바쁜 하루 중 딱 한 질문. 부담 없이, 꾸준하게." },
			{ icon: "💬", title: "내 답이 모범답안이 된다", desc: "정답을 주지 않습니다. GitHub에서 함께 만들어가요." },
			{ icon: "🤝", title: "함께 만드는 콘텐츠", desc: "PR로 질문을 기여하고, 오픈소스로 성장하세요." },
		] as item}
			<div class="p-6 rounded-2xl bg-zinc-50">
				<div class="text-2xl mb-3">{item.icon}</div>
				<h3 class="font-semibold mb-2 text-sm">{item.title}</h3>
				<p class="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
			</div>
		{/each}
	</section>

	<!-- 푸터 -->
	<footer class="border-t border-zinc-100 px-6 py-6 text-center text-xs text-zinc-400">
		© 2026 매일함
	</footer>

</div>

<style>
	.marquee-track {
		animation: marquee 25s linear infinite;
		width: max-content;
	}
	.marquee-track:hover {
		animation-play-state: paused;
	}
	@keyframes marquee {
		from { transform: translateX(0); }
		to { transform: translateX(-50%); }
	}
</style>
