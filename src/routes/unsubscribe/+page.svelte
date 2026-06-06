<script lang="ts">
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import InnerPage from "$lib/components/InnerPage.svelte";

	const API = import.meta.env.VITE_API_URL ?? "";
	const token = $derived($page.url.searchParams.get("token"));
	let loading = $state(false);

	async function handleUnsubscribe() {
		if (!token) { goto("/?status=invalid"); return; }
		loading = true;
		const res = await fetch(`${API}/api/unsubscribe?token=${token}`, { method: "POST" }).catch(() => null);
		if (res?.ok) {
			goto("/?status=unsubscribed");
		} else {
			goto("/?status=invalid");
		}
	}
</script>

<svelte:head>
	<title>구독 해지 — 매일함</title>
</svelte:head>

<InnerPage>
	<div class="card">
		<p class="label">구독 해지</p>
		<h1 class="title">정말 해지하시겠어요?</h1>
		<p class="desc">해지 후에도 언제든 다시 구독할 수 있습니다.</p>
		<div class="actions">
			<button class="btn-primary" onclick={handleUnsubscribe} disabled={loading}>
				{loading ? "처리 중..." : "네, 해지할게요"}
			</button>
			<a href="/" class="btn-secondary">취소</a>
		</div>
	</div>
</InnerPage>

<style>
	.card {
		width: 100%;
		max-width: 380px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.label {
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		color: #aaa;
	}

	.title {
		font-size: 1.6rem;
		font-weight: 600;
		color: #111;
		line-height: 1.25;
		letter-spacing: -0.02em;
		font-family: 'DM Sans', sans-serif;
	}

	.desc {
		font-size: 0.875rem;
		color: #666;
		line-height: 1.8;
	}

	.actions {
		display: flex;
		gap: 10px;
		align-items: center;
		margin-top: 8px;
	}

	.btn-primary {
		padding: 10px 22px;
		background: #111;
		color: #fff;
		font-size: 0.82rem;
		font-weight: 500;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.btn-primary:hover:not(:disabled) { opacity: 0.7; }
	.btn-primary:disabled { opacity: 0.4; cursor: default; }

	.btn-secondary {
		font-size: 0.82rem;
		color: #aaa;
		text-decoration: none;
		transition: color 0.15s;
	}
	.btn-secondary:hover { color: #333; }
</style>
