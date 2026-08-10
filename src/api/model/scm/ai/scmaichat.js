import config from "@/config";
import http from "@/utils/request";
import tool from "@/utils/tool";
import crypto from "@/utils/crypto";
import router from "@/router";
import logger from "@/utils/logger";

// 大模型响应较慢（后端默认超时300秒），非流式请求显式放大超时
const AI_TIMEOUT = 300000;

export default {
	chat: {
		url: `${config.API_URL}/scmaichat/chat`,
		name: "智能问答",
		post: async function (data) {
			return await http.post(this.url, data, { timeout: AI_TIMEOUT });
		},
	},
	ask: {
		url: `${config.API_URL}/scmaichat/ask`,
		name: "知识库问答",
		post: async function (data) {
			return await http.post(this.url, data, { timeout: AI_TIMEOUT });
		},
	},
	provider: {
		url: `${config.API_URL}/scmaichat/provider`,
		name: "提供者",
		get: async function () {
			return await http.get(this.url);
		},
	},
	stream: {
		url: `${config.API_URL}/scmaichat/chatstream`,
		name: "流式问答",
		/**
		 * SSE 流式问答（POST + text/event-stream）。
		 * 浏览器端 EventSource 仅支持 GET 且无法带自定义请求头，axios 又无法流式读取，
		 * 因此改用 fetch + ReadableStream，并手动复刻 axios 拦截器的鉴权/签名头。
		 * @param {Object} data 请求体 { provider, model, system, messages, temperature }
		 * @param {Object} hooks { onChunk(text), onDone(), onError(err) }
		 * @param {AbortSignal} signal 用于停止生成
		 */
		post: async function (data, hooks = {}, signal) {
			const { onChunk, onDone, onError } = hooks;
			try {
				const token = tool.session.get("TOKEN");
				const timestamp = new Date().getTime();
				const signStr =
					config.APP_KEY + config.SIGN_KEY + timestamp + JSON.stringify(data);
				const resp = await fetch(this.url, {
					method: "POST",
					signal,
					headers: {
						"Content-Type": "application/json",
						[config.TOKEN_NAME]: config.TOKEN_PREFIX + token,
						appkey: config.APP_KEY,
						timestamp: timestamp,
						signature: crypto.MD5(signStr),
					},
					body: JSON.stringify(data),
				});
				if (resp.status === 401) {
					router.replace({ path: "/login" });
					throw new Error("Unauthorized");
				}
				if (!resp.ok || !resp.body) {
					throw new Error(`HTTP ${resp.status}`);
				}
				const reader = resp.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				const handleLine = (line) => {
					const str = line.trim();
					if (!str.startsWith("data:")) return false;
					const payload = str.slice(5).trim();
					if (!payload) return false;
					if (payload === "[DONE]") return true;
					try {
						const json = JSON.parse(payload);
						const text = json.choices?.[0]?.delta?.content;
						if (text) onChunk && onChunk(text);
					} catch {
						// 忽略无法解析的心跳/注释行
					}
					return false;
				};
				 
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop();
					for (const line of lines) {
						if (handleLine(line)) {
							onDone && onDone();
							return;
						}
					}
				}
				// 冲刷末尾残留数据
				if (buffer) handleLine(buffer);
				onDone && onDone();
			} catch (err) {
				if (err.name === "AbortError") {
					onDone && onDone();
					return;
				}
				onError ? onError(err) : logger.error('AI 流式请求失败', err);
			}
		},
	},
};
