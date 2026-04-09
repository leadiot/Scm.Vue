<template>
	<div class="app-container app-light">
		<div class="browser-toolbar">
			<button @click="goBack" class="nav-btn" :disabled="!canGoBack">
				<sc-icon name="ms-arrow_back" :size="18" />
			</button>
			<button @click="goForward" class="nav-btn" :disabled="!canGoForward">
				<sc-icon name="ms-arrow_forward" :size="18" />
			</button>
			<button @click="refresh" class="nav-btn" :disabled="!currentUrl">
				<sc-icon name="ms-refresh" :size="18" />
			</button>
			<div class="url-bar">
				<el-input v-model="url" placeholder="输入网址..." @keyup.enter="navigate">
					<template #prefix>
						<sc-icon :name="isLoading ? 'ms-sync' : 'ms-lock'" :size="16"
							:class="{ 'is-loading': isLoading }" />
					</template>
				</el-input>
			</div>
			<button @click="navigate" class="go-btn">前往</button>
			<button v-if="currentUrl" @click="openInNewTab" class="nav-btn" title="在新标签页打开">
				<sc-icon name="ms-open_in_new" :size="18" />
			</button>
		</div>
		<div class="browser-content">
			<div v-if="!currentUrl" class="welcome-page">
				<h2>欢迎使用浏览器</h2>
				<div class="quick-links">
					<div v-for="link in quickLinks" :key="link.url" class="quick-link" @click="visitLink(link.url)">
						<div class="link-icon">{{ link.icon }}</div>
						<span>{{ link.name }}</span>
					</div>
				</div>
			</div>
			<div v-else class="iframe-container">
				<div v-if="isLoading" class="loading-overlay">
					<sc-icon name="ms-sync" :size="48" class="loading-icon" />
					<span>正在加载...</span>
				</div>
				<div v-if="loadError" class="error-overlay">
					<sc-icon name="ms-warning" :size="64" class="error-icon" />
					<h3>无法在此窗口中显示此网页</h3>
					<p class="error-message">{{ errorMessage }}</p>
					<p class="error-hint">该网站设置了安全策略，禁止在其他应用中嵌入显示。</p>
					<div class="error-actions">
						<el-button type="primary" @click="openInNewTab">
							<sc-icon name="ms-open_in_new" :size="16" />
							在新标签页中打开
						</el-button>
						<el-button @click="goHome">
							<sc-icon name="ms-home" :size="16" />
							返回首页
						</el-button>
					</div>
				</div>
				<iframe v-show="!loadError" ref="browserFrame" :src="currentUrl" class="browser-iframe"
					@load="onFrameLoad" @error="onFrameError"
					sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Browser',
	components: { scIcon },
	data() {
		return {
			url: '',
			currentUrl: '',
			isLoading: false,
			loadError: false,
			errorMessage: '',
			history: [],
			historyIndex: -1,
			loadTimeout: null,
			quickLinks: [
				{ name: '百度', url: 'https://www.baidu.com', icon: '🔍' },
				{ name: '维基百科', url: 'https://zh.wikipedia.org', icon: '📚' },
				{ name: 'MDN文档', url: 'https://developer.mozilla.org', icon: '�' },
				{ name: 'W3C', url: 'https://www.w3.org', icon: '🌐' },
				{ name: '菜鸟教程', url: 'https://www.runoob.com', icon: '📝' },
				{ name: '码云', url: 'https://gitee.com', icon: '💻' },
			],
			blockedDomains: [
				'bing.com',
				'github.com',
				'zhihu.com',
				'taobao.com',
				'tmall.com',
				'jd.com',
				'weibo.com',
				'google.com',
				'youtube.com',
				'twitter.com',
				'facebook.com',
				'instagram.com',
				'qq.com',
				'bilibili.com',
			],
		};
	},
	computed: {
		canGoBack() {
			return this.historyIndex > 0;
		},
		canGoForward() {
			return this.historyIndex < this.history.length - 1;
		},
	},
	methods: {
		isBlockedDomain(url) {
			try {
				const hostname = new URL(url).hostname;
				return this.blockedDomains.some(domain =>
					hostname === domain || hostname.endsWith('.' + domain)
				);
			} catch {
				return false;
			}
		},
		formatUrl(inputUrl) {
			let formattedUrl = inputUrl.trim();
			if (!formattedUrl) return '';

			if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
				if (formattedUrl.includes('.') && !formattedUrl.includes(' ')) {
					formattedUrl = 'https://' + formattedUrl;
				} else {
					formattedUrl = 'https://www.baidu.com/s?wd=' + encodeURIComponent(formattedUrl);
				}
			}
			return formattedUrl;
		},
		navigate() {
			const formattedUrl = this.formatUrl(this.url);
			if (!formattedUrl) {
				return;
			}

			this.loadUrl(formattedUrl, true);
		},
		loadUrl(targetUrl, addToHistory = true) {
			if (this.isBlockedDomain(targetUrl)) {
				this.showBlockedError(targetUrl);
				return;
			}

			this.isLoading = true;
			this.loadError = false;
			this.errorMessage = '';
			this.currentUrl = targetUrl;
			this.url = targetUrl;

			if (addToHistory) {
				this.history = this.history.slice(0, this.historyIndex + 1);
				this.history.push(targetUrl);
				this.historyIndex = this.history.length - 1;
			}

			if (this.loadTimeout) {
				clearTimeout(this.loadTimeout);
			}

			this.loadTimeout = setTimeout(() => {
				if (this.isLoading) {
					this.onFrameError(new Error('加载超时'));
				}
			}, 5000);

			if (this.isBlockedDomain(targetUrl)) {
				setTimeout(() => {
					if (this.isLoading) {
						this.showBlockedError(targetUrl);
					}
				}, 1000);
			}
		},
		showBlockedError(url) {
			this.isLoading = false;
			this.loadError = true;
			this.currentUrl = url;
			this.url = url;
			try {
				const hostname = new URL(url).hostname;
				this.errorMessage = `${hostname} 不允许在嵌入式框架中显示`;
			} catch {
				this.errorMessage = '该网站不允许在嵌入式框架中显示';
			}
			if (this.loadTimeout) {
				clearTimeout(this.loadTimeout);
			}
		},
		goBack() {
			if (this.canGoBack) {
				this.historyIndex--;
				const targetUrl = this.history[this.historyIndex];
				this.loadUrl(targetUrl, false);
			}
		},
		goForward() {
			if (this.canGoForward) {
				this.historyIndex++;
				const targetUrl = this.history[this.historyIndex];
				this.loadUrl(targetUrl, false);
			}
		},
		refresh() {
			if (this.currentUrl && this.$refs.browserFrame) {
				this.isLoading = true;
				this.loadError = false;
				this.$refs.browserFrame.src = this.currentUrl;

				if (this.loadTimeout) {
					clearTimeout(this.loadTimeout);
				}
				this.loadTimeout = setTimeout(() => {
					if (this.isLoading) {
						this.onFrameError(new Error('加载超时'));
					}
				}, 15000);
			}
		},
		visitLink(linkUrl) {
			this.url = linkUrl;
			this.loadUrl(linkUrl, true);
		},
		openInNewTab() {
			if (this.currentUrl) {
				window.open(this.currentUrl, '_blank');
			}
		},
		goHome() {
			this.currentUrl = '';
			this.url = '';
			this.loadError = false;
			this.isLoading = false;
			if (this.loadTimeout) {
				clearTimeout(this.loadTimeout);
			}
		},
		onFrameLoad() {
			this.isLoading = false;
			this.loadError = false;
			if (this.loadTimeout) {
				clearTimeout(this.loadTimeout);
			}
		},
		onFrameError(error) {
			this.isLoading = false;
			this.loadError = true;
			this.errorMessage = error?.message || '页面加载失败';
			if (this.loadTimeout) {
				clearTimeout(this.loadTimeout);
			}
		},
	},
	beforeUnmount() {
		if (this.loadTimeout) {
			clearTimeout(this.loadTimeout);
		}
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.browser-toolbar {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px;
	background-color: #f5f5f5;
	border-bottom: 1px solid #e0e0e0;
}

.nav-btn {
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 4px;
	background-color: transparent;
	color: #333;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s;
}

.nav-btn:hover:not(:disabled) {
	background-color: #e0e0e0;
}

.nav-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.url-bar {
	flex: 1;
}

.go-btn {
	padding: 8px 16px;
	border: none;
	border-radius: 4px;
	background-color: #409eff;
	color: #fff;
	cursor: pointer;
	transition: background-color 0.3s;
}

.go-btn:hover {
	background-color: #66b1ff;
}

.browser-content {
	flex: 1;
	overflow: hidden;
	background-color: #fff;
}

.welcome-page {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 40px;
}

.welcome-page h2 {
	font-size: 28px;
	color: #333;
	margin-bottom: 40px;
}

.quick-links {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	max-width: 600px;
}

.quick-link {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	padding: 20px;
	cursor: pointer;
	border-radius: 8px;
	transition: background-color 0.3s;
}

.quick-link:hover {
	background-color: #f5f5f5;
}

.link-icon {
	width: 60px;
	height: 60px;
	border-radius: 12px;
	background-color: #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32px;
}

.quick-link span {
	font-size: 14px;
	color: #666;
}

.iframe-container {
	position: relative;
	width: 100%;
	height: 100%;
}

.browser-iframe {
	width: 100%;
	height: 100%;
	border: none;
}

.loading-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: rgba(255, 255, 255, 0.9);
	gap: 16px;
	z-index: 10;
}

.loading-icon {
	animation: spin 1s linear infinite;
	color: #409eff;
}

.is-loading {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

.error-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	gap: 16px;
	z-index: 10;
	padding: 40px;
}

.error-icon {
	color: #e6a23c;
}

.error-overlay h3 {
	font-size: 20px;
	color: #333;
	margin: 0;
}

.error-message {
	font-size: 14px;
	color: #666;
	margin: 0;
}

.error-hint {
	font-size: 12px;
	color: #999;
	margin: 0;
}

.error-actions {
	display: flex;
	gap: 12px;
	margin-top: 16px;
}

.error-actions .el-button {
	display: flex;
	align-items: center;
	gap: 6px;
}
</style>
