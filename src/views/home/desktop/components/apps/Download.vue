<template>
	<div class="app-container app-light">
		<div class="app-toolbar">
			<span class="app-header-title">下载管理</span>
			<div class="header-actions">
				<el-button text class="app-toolbar-btn" @click="clearCompleted">
					<sc-icon name="ms-delete_sweep" :size="18" />
					<span class="btn-text">清除已完成</span>
				</el-button>
				<el-button text class="app-toolbar-btn" @click="pauseAll">
					<sc-icon name="ms-pause" :size="18" />
					<span class="btn-text">全部暂停</span>
				</el-button>
			</div>
		</div>

		<div v-if="downloads.length === 0" class="app-empty">
			<sc-icon name="ms-download" :size="64" />
			<p>暂无下载任务</p>
		</div>

		<div v-else class="download-list">
			<div v-for="download in downloads" :key="download.id" class="download-item"
				:class="{ completed: download.status === 'completed', error: download.status === 'error' }">
				<div class="download-icon">
					<sc-icon :name="getFileIcon(download.name)" :size="32" />
				</div>
				<div class="download-info">
					<div class="info-top">
						<span class="download-name">{{ download.name }}</span>
						<span class="download-size">{{ download.size }}</span>
					</div>
					<div class="download-progress">
						<el-progress :percentage="download.progress" :status="getProgressStatus(download.status)"
							:stroke-width="4" />
					</div>
					<div class="info-bottom">
						<span class="download-speed" v-if="download.status === 'downloading'">
							{{ download.speed }}
						</span>
						<span class="download-status" :class="download.status">
							{{ getStatusText(download.status) }}
						</span>
					</div>
				</div>
				<div class="download-actions">
					<el-button v-if="download.status === 'downloading'" text class="action-btn"
						@click="pauseDownload(download.id)">
						<sc-icon name="ms-pause" :size="18" />
					</el-button>
					<el-button v-if="download.status === 'paused'" text class="action-btn"
						@click="resumeDownload(download.id)">
						<sc-icon name="ms-play_arrow" :size="18" />
					</el-button>
					<el-button v-if="download.status === 'completed'" text class="action-btn"
						@click="openFile(download.id)">
						<sc-icon name="ms-folder_open" :size="18" />
					</el-button>
					<el-button v-if="download.status === 'error'" text class="action-btn"
						@click="retryDownload(download.id)">
						<sc-icon name="ms-refresh" :size="18" />
					</el-button>
					<el-button text class="action-btn remove" @click="removeDownload(download.id)">
						<sc-icon name="ms-close" :size="18" />
					</el-button>
				</div>
			</div>
		</div>

		<div class="app-footer">
			<div class="footer-stats">
				<span>下载中: {{ downloadingCount }}</span>
				<span>已完成: {{ completedCount }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Download',
	components: {
		scIcon,
	},
	data() {
		return {
			downloads: [],
		};
	},
	mounted() {
		this.loadDownloads();
	},
	computed: {
		downloadingCount() {
			return this.downloads.filter(d => d.status === 'downloading').length;
		},
		completedCount() {
			return this.downloads.filter(d => d.status === 'completed').length;
		},
	},
	methods: {
		getFileIcon(filename) {
			const ext = filename.split('.').pop().toLowerCase();
			const iconMap = {
				zip: 'ms-folder_zip',
				rar: 'ms-folder_zip',
				'7z': 'ms-folder_zip',
				exe: 'ms-settings_applications',
				pdf: 'ms-picture_as_pdf',
				mp4: 'ms-videocam',
				mkv: 'ms-videocam',
				avi: 'ms-videocam',
				mp3: 'ms-music_note',
				wav: 'ms-music_note',
				flac: 'ms-music_note',
				jpg: 'ms-image',
				png: 'ms-image',
				gif: 'ms-image',
				doc: 'ms-description',
				docx: 'ms-description',
				xls: 'ms-table_chart',
				xlsx: 'ms-table_chart',
				txt: 'ms-article',
			};
			return iconMap[ext] || 'ms-insert_drive_file';
		},
		getProgressStatus(status) {
			if (status === 'completed') return 'success';
			if (status === 'error') return 'exception';
			return '';
		},
		getStatusText(status) {
			const statusMap = {
				downloading: '下载中',
				paused: '已暂停',
				completed: '已完成',
				error: '下载失败',
				waiting: '等待中',
			};
			return statusMap[status] || status;
		},
		async loadDownloads() {
			var res = await this.$API.nasdownload.list.get();
			if (res.code == 200) {
				this.downloads = (res.data || []).map(item => this.mapDownloadItem(item));
			}
		},
		mapDownloadItem(item) {
			return {
				id: item.id,
				name: item.name || item.fileName || '未知文件',
				size: this.formatSize(item.size),
				progress: item.progress || 0,
				status: this.mapStatus(item.status),
				speed: item.speed ? this.formatSpeed(item.speed) : '',
				url: item.url,
			};
		},
		mapStatus(status) {
			if (typeof status === 'string') {
				return status;
			}
			const statusMap = {
				1: 'downloading',
				2: 'paused',
				3: 'completed',
				4: 'error',
				5: 'waiting',
			};
			return statusMap[status] || 'waiting';
		},
		formatSize(size) {
			if (!size) return '';
			return this.$TOOL.fileSizeFormat(size);
		},
		formatSpeed(speed) {
			if (!speed) return '';
			return this.$TOOL.fileSizeFormat(speed) + '/s';
		},
		async pauseDownload(id) {
			var res = await this.$API.nasdownload.pause.get(id);
			if (res.code == 200) {
				await this.loadDownloads();
			} else {
				this.$message.warning(res.message || '暂停失败');
			}
		},
		async resumeDownload(id) {
			var res = await this.$API.nasdownload.resume.get(id);
			if (res.code == 200) {
				await this.loadDownloads();
			} else {
				this.$message.warning(res.message || '恢复失败');
			}
		},
		async removeDownload(id) {
			var res = await this.$API.nasdownload.delete.delete(id);
			if (res.code == 200) {
				await this.loadDownloads();
			} else {
				this.$message.warning(res.message || '删除失败');
			}
		},
		openFile(id) {
			const download = this.downloads.find(d => d.id === id);
			if (download && download.url) {
				window.open(download.url, '_blank');
			} else {
				this.$message.success('打开文件所在位置');
			}
		},
		async retryDownload(id) {
			var res = await this.$API.nasdownload.resume.get(id);
			if (res.code == 200) {
				await this.loadDownloads();
			} else {
				this.$message.warning(res.message || '重试失败');
			}
		},
		async clearCompleted() {
			const completed = this.downloads.filter(d => d.status === 'completed');
			for (const item of completed) {
				await this.$API.nasdownload.delete.delete(item.id);
			}
			await this.loadDownloads();
		},
		async pauseAll() {
			const downloading = this.downloads.filter(d => d.status === 'downloading');
			for (const item of downloading) {
				await this.$API.nasdownload.pause.get(item.id);
			}
			await this.loadDownloads();
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.header-actions {
	display: flex;
	gap: 8px;
}

.btn-text {
	margin-left: 4px;
	font-size: 12px;
}

.download-list {
	flex: 1;
	overflow-y: auto;
	padding: 8px;
}

.download-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	background-color: #f9f9f9;
	border-radius: 8px;
	margin-bottom: 8px;
	transition: background-color 0.2s;
}

.download-item:hover {
	background-color: #f0f0f0;
}

.download-item.completed {
	border-left: 3px solid #67c23a;
}

.download-item.error {
	border-left: 3px solid #f56c6c;
}

.download-icon {
	width: 48px;
	height: 48px;
	background-color: #f0f0f0;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #409eff;
	flex-shrink: 0;
}

.download-info {
	flex: 1;
	overflow: hidden;
}

.info-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.download-name {
	font-size: 14px;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: #333;
}

.download-size {
	font-size: 12px;
	color: #999;
	flex-shrink: 0;
	margin-left: 12px;
}

.download-progress {
	margin-bottom: 6px;
}

.info-bottom {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.download-speed {
	font-size: 12px;
	color: #409eff;
}

.download-status {
	font-size: 12px;
	color: #999;
}

.download-status.completed {
	color: #67c23a;
}

.download-status.error {
	color: #f56c6c;
}

.download-actions {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
}

.download-actions .app-action-btn {
	opacity: 1;
}

.app-footer {
	padding: 12px 16px;
	background-color: #f9f9f9;
	border-top: 1px solid #e5e5e5;
}

.footer-stats {
	display: flex;
	gap: 20px;
	font-size: 12px;
	color: #999;
}

:deep(.el-progress-bar__outer) {
	background-color: #e5e5e5;
}

:deep(.el-progress__text) {
	color: #999;
	font-size: 12px !important;
}
</style>
