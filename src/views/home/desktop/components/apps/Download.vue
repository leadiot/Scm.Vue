<template>
	<div class="download-app">
		<div class="app-header">
			<span class="app-title">下载管理</span>
			<div class="header-actions">
				<el-button text class="action-btn" @click="clearCompleted">
					<sc-icon name="ms-delete_sweep" :size="18" />
					<span class="btn-text">清除已完成</span>
				</el-button>
				<el-button text class="action-btn" @click="pauseAll">
					<sc-icon name="ms-pause" :size="18" />
					<span class="btn-text">全部暂停</span>
				</el-button>
			</div>
		</div>

		<div v-if="downloads.length === 0" class="empty-state">
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
			downloads: [
				{ id: 1, name: '项目文件.zip', size: '125 MB', progress: 100, status: 'completed', speed: '' },
				{ id: 2, name: '安装包.exe', size: '256 MB', progress: 75, status: 'downloading', speed: '2.5 MB/s' },
				{ id: 3, name: '文档.pdf', size: '5.2 MB', progress: 45, status: 'downloading', speed: '1.2 MB/s' },
				{ id: 4, name: '视频.mp4', size: '1.2 GB', progress: 20, status: 'paused', speed: '' },
				{ id: 5, name: '音乐.mp3', size: '8.5 MB', progress: 0, status: 'error', speed: '' },
			],
		};
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
		pauseDownload(id) {
			const download = this.downloads.find(d => d.id === id);
			if (download) {
				download.status = 'paused';
				download.speed = '';
			}
		},
		resumeDownload(id) {
			const download = this.downloads.find(d => d.id === id);
			if (download) {
				download.status = 'downloading';
				download.speed = '1.5 MB/s';
			}
		},
		removeDownload(id) {
			const index = this.downloads.findIndex(d => d.id === id);
			if (index > -1) {
				this.downloads.splice(index, 1);
			}
		},
		openFile(id) {
			this.$message.success('打开文件所在位置');
		},
		retryDownload(id) {
			const download = this.downloads.find(d => d.id === id);
			if (download) {
				download.status = 'downloading';
				download.progress = 0;
				download.speed = '1.0 MB/s';
			}
		},
		clearCompleted() {
			this.downloads = this.downloads.filter(d => d.status !== 'completed');
		},
		pauseAll() {
			this.downloads.forEach(d => {
				if (d.status === 'downloading') {
					d.status = 'paused';
					d.speed = '';
				}
			});
		},
	},
};
</script>

<style scoped>
.download-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #1a1a1a;
	color: #fff;
}

.app-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	background-color: #252525;
	border-bottom: 1px solid #333;
}

.app-title {
	font-size: 14px;
	font-weight: 500;
}

.header-actions {
	display: flex;
	gap: 8px;
}

.action-btn {
	color: #888 !important;
	padding: 6px 10px !important;
}

.action-btn:hover {
	color: #fff !important;
	background-color: #333 !important;
}

.action-btn.remove:hover {
	color: #f56c6c !important;
}

.btn-text {
	margin-left: 4px;
	font-size: 12px;
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #555;
}

.empty-state p {
	margin-top: 16px;
	font-size: 14px;
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
	background-color: #252525;
	border-radius: 8px;
	margin-bottom: 8px;
	transition: background-color 0.2s;
}

.download-item:hover {
	background-color: #2a2a2a;
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
	background-color: #333;
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
}

.download-size {
	font-size: 12px;
	color: #888;
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
	color: #888;
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

.app-footer {
	padding: 12px 16px;
	background-color: #252525;
	border-top: 1px solid #333;
}

.footer-stats {
	display: flex;
	gap: 20px;
	font-size: 12px;
	color: #888;
}

:deep(.el-progress-bar__outer) {
	background-color: #333;
}

:deep(.el-progress__text) {
	color: #888;
	font-size: 12px !important;
}
</style>
