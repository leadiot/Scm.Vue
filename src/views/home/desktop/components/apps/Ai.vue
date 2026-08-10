<template>
	<div class="app-container app-light ai-app">
		<div class="app-toolbar">
			<div class="header-spacer"></div>
			<el-radio-group v-model="tab" size="small">
				<el-radio-button value="chat">{{ $t('desktop.aiChat') }}</el-radio-button>
				<el-radio-button value="rag">{{ $t('desktop.aiRag') }}</el-radio-button>
				<el-radio-button value="kb">{{ $t('desktop.aiKb') }}</el-radio-button>
			</el-radio-group>
			<template v-if="tab !== 'kb'">
				<el-select v-model="provider" size="small" style="width: 130px" :loading="providerLoading">
					<el-option v-for="p in providers" :key="p.value" :label="p.label" :value="p.value"
						:disabled="p.disabled" />
				</el-select>
				<el-input v-model="model" size="small" style="width: 150px"
					:placeholder="$t('desktop.aiModelDefault')" clearable />
			</template>
		</div>

		<!-- 智能对话 -->
		<template v-if="tab === 'chat'">
			<div class="ai-messages" ref="messagesRef">
				<div v-if="!messages.length" class="ai-empty">
					<sc-icon name="ms-smart_toy" :size="48" />
					<p>{{ $t('desktop.aiEmpty') }}</p>
				</div>
				<div v-for="(m, i) in messages" :key="i" class="ai-msg" :class="m.role">
					<div class="ai-avatar">
						<sc-icon :name="m.role === 'user' ? 'ms-account_circle' : 'ms-smart_toy'" :size="20" />
					</div>
					<div class="ai-bubble">
						<div v-if="m.streaming" class="ai-text">{{ m.content }}<span class="ai-cursor"></span></div>
						<div v-else class="ai-md" v-html="renderMd(m.content)"></div>
					</div>
				</div>
			</div>
			<div class="ai-inputbar">
				<el-input v-model="chatInput" type="textarea" :rows="2" resize="none"
					:placeholder="$t('desktop.aiInputPh')" @keydown.enter.exact.prevent="sendChat" />
				<div class="ai-input-actions">
					<el-button v-if="generating" size="small" type="danger" @click="stopChat">
						<sc-icon name="ms-stop" :size="14" />&nbsp;{{ $t('desktop.aiStop') }}
					</el-button>
					<el-button v-else size="small" type="primary" :disabled="!chatInput.trim()" @click="sendChat">
						<sc-icon name="ms-send" :size="14" />&nbsp;{{ $t('desktop.aiSend') }}
					</el-button>
					<el-button size="small" text :disabled="generating || !messages.length" @click="clearChat">
						<sc-icon name="ms-delete_sweep" :size="14" />
					</el-button>
				</div>
			</div>
		</template>

		<!-- 知识库问答 RAG -->
		<template v-else-if="tab === 'rag'">
			<div class="ai-messages">
				<div v-if="!ragAnswer" class="ai-empty">
					<sc-icon name="ms-menu_book" :size="48" />
					<p>{{ $t('desktop.aiRagEmpty') }}</p>
				</div>
				<template v-else>
					<div class="ai-msg assistant">
						<div class="ai-avatar"><sc-icon name="ms-smart_toy" :size="20" /></div>
						<div class="ai-bubble">
							<div class="ai-md" v-html="renderMd(ragAnswer)"></div>
							<div v-if="ragSources.length" class="ai-sources">
								<div class="ai-sources-title">{{ $t('desktop.aiSources') }}</div>
								<div v-for="(s, i) in ragSources" :key="i" class="ai-source">
									<div class="ai-source-head">
										<span class="ai-source-no">[{{ i + 1 }}]</span>
										<span class="ai-source-name">{{ s.doc_name }}</span>
										<el-tag size="small" type="info">#{{ s.chunk_no }}</el-tag>
										<span class="ai-source-score">{{ (s.score * 100).toFixed(0) }}%</span>
									</div>
									<div class="ai-source-content">{{ s.content }}</div>
								</div>
							</div>
						</div>
					</div>
				</template>
			</div>
			<div class="ai-inputbar">
				<el-input v-model="ragQuestion" type="textarea" :rows="2" resize="none"
					:placeholder="$t('desktop.aiRagPh')" @keydown.enter.exact.prevent="askRag" />
				<div class="ai-input-actions">
					<el-button size="small" type="primary" :loading="ragLoading"
						:disabled="!ragQuestion.trim()" @click="askRag">
						<sc-icon name="ms-search" :size="14" />&nbsp;{{ $t('desktop.aiAsk') }}
					</el-button>
				</div>
			</div>
		</template>

		<!-- 知识库管理 -->
		<template v-else>
			<div class="ai-kb-bar">
				<el-input v-model="kbKey" size="small" style="width: 200px" :placeholder="$t('desktop.aiKbSearch')"
					clearable @keyup.enter="loadKb(1)" @clear="loadKb(1)" />
				<el-select v-model="kbStatus" size="small" style="width: 130px" clearable
					:placeholder="$t('desktop.aiKbStatus')" @change="loadKb(1)">
					<el-option :label="$t('desktop.aiDocStatus0')" :value="0" />
					<el-option :label="$t('desktop.aiDocStatus1')" :value="1" />
					<el-option :label="$t('desktop.aiDocStatus2')" :value="2" />
					<el-option :label="$t('desktop.aiDocStatus3')" :value="3" />
				</el-select>
				<el-button size="small" @click="loadKb(1)"><sc-icon name="ms-search" :size="14" /></el-button>
				<div class="header-spacer"></div>
				<el-upload ref="uploadRef" :show-file-list="false" :http-request="handleUpload"
					accept=".txt,.md,.csv,.json,.log">
					<el-button size="small" type="primary" :loading="uploading">
						<sc-icon name="ms-upload" :size="14" />&nbsp;{{ $t('desktop.aiUpload') }}
					</el-button>
				</el-upload>
			</div>
			<div class="ai-kb-table">
				<el-table :data="kbList" height="100%" size="small" v-loading="kbLoading">
					<el-table-column prop="names" :label="$t('desktop.aiDocName')" min-width="180" show-overflow-tooltip />
					<el-table-column prop="exts" label="类型" width="70" align="center" />
					<el-table-column :label="$t('desktop.aiDocSize')" width="90" align="right">
						<template #default="{ row }">{{ formatSize(row.file_size) }}</template>
					</el-table-column>
					<el-table-column prop="chunk_count" :label="$t('desktop.aiDocChunks')" width="80" align="center" />
					<el-table-column :label="$t('desktop.aiKbStatus')" width="110" align="center">
						<template #default="{ row }">
							<el-tooltip v-if="row.status === 3" :content="row.remark || ''" placement="top">
								<el-tag size="small" :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
							</el-tooltip>
							<el-tag v-else size="small" :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
						</template>
					</el-table-column>
					<el-table-column :label="$t('desktop.aiDocAction')" width="130" align="center">
						<template #default="{ row }">
							<el-button size="small" text type="primary" @click="rebuildDoc(row)">
								{{ $t('desktop.aiRebuild') }}
							</el-button>
							<el-button size="small" text type="danger" @click="deleteDoc(row)">
								{{ $t('desktop.aiDocDelete') }}
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="ai-kb-pager">
				<el-pagination background layout="total, prev, pager, next" :total="kbTotal"
					:page-size="kbLimit" v-model:current-page="kbPage" @current-change="loadKb()" />
			</div>
		</template>
	</div>
</template>

<script>
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

export default {
	windowOptions: {
		width: 800,
		height: 600,
		resizable: true,
	},
	appIcon: 'ms-bot',
	name: 'Ai',
	data() {
		return {
			tab: 'chat',
			provider: '',
			providers: [],
			providerLoading: false,
			model: '',
			// 对话
			messages: [],
			chatInput: '',
			generating: false,
			abortController: null,
			// RAG
			ragQuestion: '',
			ragAnswer: '',
			ragSources: [],
			ragLoading: false,
			// 知识库
			kbList: [],
			kbTotal: 0,
			kbPage: 1,
			kbLimit: 20,
			kbKey: '',
			kbStatus: '',
			kbLoading: false,
			uploading: false,
		};
	},
	methods: {
		// 加载可用的AI服务商列表
		async loadProviders() {
			this.providerLoading = true;
			try {
				const res = await this.$API.scmaichat.provider.get();
				if (res && res.code == 200) {
					this.providers = (res.data || []).map((p) => ({
						label: p.label,
						value: String(p.value),
						disabled: !!p.disabled,
					}));
					// 当前选中项不在列表中时，回退到第一个可用项（为空时后端会用默认服务）
					if (!this.providers.some((p) => p.value === this.provider)) {
						const first = this.providers.find((p) => !p.disabled);
						this.provider = first ? first.value : '';
					}
				}
			} finally {
				this.providerLoading = false;
			}
		},
		renderMd(text) {
			if (!text) return '';
			try {
				return marked.parse(text);
			} catch (e) {
				return text;
			}
		},
		scrollBottom() {
			this.$nextTick(() => {
				const el = this.$refs.messagesRef;
				if (el) el.scrollTop = el.scrollHeight;
			});
		},
		// ---- 打字机效果：网络分片先进缓冲区，再匀速逐字输出 ----
		startTyping(ai) {
			if (ai._timer) return;
			ai._timer = setInterval(() => {
				const buf = ai._buffer || '';
				if (!buf) {
					// 缓冲区排空：已接收完毕则收尾，否则继续等待新分片
					if (ai._done) this.finishTyping(ai);
					return;
				}
				// 积压越多输出越快，避免后端一次推大段时长时间拖尾
				const step = Math.max(1, Math.ceil(buf.length / 40));
				ai.content += buf.slice(0, step);
				ai._buffer = buf.slice(step);
				this.scrollBottom();
			}, 40);
		},
		finishTyping(ai) {
			if (ai._timer) {
				clearInterval(ai._timer);
				ai._timer = null;
			}
			ai._buffer = '';
			ai.streaming = false;
			this.generating = false;
			this.scrollBottom();
		},
		// ---- 智能对话（流式） ----
		sendChat() {
			const text = this.chatInput.trim();
			if (!text || this.generating) return;
			this.chatInput = '';
			this.messages.push({ role: 'user', content: text });
			this.messages.push({ role: 'assistant', content: '', streaming: true });
			// 必须从 reactive 数组取回代理对象：直接修改原始对象不会触发视图更新
			const ai = this.messages[this.messages.length - 1];
			this.generating = true;
			this.abortController = new AbortController();
			this.scrollBottom();

			const history = this.messages
				.slice(0, -1)
				.filter((m) => !m.streaming)
				.map((m) => ({ role: m.role, content: m.content }));

			this.$API.scmaichat.stream.post(
				{
					provider: this.provider,
					model: this.model || undefined,
					messages: history,
				},
				{
					onChunk: (t) => {
						ai._buffer = (ai._buffer || '') + t;
						this.startTyping(ai);
					},
					onDone: () => {
						ai._done = true;
						if (this.abortController && this.abortController.signal.aborted) {
							// 用户主动停止：剩余文本直接全部输出
							ai.content += ai._buffer || '';
							this.finishTyping(ai);
						} else if (!ai._buffer) {
							this.finishTyping(ai);
						}
						// 否则等打字机排空缓冲区后自动收尾
					},
					onError: (err) => {
						if (ai._timer) {
							clearInterval(ai._timer);
							ai._timer = null;
						}
						ai._buffer = '';
						ai.content = ai.content || this.$t('desktop.aiError');
						ai.streaming = false;
						this.generating = false;
						console.error(err);
					},
				},
				this.abortController.signal
			);
		},
		stopChat() {
			if (this.abortController) this.abortController.abort();
		},
		clearChat() {
			if (this.generating) this.stopChat();
			this.messages.forEach((m) => {
				if (m._timer) clearInterval(m._timer);
			});
			this.messages = [];
			this.generating = false;
		},
		// ---- RAG 知识库问答 ----
		async askRag() {
			const q = this.ragQuestion.trim();
			if (!q || this.ragLoading) return;
			this.ragLoading = true;
			this.ragAnswer = '';
			this.ragSources = [];
			try {
				const res = await this.$API.scmaichat.ask.post({
					question: q,
					provider: this.provider,
					model: this.model || undefined,
				});
				if (res && res.code == 200 && res.data) {
					this.ragAnswer = res.data.content || '';
					this.ragSources = res.data.sources || [];
				} else {
					this.ragAnswer = this.$t('desktop.aiError');
				}
			} catch (e) {
				this.ragAnswer = this.$t('desktop.aiError');
			} finally {
				this.ragLoading = false;
			}
		},
		// ---- 知识库管理 ----
		async loadKb(page) {
			if (page) this.kbPage = page;
			this.kbLoading = true;
			try {
				const params = { page: this.kbPage, limit: this.kbLimit };
				if (this.kbKey) params.key = this.kbKey;
				if (this.kbStatus !== '' && this.kbStatus !== null) params.status = this.kbStatus;
				const res = await this.$API.scmaidoc.pages.get(params);
				if (res && res.code == 200 && res.data) {
					this.kbList = res.data.items || [];
					this.kbTotal = res.data.total || 0;
				}
			} finally {
				this.kbLoading = false;
			}
		},
		async handleUpload(param) {
			this.uploading = true;
			try {
				const data = new FormData();
				data.append('file', param.file);
				const res = await this.$API.scmaidoc.upload.post(data);
				if (res && res.code == 200) {
					this.$message.success(this.$t('desktop.aiUploadOk'));
					param.onSuccess && param.onSuccess();
					this.loadKb(1);
				} else {
					this.$message.error(res?.message || this.$t('desktop.aiError'));
					param.onError && param.onError();
				}
			} catch (e) {
				this.$message.error(this.$t('desktop.aiError'));
				param.onError && param.onError();
			} finally {
				this.uploading = false;
			}
		},
		async rebuildDoc(row) {
			const res = await this.$API.scmaidoc.rebuild.post({ id: row.id });
			if (res && res.code == 200) {
				this.$message.success(this.$t('desktop.aiRebuildOk'));
				this.loadKb();
			} else {
				this.$message.error(res?.message || this.$t('desktop.aiError'));
			}
		},
		deleteDoc(row) {
			this.$confirm(this.$t('desktop.aiDeleteConfirm'), this.$t('desktop.aiDocDelete'), {
				type: 'warning',
			})
				.then(async () => {
					const res = await this.$API.scmaidoc.delete.delete(row.id);
					if (res && res.code == 200) {
						this.$message.success(this.$t('desktop.aiDeleteOk'));
						this.loadKb();
					} else {
						this.$message.error(res?.message || this.$t('desktop.aiError'));
					}
				})
				.catch(() => { });
		},
		statusType(status) {
			return ['info', 'warning', 'success', 'danger'][status] || 'info';
		},
		statusText(status) {
			return this.$t(`desktop.aiDocStatus${status}`);
		},
		formatSize(size) {
			if (!size) return '0 B';
			const units = ['B', 'KB', 'MB', 'GB'];
			let i = 0;
			let v = Number(size);
			while (v >= 1024 && i < units.length - 1) {
				v /= 1024;
				i++;
			}
			return v.toFixed(i ? 1 : 0) + ' ' + units[i];
		},
	},
	watch: {
		tab(val) {
			if (val === 'kb' && !this.kbList.length) this.loadKb(1);
		},
	},
	mounted() {
		this.loadProviders();
	},
	beforeUnmount() {
		if (this.abortController) this.abortController.abort();
		this.messages.forEach((m) => {
			if (m._timer) clearInterval(m._timer);
		});
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.ai-app {
	overflow: hidden;
}

.ai-app .header-spacer {
	flex: 1;
}

.ai-messages {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.ai-empty {
	margin: auto;
	text-align: center;
	color: #999;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

.ai-msg {
	display: flex;
	gap: 10px;
	align-items: flex-start;
}

.ai-msg.user {
	flex-direction: row-reverse;
}

.ai-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	background: #e8f0fe;
	color: #3b6bd4;
}

.ai-msg.user .ai-avatar {
	background: #e6f4ea;
	color: #2e7d32;
}

.ai-bubble {
	max-width: 78%;
	padding: 10px 14px;
	border-radius: 10px;
	background: #f2f4f7;
	color: #1a1a1a;
	font-size: 13px;
	line-height: 1.6;
	word-break: break-word;
}

.ai-msg.user .ai-bubble {
	background: #3b6bd4;
	color: #fff;
}

.ai-text {
	white-space: pre-wrap;
}

.ai-cursor {
	display: inline-block;
	width: 7px;
	height: 14px;
	margin-left: 2px;
	background: currentColor;
	vertical-align: middle;
	animation: ai-blink 1s steps(1) infinite;
}

@keyframes ai-blink {
	50% {
		opacity: 0;
	}
}

.ai-md :deep(p) {
	margin: 0 0 8px;
}

.ai-md :deep(p:last-child) {
	margin-bottom: 0;
}

.ai-md :deep(pre) {
	background: #272822;
	color: #f8f8f2;
	padding: 10px;
	border-radius: 6px;
	overflow-x: auto;
	margin: 8px 0;
}

.ai-md :deep(code) {
	font-family: Consolas, Monaco, monospace;
	font-size: 12px;
}

.ai-md :deep(:not(pre)>code) {
	background: rgba(0, 0, 0, 0.08);
	padding: 1px 5px;
	border-radius: 4px;
}

.ai-md :deep(ul),
.ai-md :deep(ol) {
	padding-left: 20px;
	margin: 6px 0;
}

.ai-md :deep(table) {
	border-collapse: collapse;
	margin: 8px 0;
}

.ai-md :deep(th),
.ai-md :deep(td) {
	border: 1px solid #d0d7de;
	padding: 4px 8px;
}

.ai-inputbar {
	border-top: 1px solid #e5e7eb;
	padding: 10px 14px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.ai-input-actions {
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

/* RAG 引用来源 */
.ai-sources {
	margin-top: 12px;
	border-top: 1px dashed #d0d7de;
	padding-top: 10px;
}

.ai-sources-title {
	font-size: 12px;
	font-weight: 600;
	color: #666;
	margin-bottom: 8px;
}

.ai-source {
	background: rgba(0, 0, 0, 0.04);
	border-radius: 6px;
	padding: 8px 10px;
	margin-bottom: 8px;
}

.ai-source-head {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	margin-bottom: 4px;
}

.ai-source-no {
	font-weight: 700;
	color: #3b6bd4;
}

.ai-source-name {
	font-weight: 600;
}

.ai-source-score {
	margin-left: auto;
	color: #2e7d32;
	font-size: 11px;
}

.ai-source-content {
	font-size: 12px;
	color: #555;
	white-space: pre-wrap;
}

/* 知识库管理 */
.ai-kb-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	border-bottom: 1px solid #e5e7eb;
}

.ai-kb-table {
	flex: 1;
	overflow: hidden;
	padding: 0 14px;
}

.ai-kb-pager {
	display: flex;
	justify-content: flex-end;
	padding: 10px 14px;
}
</style>
