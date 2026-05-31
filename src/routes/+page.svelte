<script lang="ts">
	const API = import.meta.env.VITE_API_URL ?? "";

	let email = $state("");
	let status = $state<"idle" | "loading" | "done" | "error">("idle");
	let errorMsg = $state("");

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

<main class="flex flex-col items-center justify-center min-h-screen px-4 bg-zinc-50">
	<div class="w-full max-w-md">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold tracking-tight mb-3">매일함</h1>
			<p class="text-zinc-500 text-base leading-relaxed">
				하루 한 통, 개발 면접 질문이 메일함에 도착합니다.<br />
				GitHub에서 직접 답하고, 토론하고, 기여하세요.
			</p>
		</div>

		{#if status === "done"}
			<p class="text-center text-sm text-zinc-600">
				확인 메일을 보냈습니다. 메일함을 확인해주세요 :)
			</p>
		{:else}
			<form onsubmit={handleSubmit} class="flex flex-col gap-3">
				<input
					type="email"
					bind:value={email}
					required
					placeholder="your@email.com"
					class="w-full px-4 py-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 placeholder:text-zinc-400"
				/>
				<button
					type="submit"
					disabled={status === "loading"}
					class="w-full px-4 py-3 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-50"
				>
					{status === "loading" ? "전송 중…" : "구독 신청"}
				</button>
			</form>

			{#if status === "error"}
				<p class="mt-3 text-center text-sm text-red-500">{errorMsg}</p>
			{/if}

			<p class="mt-8 text-center text-xs text-zinc-400">언제든 구독 해지할 수 있습니다.</p>
		{/if}
	</div>
</main>
