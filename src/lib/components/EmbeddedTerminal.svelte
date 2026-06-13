<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as XtermPkg from '@xterm/xterm';
	import * as FitPkg from '@xterm/addon-fit';
	import '@xterm/xterm/css/xterm.css';

	const Terminal = (XtermPkg as any).Terminal ?? (XtermPkg as any).default?.Terminal;
	const FitAddon  = (FitPkg as any).FitAddon  ?? (FitPkg as any).default?.FitAddon;

	const API_WS = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080')
		.replace(/^http/, 'ws');

	let termEl: HTMLDivElement;
	let term: any;
	let fitAddon: any;
	let ws: WebSocket | null = null;

	onMount(() => {
		term = new Terminal({
			fontFamily: '"DM Mono", "Fira Code", "Cascadia Code", monospace',
			fontSize: 14,
			lineHeight: 1.5,
			theme: {
				background:   '#1e1e1e',
				foreground:   '#d4d4d4',
				cursor:       '#90ee90',
				cursorAccent: '#1e1e1e',
			},
			cursorBlink: true,
			scrollback: 500,
		});

		fitAddon = new FitAddon();
		term.loadAddon(fitAddon);
		term.open(termEl);
		fitAddon.fit();

		connectWS();

		const ro = new ResizeObserver(() => fitAddon?.fit());
		ro.observe(termEl);
		return () => ro.disconnect();
	});

	onDestroy(() => {
		ws?.close();
		term?.dispose();
	});

	function connectWS() {
		ws = new WebSocket(`${API_WS}/ws/terminal`);
		ws.binaryType = 'arraybuffer';
		ws.onmessage = (e) => {
			if (e.data instanceof ArrayBuffer) term.write(new Uint8Array(e.data));
			else term.write(e.data);
		};
		ws.onclose = () => term.write('\r\n\x1b[2m연결이 종료됐습니다.\x1b[0m\r\n');
		ws.onerror = () => term.write('\r\n\x1b[31m서버에 연결할 수 없습니다.\x1b[0m\r\n');
		term.onData((data: string) => {
			if (ws?.readyState === WebSocket.OPEN) ws.send(data);
		});
	}
</script>

<div class="terminal">
	<div class="titlebar">
		<span class="title">MAEILHAM</span>
		<span class="status">● CONNECTED</span>
	</div>
	<div class="term-wrap" bind:this={termEl}></div>
</div>

<style>
	.terminal {
		width: 100%;
		border: 1px solid #011627;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.12);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
	}

	.titlebar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		flex-shrink: 0;
		user-select: none;
		line-height: 1;
		border-bottom: 1px solid rgba(1, 22, 39, 0.15);
	}

	.title {
		font-size: 12px;
		font-weight: 600;
		font-family: 'DM Mono', 'Fira Code', monospace;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: #011627;
	}

	.status {
		font-size: 11px;
		font-family: 'DM Mono', 'Fira Code', monospace;
		color: #2d7d2d;
		letter-spacing: 0.06em;
		opacity: 0.7;
	}

	.term-wrap {
		flex: 1;
		overflow: hidden;
		background: #1e1e1e;
		min-height: 320px;
	}
</style>
