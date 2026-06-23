<template>
	<div class="app-container app-light">
		<div class="app-toolbar">
			<span class="app-header-title">下载管理</span>
			<div class="header-spacer"></div>
			<div class="header-actions">
				<el-button text size="small" class="action-btn" @click="loadDownloads" tooltip="刷新下载列表">
					<sc-icon name="ms-refresh" :size="16" />
					<span class="btn-text">刷新</span>
				</el-button>
				<el-button text size="small" @click="clearCompleted" tooltip="清除已完成下载">
					<sc-icon name="ms-delete_sweep" :size="16" />
					<span class="btn-text">清除已完成</span>
				</el-button>
				<el-button text size="small" @click="pauseAll" tooltip="全部暂停下载">
					<sc-icon name="ms-pause" :size="16" />
					<span class="btn-text">全部暂停</span>
				</el-button>
				<el-button type="primary" size="small" @click="showAddDialog = true" tooltip="新建下载">
					<sc-icon name="ms-add" :size="16" />
					<span class="btn-text">新建下载</span>
				</el-button>
			</div>
		</div>

		<div v-if="downloads.length === 0" class="app-empty">
			<sc-icon name="ms-download" :size="64" />
			<p>暂无下载任务</p>
			<span class="hint">点击上方"新建下载"添加任务</span>
		</div>

		<div v-else class="download-list">
			<div v-for="download in downloads" :key="download.id" class="download-item"
				:class="{ completed: download.result === 2, error: download.result === 1 }">
				<div class="download-icon">
					<sc-icon :name="getFileIcon(download.name)" :size="32" />
				</div>
				<div class="download-info">
					<div class="info-top">
						<span class="download-name">{{ download.name }}</span>
						<span class="download-size">{{ download.size }}</span>
					</div>
					<div class="download-progress">
						<el-progress :percentage="download.progress" :status="getProgressStatus(download.result)"
							:stroke-width="4" />
					</div>
					<div class="info-bottom">
						<span class="download-speed" v-if="download.handle === 3">
							{{ download.speed }}
						</span>
						<span class="download-status" :class="getDownloadStatus(download.handle, download.result)">
							{{ download.handle_name }}
						</span>
					</div>
				</div>
				<div class="download-actions">
					<el-button v-if="download.handle === 1 || download.handle === 2" text size="small"
						class="action-btn" @click="resumeDownload(download.id)">
						<sc-icon name="ms-play_arrow" :size="16" />
					</el-button>
					<el-button else-if="download.handle === 3" text size="small" class="action-btn"
						@click="pauseDownload(download.id)">
						<sc-icon name="ms-pause" :size="16" />
					</el-button>
					<el-button else-if="download.result === 1" text size="small" class="action-btn"
						@click="retryDownload(download.id)">
						<sc-icon name="ms-refresh" :size="16" />
					</el-button>
					<el-button else-if="download.result === 2" text size="small" class="action-btn"
						@click="openFile(download.id)" tooltip="打开文件">
						<sc-icon name="ms-folder_open" :size="16" />
					</el-button>
					<el-button text size="small" class="action-btn remove" @click="removeDownload(download.id)">
						<sc-icon name="ms-close" :size="16" />
					</el-button>
				</div>
			</div>
		</div>

		<div class="app-footer">
			<div class="footer-stats">
				<span class="stat-item">
					<sc-icon name="ms-download" :size="14" />
					<span>下载中: {{ downloadingCount }}</span>
				</span>
				<span class="stat-divider"></span>
				<span class="stat-item">
					<sc-icon name="ms-check_circle" :size="14" />
					<span>已完成: {{ completedCount }}</span>
				</span>
				<span class="stat-divider"></span>
				<span class="stat-item">
					<sc-icon name="ms-error" :size="14" />
					<span>失败: {{ errorCount }}</span>
				</span>
			</div>
		</div>

		<el-dialog v-model="showAddDialog" title="新建下载" width="480px" :modal-append-to-body="false" draggable>
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
				<el-form-item label="下载链接" prop="url">
					<el-input v-model="addForm.url" placeholder="请输入下载链接" clearable />
				</el-form-item>
				<el-form-item label="保存名称" prop="name">
					<el-input v-model="addForm.name" placeholder="自动检测文件名" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showAddDialog = false">取消</el-button>
				<el-button type="primary" @click="addDownload">确认添加</el-button>
			</template>
		</el-dialog>
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
			showAddDialog: false,
			addForm: {
				url: '',
				name: '',
			},
			addFormRules: {
				url: [
					{ required: true, message: '请输入下载链接', trigger: 'blur' },
					{ type: 'url', message: '请输入有效的URL', trigger: 'blur' },
				],
			},
			handle_list: [],
			result_list: [],
			pollingTimer: null,
			pollingInterval: 1000,
		};
	},
	mounted() {
		this.$SCM.list_dic(this.handle_list, 'handle', false);
		this.$SCM.list_dic(this.result_list, 'result', false);
		this.loadDownloads();
	},
	beforeUnmount() {
		this.stopPolling();
	},
	computed: {
		downloadingCount() {
			return this.downloads.filter(d => d.handle === 3).length;
		},
		completedCount() {
			return this.downloads.filter(d => d.result === 2).length;
		},
		errorCount() {
			return this.downloads.filter(d => d.result === 1).length;
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
		getProgressStatus(result) {
			if (result === 2) return 'success';
			if (result === 1) return 'exception';
			return '';
		},
		async loadDownloads() {
			try {
				var res = await this.$API.nasdownload.list.get();
				if (res.code == 200) {
					this.downloads = (res.data || []).map(item => this.mapDownloadItem(item));
					this.startPolling();
				}
			} catch (error) {
				console.error('加载下载列表失败:', error);
			}
		},
		mapDownloadItem(item) {
			return {
				id: item.id,
				url: item.url,
				name: item.file_name || '未知文件',
				size: this.formatSize(item.total_size),
				progress: item.progress || 0,
				speed: item.speed ? this.formatSpeed(item.speed) : '',
				handle: item.handle,
				result: item.result,
				handle_name: this.$SCM.get_dic_names(this.handle_list, item.handle, '未知'),
				result_name: this.$SCM.get_dic_names(this.result_list, item.result, '未知'),
			};
		},
		startPolling() {
			if (this.pollingTimer) {
				return;
			}
			this.pollingTimer = setInterval(() => {
				this.pollDownloadProgress();
			}, this.pollingInterval);
		},
		stopPolling() {
			if (this.pollingTimer) {
				clearInterval(this.pollingTimer);
				this.pollingTimer = null;
			}
		},
		async pollDownloadProgress() {
			console.log('轮询下载进度');
			if (!this.downloads || this.downloads.length === 0) {
				this.stopPolling();
				return;
			}
			const downloadingIds = this.downloads
				.filter(d => d.handle === 3)
				.map(d => d.id);
			console.log('当前下载列表:downloadingIds.length', downloadingIds.length);
			if (downloadingIds.length === 0) {
				this.stopPolling();
				return;
			}
			try {
				for (const id of downloadingIds) {
					await this.fetchDownloadStatus(id);
				}
			} catch (error) {
				console.error('轮询下载进度失败:', error);
			}
		},
		async fetchDownloadStatus(id) {
			try {
				var res = await this.$API.nasdownload.model.get(id);
				if (res.code == 200) {
					const status = res.data || {};
					if (status && status.id) {
						this.updateDownloadItem(status);
					}
					else {
						this.$message.warning(res.message || '加载下载状态失败');
					}
				}
			} catch (error) {
				console.error('加载下载状态失败:', error);
				return {};
			}
		},
		updateDownloadItem(status) {
			const index = this.downloads.findIndex(d => d.id === status.id);
			if (index !== -1) {
				this.downloads[index] = {
					...this.downloads[index],
					progress: status.progress || this.downloads[index].progress,
					speed: status.speed ? this.formatSpeed(status.speed) : this.downloads[index].speed,
					size: status.total_size ? this.formatSize(status.total_size) : this.downloads[index].size,
					handle: status.handle !== undefined ? status.handle : this.downloads[index].handle,
					handle_name: status.handle_name || this.downloads[index].handle_name,
					result: status.result !== undefined ? status.result : this.downloads[index].result,
				};
			}
		},
		getDownloadStatus(handle, result) {
			if (handle === 1) return '';
			if (handle === 2) return 'downloading';
			if (handle === 3) return 'paused';
			if (result === 1) return 'error';
			if (result === 2) return 'completed';
			return '';
		},
		formatSize(size) {
			console.log('formatSize', size);
			if (!size) return '';
			return this.$TOOL.fileSizeFormat(size);
		},
		formatSpeed(speed) {
			if (!speed) return '';
			return this.$TOOL.fileSizeFormat(speed) + '/s';
		},
		async pauseDownload(id) {
			try {
				var res = await this.$API.nasdownload.pause.get(id);
				if (res.code == 200) {
					await this.loadDownloads();
				} else {
					this.$message.warning(res.message || '暂停失败');
				}
			} catch (error) {
				this.$message.error('暂停失败');
			}
		},
		async resumeDownload(id) {
			try {
				var res = await this.$API.nasdownload.resume.get(id);
				if (res.code == 200) {
					await this.loadDownloads();
				} else {
					this.$message.warning(res.message || '恢复失败');
				}
			} catch (error) {
				this.$message.error('恢复失败');
			}
		},
		async removeDownload(id) {
			try {
				var res = await this.$API.nasdownload.status.post({ ids: [id] });
				if (res.code == 200) {
					await this.loadDownloads();
				} else {
					this.$message.warning(res.message || '删除失败');
				}
			} catch (error) {
				this.$message.error('删除失败');
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
			try {
				var res = await this.$API.nasdownload.resume.get(id);
				if (res.code == 200) {
					await this.loadDownloads();
				} else {
					this.$message.warning(res.message || '重试失败');
				}
			} catch (error) {
				this.$message.error('重试失败');
			}
		},
		async clearCompleted() {
			var ids = [];
			for (const item of this.downloads) {
				if (item.result === 2) {
					ids.push(item.id);
				}
			}
			if (ids.length > 0) {
				await this.$API.nasdownload.status.post({ ids });
			}
			await this.loadDownloads();
		},
		async pauseAll() {
			for (const item of this.downloads) {
				if (item.handle === 3) {
					await this.$API.nasdownload.pause.get(item.id);
				}
			}
			await this.loadDownloads();
		},
		async addDownload() {
			if (!this.$refs.addFormRef) return;
			this.$refs.addFormRef.validate(async (valid) => {
				if (valid) {
					try {
						var res = await this.$API.nasdownload.add.post({
							url: this.addForm.url,
							name: this.addForm.name || undefined,
						});
						if (res.code == 200) {
							this.$message.success('添加成功');
							this.showAddDialog = false;
							this.addForm = { url: '', name: '' };
							await this.loadDownloads();
						} else {
							this.$message.warning(res.message || '添加失败');
						}
					} catch (error) {
						this.$message.error('添加失败');
					}
				}
			});
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.header-spacer {
	flex: 1;
}

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
	background-color: var(--color-bg-secondary);
	border-radius: 8px;
	margin-bottom: 8px;
	transition: background-color 0.2s;
}

.download-item:hover {
	background-color: var(--color-bg-hover);
}

.download-item.completed {
	border-left: 3px solid var(--color-success);
}

.download-item.error {
	border-left: 3px solid var(--color-danger);
}

.download-icon {
	width: 48px;
	height: 48px;
	background-color: var(--color-bg);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--color-primary);
	flex-shrink: 0;
	border: 1px solid var(--color-border-light);
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
	color: var(--color-text);
}

.download-size {
	font-size: 12px;
	color: var(--color-text-tertiary);
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
	color: var(--color-primary);
}

.download-status {
	font-size: 12px;
	color: var(--color-text-tertiary);
}

.download-status.paused {
	color: var(--color-warning);
}

.download-status.downloading {
	color: var(--color-primary);
}

.download-status.completed {
	color: var(--color-success);
}

.download-status.error {
	color: var(--color-danger);
}

.download-actions {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
}

.action-btn {
	padding: 6px;
	color: var(--color-text-secondary);
}

.action-btn:hover {
	color: var(--color-primary);
}

.action-btn.remove:hover {
	color: var(--color-danger);
}

.app-footer {
	padding: 12px 16px;
	background-color: var(--color-bg-secondary);
	border-top: 1px solid var(--color-border-light);
}

.footer-stats {
	display: flex;
	align-items: center;
	gap: 16px;
	font-size: 12px;
	color: var(--color-text-tertiary);
}

.stat-item {
	display: flex;
	align-items: center;
	gap: 4px;
}

.stat-divider {
	width: 1px;
	height: 16px;
	background-color: var(--color-border-dark);
}

:deep(.el-progress-bar__outer) {
	background-color: var(--color-border-light);
}

:deep(.el-progress__text) {
	color: var(--color-text-tertiary);
	font-size: 12px !important;
}

:deep(.el-dialog__body) {
	padding: 20px;
}
</style>