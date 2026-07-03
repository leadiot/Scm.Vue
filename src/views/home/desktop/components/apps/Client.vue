<template>
	<div class="app-container app-light download-client-app" @contextmenu.prevent.stop>
		<div class="app-toolbar">
			<span class="app-header-title">下载客户端</span>
		</div>
		<div class="download-content">
			<div class="download-header">
				<sc-icon name="ms-cloud_download" :size="48" />
				<h2>选择您的平台</h2>
				<p>下载适用于您设备的客户端应用</p>
			</div>
			<div class="platform-grid">
				<div v-for="platform in platforms" :key="platform.id">
					<div class="platform-card" v-if="platform.visible" :class="{ 'coming-soon': !platform.available }"
						@click="downloadPlatform(platform)">
						<div class="platform-icon">
							<sc-icon :name="getPlatformIcon(platform)" :size="40" />
						</div>
						<div class="platform-info">
							<div class="platform-name">{{ platform.name }}</div>
							<div class="platform-version" v-if="platform.available">
								版本 {{ platform.version }} | {{ platform.size }}
							</div>
							<div class="platform-status" v-else>
								即将推出
							</div>
						</div>
						<div class="platform-download" v-if="platform.available">
							<sc-icon name="ms-download" :size="20" />
						</div>
						<div class="platform-badge" v-if="platform.badge">
							{{ platform.badge }}
						</div>
					</div>
				</div>
			</div>
			<div class="download-features">
				<h3>客户端特性</h3>
				<div class="features-list">
					<div class="feature-item" v-for="feature in features" :key="feature">
						<sc-icon name="ms-check_circle" :size="18" />
						<span>{{ feature }}</span>
					</div>
				</div>
			</div>
			<div class="download-notice">
				<sc-icon name="ms-info" :size="16" />
				<span>下载即表示您同意我们的服务条款和隐私政策</span>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'DownloadClient',
	components: {
		scIcon,
	},
	data() {
		return {
			platforms: this.$CONFIG.DOWNLOAD_LIST,
			features: [
				'多平台支持，离线访问',
				'本地文件快速同步',
				'推送通知实时提醒',
				'多设备数据无缝同步',
				'安全加密传输',
				'自动更新保持最新',
			],
		};
	},
	methods: {
		downloadPlatform(platform) {
			if (!platform.available) {
				this.$message.info(`${platform.name} 版本即将推出，敬请期待！`);
				return;
			}
			if (platform.platform === 'web') {
				this.$message.success('您正在使用Web版！');
				return;
			}
			this.$message.success(`正在下载 ${platform.name} 客户端...`);
			this.downFile(platform);
		},
		getPlatformIcon(platform) {
			switch (platform.id) {
				case 'windows':
					return 'ms-desktop_windows';
				case 'macos':
					return 'ms-laptop_mac';
				case 'android':
					return 'ms-phone_android';
				case 'ios':
					return 'ms-phone_iphone';
				case 'linux':
					return 'ms-terminal';
				case 'web':
					return 'ms-language';
				default:
					return 'ms-cloud_download';
			}
		},
		downFile(download) {
			// 设置下载状态
			this.downloading = download.client;

			// 显示下载提示
			this.$message.success(`正在准备${this.getPlatformName(download.client)}版本下载...`);

			try {
				// 创建下载链接
				const link = document.createElement('a');
				link.href = download.url;
				link.download = download.file || this.getFileName(download.url);
				document.body.appendChild(link);

				// 使用 MouseEvent 增强可访问性
				const clickEvent = new MouseEvent('click', {
					view: window,
					bubbles: true,
					cancelable: true
				});
				link.dispatchEvent(clickEvent);

				// 延迟移除元素以确保下载开始
				setTimeout(() => {
					document.body.removeChild(link);
				}, 100);

				// 记录下载
				// this.recordDownload(download);

				// 下载开始后显示成功消息
				this.$message.success(`${this.getPlatformName(download.client)}版本开始下载，请注意保存文件。`);
			} catch (error) {
				console.error('下载失败:', error);
				this.$message.error(`下载失败，请稍后重试。`);
			} finally {
				// 重置下载状态
				this.downloading = null;
			}
		},

		getFileName(url) {
			return url.split('/').pop();
		},

		/**
		 * 打开应用商店
		 * @param {string} platform - 平台标识
		 */
		openAppStore(download) {
			var url = download.url;
			try {
				// 添加延迟和反馈，提升用户体验
				const storeName = download.client === 50 ? 'Google Play' : '华为应用市场';
				this.$message.info(`正在打开${storeName}...`);

				// 使用更安全的方式打开新窗口
				const newWindow = window.open('', '_blank');
				if (newWindow) {
					newWindow.opener = null; // 防止新窗口访问 opener 属性
					newWindow.location.href = url;
				} else {
					// 如果弹窗被阻止，提供替代方案
					this.$message.warning(`无法自动打开新窗口，请手动访问: ${url}`);
					// 复制URL到剪贴板作为备选
					navigator.clipboard.writeText(url).then(() => {
						this.$message.success('链接已复制到剪贴板');
					});
				}
			} catch (error) {
				console.error('打开应用商店失败:', error);
				this.$message.error('打开应用商店失败，请稍后重试。');
			}
		},

		/**
		 * 打开二维码
		 * @param {string} client - 平台标识
		 */
		openQrcode(download) {
			this.qrcodeVisible = true;
			this.downloadInfo = download;
		},

		/**
		 * 获取平台名称
		 * @param {string} client - 平台标识
		 * @returns {string} 平台名称
		 */
		getPlatformName(client) {
			const names = {
				10: 'Web',
				11: 'Google Chrome',
				12: 'Microsoft Edge',
				13: 'Mozilla Firefox',
				20: 'Windows',
				30: 'MacOS',
				40: 'Linux',
				50: '安卓',
				60: 'iOS',
				70: '鸿蒙',
				80: '快应用',
				81: '微信小程序',
				82: '支付宝小程序'
			};
			return names[client] || client;
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.download-client-app {
	background-color: var(--color-bg);
}

.app-toolbar {
	padding: 12px 16px;
	border-bottom: 1px solid var(--color-border);
}

.download-content {
	flex: 1;
	overflow-y: auto;
	padding: 24px;
}

.download-header {
	text-align: center;
	margin-bottom: 32px;
}

.download-header .sc-icon {
	color: var(--color-primary);
	margin-bottom: 16px;
}

.download-header h2 {
	font-size: 24px;
	font-weight: 600;
	color: var(--color-text);
	margin: 0 0 8px 0;
}

.download-header p {
	font-size: 14px;
	color: var(--color-text-secondary);
	margin: 0;
}

.platform-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16px;
	margin-bottom: 32px;
}

.platform-card {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 20px;
	background-color: var(--color-bg-secondary);
	border: 1px solid var(--color-border);
	border-radius: 12px;
	cursor: pointer;
	transition: all 0.2s;
	position: relative;
}

.platform-card:hover {
	border-color: var(--color-primary);
	box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
	transform: translateY(-2px);
}

.platform-card.coming-soon {
	opacity: 0.6;
	cursor: not-allowed;
}

.platform-card.coming-soon:hover {
	border-color: var(--color-border);
	box-shadow: none;
	transform: none;
}

.platform-icon {
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--color-bg);
	border-radius: 12px;
	color: var(--color-primary);
}

.platform-info {
	flex: 1;
}

.platform-name {
	font-size: 16px;
	font-weight: 600;
	color: var(--color-text);
	margin-bottom: 4px;
}

.platform-version {
	font-size: 12px;
	color: var(--color-text-tertiary);
}

.platform-status {
	font-size: 12px;
	color: var(--color-warning);
}

.platform-download {
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--color-primary);
	border-radius: 50%;
	color: #fff;
}

.platform-badge {
	position: absolute;
	top: -8px;
	right: 12px;
	padding: 2px 8px;
	background-color: var(--color-primary);
	color: #fff;
	font-size: 10px;
	border-radius: 10px;
}

.download-features {
	background-color: var(--color-bg-secondary);
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 24px;
}

.download-features h3 {
	font-size: 16px;
	font-weight: 600;
	color: var(--color-text);
	margin: 0 0 16px 0;
}

.features-list {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: var(--color-text-secondary);
}

.feature-item .sc-icon {
	color: var(--color-success);
}

.download-notice {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	font-size: 12px;
	color: var(--color-text-tertiary);
}
</style>
