<template>
	<div class="app-container app-light" @click.self="clearSelection">
		<div class="app-toolbar">
			<div class="toolbar-left">
				<button class="toolbar-btn" :disabled="!canGoBack" @click="goBack">
					<sc-icon name="ms-arrow_back" :size="18" />
				</button>
				<button class="toolbar-btn" :disabled="!canGoForward" @click="goForward">
					<sc-icon name="ms-arrow_forward" :size="18" />
				</button>
				<button class="toolbar-btn" @click="goUp" :disabled="currentPath.length === 0">
					<sc-icon name="ms-arrow_upward" :size="18" />
				</button>
				<div class="path-bar">
					<span class="path-root" @click="goToRoot">
						<sc-icon name="ms-cloud" :size="16" />
						<span>云空间</span>
					</span>
					<span v-for="(item, index) in currentPath" :key="index" class="path-segment">
						<sc-icon name="ms-chevron_right" :size="16" />
						<span @click="goToPath(index)">{{ item.name }}</span>
					</span>
				</div>
			</div>
			<div class="toolbar-right">
				<el-input v-model="param.key" placeholder="搜索..." prefix-icon="el-icon-search" size="small"
					class="search-input" />
				<div class="view-switch">
					<button v-for="v in viewModes" :key="v.value" class="view-btn"
						:class="{ active: viewMode === v.value }" :title="v.label" @click="changeViewMode(v.value)">
						<sc-icon :name="v.icon" :size="18" />
					</button>
				</div>
			</div>
		</div>

		<div class="app-content">
			<div class="sidebar">
				<div class="sidebar-section">
					<div class="sidebar-title">云空间</div>
					<div v-for="item in stores" :key="item.id" class="sidebar-item"
						:class="{ active: currentFolder?.id === item.id }" @click="openFolder(item)">
						<sc-icon :name="item.icon" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
				<div class="sidebar-section">
					<div class="sidebar-title">快速访问</div>
					<div v-for="item in libs" :key="item.id" class="sidebar-item"
						:class="{ active: currentFolder?.id === item.id }" @click="openLib(item)">
						<sc-icon :name="item.icon" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
				<div class="sidebar-section">
					<div class="sidebar-title">我的目录</div>
					<div v-for="item in folderList" :key="item.id" class="sidebar-item"
						:class="{ active: currentFolder?.id === item.id }" @click="openFolder(item)">
						<sc-icon name="ms-folder" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
				<div class="sidebar-section">
					<div class="sidebar-title">我的设备</div>
					<div v-for="item in deviceList" :key="item.id" class="sidebar-item"
						:class="{ active: currentFolder?.id === item.id }" @click="openFolder(item)">
						<sc-icon name="ms-device" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
			</div>

			<div class="main-content" ref="contentRef" @click.self="clearSelection">
				<div v-if="viewMode === 'tiles'" class="view-tiles">
					<div v-for="item in fileList" :key="item.id" class="tile-item"
						:class="{ selected: selectedItems.includes(item.id) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)">
						<div class="tile-icon">
							<sc-icon :name="getFileIcon(item)" :size="48" />
						</div>
						<div class="tile-name">{{ item.name }}</div>
					</div>
				</div>

				<div v-else-if="viewMode === 'list'" class="view-list">
					<div v-for="item in fileList" :key="item.id" class="list-item"
						:class="{ selected: selectedItems.includes(item.id) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)">
						<sc-icon :name="getFileIcon(item)" :size="20" />
						<span class="list-name">{{ item.name }}</span>
					</div>
				</div>

				<div v-else-if="viewMode === 'details'" class="view-details">
					<div class="details-header">
						<div class="col-name" @click="sortBy('name')">
							<span>名称</span>
							<sc-icon v-if="sortField === 'name'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-date" @click="sortBy('modifiedDate')">
							<span>修改日期</span>
							<sc-icon v-if="sortField === 'modifiedDate'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-type" @click="sortBy('type')">
							<span>类型</span>
							<sc-icon v-if="sortField === 'type'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-size" @click="sortBy('size')">
							<span>大小</span>
							<sc-icon v-if="sortField === 'size'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
					</div>
					<div class="details-body">
						<div v-for="item in fileList" :key="item.id" class="details-row"
							:class="{ selected: selectedItems.includes(item.id) }"
							@click="handleItemClick($event, item)" @dblclick="handleItemDblClick(item)">
							<div class="col-name">
								<sc-icon :name="getFileIcon(item)" :size="18" />
								<span>{{ item.name }}</span>
							</div>
							<div class="col-date">{{ item.update_times }}</div>
							<div class="col-type">{{ item.typeLabel || (item.type === 10 ? '目录' : '文件') }}</div>
							<div class="col-size">{{ item.type === 10 ? '' : $TOOL.fileSizeFormat(item.size) }}</div>
						</div>
					</div>
				</div>

				<div v-if="fileList.length === 0" class="empty-state">
					<sc-icon name="ms-folder_open" :size="64" />
					<p>此文件夹为空</p>
				</div>
			</div>
		</div>

		<div class="app-statusbar">
			<span>{{ fileList.length }} 个项目</span>
			<span v-if="selectedItems.length > 0">· 已选中 {{ selectedItems.length }} 个项目</span>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Files',
	components: { scIcon },
	inject: ['openNasFileWithApp'],
	data() {
		return {
			param: {
				opt: '1',
				dir_id: '0',
				folder_id: '0',
				key: '',
			},
			viewMode: 'details',
			sortField: 'name',
			sortOrder: 'asc',
			selectedItems: [],
			currentFolder: null,
			currentPath: [],
			history: [],
			historyIndex: -1,
			viewModes: [
				{ value: 'tiles', label: '平铺', icon: 'ms-grid_view' },
				{ value: 'list', label: '列表', icon: 'ms-list' },
				{ value: 'details', label: '详细信息', icon: 'ms-table_rows' },
			],
			stores: [
				{ id: 'desktop', name: '桌面', icon: 'ms-desktop_windows', type: 'folder' },
				// { id: 'downloads', name: '下载', icon: 'ms-download', type: 'folder' },
			],
			libs: [
				// { id: 'desktop', name: '桌面', icon: 'ms-desktop_windows', type: 'folder' },
				// { id: 'downloads', name: '下载', icon: 'ms-download', type: 'folder' },
				{ id: 'documents', name: '文档', icon: 'ms-description', type: 'folder', kind: 30 },
				{ id: 'pictures', name: '图片', icon: 'ms-photo_library', type: 'folder', kind: 41 },
				{ id: 'music', name: '音乐', icon: 'ms-music_note', type: 'folder', kind: 42 },
				{ id: 'videos', name: '视频', icon: 'ms-videocam', type: 'folder', kind: 43 },
				{ id: 'office', name: '办公', icon: 'ms-window', type: 'folder', kind: 50 },
				{ id: 'archives', name: '归档', icon: 'ms-archive', type: 'folder', kind: 60 },
			],
			deviceList: [],
			folderList: [],
			fileList: [],
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
	mounted() {
		this.loadCfg();
		this.listFolder();
	},
	methods: {
		async listFolder() {
			var res = await this.$API.nascfgfolder.list.get("");
			if (res.code == 0) {
				this.folderList = res.data || [];
			}
			this.folderList = res.data || [];
		},
		async loadCfg() {
			this.viewMode = await this.$SCM.read_cfg("desktop_files_view_mode", 'details');
		},
		getFileIcon(item) {
			if (item.type === 10) {
				return 'ms-folder';
			}

			if (!item.name) {
				return;
			}
			const ext = item.name.split('.').pop().toLowerCase();
			const iconMap = {
				doc: 'ms-description', docx: 'ms-description',
				xls: 'ms-table_chart', xlsx: 'ms-table_chart',
				ppt: 'ms-slideshow', pptx: 'ms-slideshow',
				pdf: 'ms-picture_as_pdf',
				txt: 'ms-article',
				zip: 'ms-folder_zip', rar: 'ms-folder_zip', '7z': 'ms-folder_zip',
				jpg: 'ms-image', jpeg: 'ms-image', png: 'ms-image', gif: 'ms-image', bmp: 'ms-image',
				mp3: 'ms-audio_file', wav: 'ms-audio_file', flac: 'ms-audio_file',
				mp4: 'ms-video_file', avi: 'ms-video_file', mkv: 'ms-video_file', mov: 'ms-video_file',
				exe: 'ms-terminal',
				js: 'ms-code', ts: 'ms-code', vue: 'ms-code', html: 'ms-code', css: 'ms-code',
			};
			return iconMap[ext] || 'ms-insert_drive_file';
		},
		async changeViewMode(mode) {
			this.viewMode = mode;
			var cfgs = [];
			cfgs.push({ key: "desktop_files_view_mode", value: mode });
			await this.$SCM.save_cfg(cfgs);
		},
		handleItemClick(event, item) {
			if (event.ctrlKey || event.metaKey) {
				const index = this.selectedItems.indexOf(item.id);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				} else {
					this.selectedItems.push(item.id);
				}
			} else if (event.shiftKey && this.selectedItems.length > 0) {
				const items = this.filteredItems;
				const lastSelected = this.selectedItems[this.selectedItems.length - 1];
				const lastIndex = items.findIndex(i => i.id === lastSelected);
				const currentIndex = items.findIndex(i => i.id === item.id);
				const start = Math.min(lastIndex, currentIndex);
				const end = Math.max(lastIndex, currentIndex);
				this.selectedItems = items.slice(start, end + 1).map(i => i.id);
			} else {
				this.selectedItems = [item.id];
			}
		},
		handleItemDblClick(item) {
			if (item.type === 10) {
				this.openDir(item);
			} else {
				this.openDoc(item);
			}
		},
		async openLib(item) {
			this.currentPath = [];
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.param.opt = '2';
			// this.param.dir_id = '0';
			// this.param.folder_id = '0';
			this.param.kind = item.kind;
			var res = await this.$API.nasresfile.list.get(this.param);
			if (res.code != 200) {
				this.fileList = [];
				return;
			}

			this.fileList = res.data || [];
		},
		async openFolder(folder) {
			this.currentPath = [];
			this.currentPath.push(folder);
			this.currentFolder = folder;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: folder, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.param.opt = '1';
			this.param.dir_id = folder.res_id;
			// this.param.folder_id = '0';
			// this.param.kind = item.kind;
			var res = await this.$API.nasresfile.list.get(this.param);
			if (res.code != 200) {
				this.fileList = [];
				return;
			}

			this.fileList = res.data || [];
		},
		async openDir(item) {
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.param.dir_id = item.id;
			var res = await this.$API.nasresfile.list.get(this.param);
			if (res.code != 200) {
				this.fileList = [];
				return;
			}

			this.fileList = res.data || [];
		},
		/**
		 * 打开文档
		 * @param item 文档项
		 */
		openDocWithWeb(item) {
			const fileUrl = this.$SCM.getApiUrl('/Nas/Vs/' + item.id);
			window.open(fileUrl, '_blank');
		},
		/**
		 * 打开文档
		 * @param item 文档项	
		 */
		openDocWithApp(item) {
		},
		openDoc(item) {
			if (!this.openNasFileWithApp) {
				this.openDocWithWeb(item);
				return;
			}

			var kind = '';
			if (item.kind == 30) {
				kind = 'text';
			}
			else if (item.kind == 41) {
				kind = 'image';
			}
			else if (item.kind == 42) {
				kind = 'audio';
			}
			else if (item.kind == 43) {
				kind = 'video';
			} else {
				this.openDocWithWeb(item);
				return;
			}

			const files = this.fileList.filter(f => {
				return f.kind === item.kind;
			}).map(f => ({
				id: f.id,
				name: f.name,
				url: this.$SCM.getApiUrl('/Nas/Vs/' + f.id),
				size: f.size || 0,
			}));

			const index = files.findIndex(f => f.id === item.id);
			this.openNasFileWithApp(kind, files, index);
		},
		clearSelection() {
			this.selectedItems = [];
		},
		async goBack() {
			if (this.canGoBack) {
				this.historyIndex--;
				const state = this.history[this.historyIndex];
				this.currentFolder = state.folder;
				this.currentPath = [...state.path];
				this.selectedItems = [];
				await this.loadCurrentFolder();
			}
		},
		async goForward() {
			if (this.canGoForward) {
				this.historyIndex++;
				const state = this.history[this.historyIndex];
				this.currentFolder = state.folder;
				this.currentPath = [...state.path];
				this.selectedItems = [];
				await this.loadCurrentFolder();
			}
		},
		async goUp() {
			if (this.currentPath.length < 1) {
				return;
			}

			this.currentPath.pop();
			this.selectedItems = [];

			if (this.currentPath.length === 0) {
				this.currentFolder = null;
				this.param.dir_id = '0';
				this.param.folder_id = '0';
				this.history = this.history.slice(0, this.historyIndex + 1);
				this.history.push({ folder: null, path: [] });
				this.historyIndex = this.history.length - 1;
				this.fileList = [];
			} else {
				this.currentFolder = this.currentPath[this.currentPath.length - 1];
				this.history = this.history.slice(0, this.historyIndex + 1);
				this.history.push({ folder: this.currentFolder, path: [...this.currentPath] });
				this.historyIndex = this.history.length - 1;
				await this.loadCurrentFolder();
			}
		},
		async goToRoot() {
			this.currentPath = [];
			this.currentFolder = null;
			this.selectedItems = [];
			this.param.dir_id = '0';
			this.param.folder_id = '0';
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: null, path: [] });
			this.historyIndex = this.history.length - 1;
			this.fileList = [];
		},
		async goToPath(index) {
			this.currentPath = this.currentPath.slice(0, index + 1);
			this.currentFolder = this.currentPath[index];
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: this.currentFolder, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;
			await this.loadCurrentFolder();
		},
		async loadCurrentFolder() {
			if (this.currentFolder) {
				this.param.dir_id = this.currentFolder.id;
				this.param.folder_id = '0';
				var res = await this.$API.nasresfile.list.get(this.param);
				if (res.code == 200) {
					this.fileList = res.data || [];
				} else {
					this.fileList = [];
				}
			}
		},
		sortBy(field) {
			if (this.sortField === field) {
				this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				this.sortField = field;
				this.sortOrder = 'asc';
			}
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.toolbar-left {
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 1;
}

.toolbar-btn {
	width: 32px;
	height: 32px;
	border: none;
	background: transparent;
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #333;
	transition: background-color 0.15s;
}

.toolbar-btn:hover:not(:disabled) {
	background-color: #e0e0e0;
}

.toolbar-btn:disabled {
	color: #bbb;
	cursor: not-allowed;
}

.path-bar {
	display: flex;
	align-items: center;
	padding: 4px 8px;
	background-color: #fff;
	border: 1px solid #ddd;
	border-radius: 4px;
	flex: 1;
	font-size: 13px;
	overflow: hidden;
}

.path-root {
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
	padding: 2px 4px;
	border-radius: 3px;
	color: #333;
}

.path-root:hover {
	background-color: #f0f0f0;
}

.path-segment {
	display: flex;
	align-items: center;
	color: #999;
}

.path-segment span:last-child {
	cursor: pointer;
	padding: 2px 4px;
	border-radius: 3px;
}

.path-segment span:last-child:hover {
	background-color: #f0f0f0;
	color: #333;
}

.toolbar-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

.search-input {
	width: 160px;
	font-size: 13px;
}

.search-input :deep(.el-input__wrapper) {
	padding: 3px 8px;
	box-shadow: 0 0 0 1px #ddd;
	background-color: #fff;
}

.search-input :deep(.el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #ccc;
}

.search-input :deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 1px #409eff;
}

.view-switch {
	display: flex;
	border: 1px solid #ddd;
	border-radius: 4px;
	overflow: hidden;
}

.view-btn {
	width: 32px;
	height: 28px;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #666;
	transition: background-color 0.15s;
}

.view-btn:hover {
	background-color: #f0f0f0;
}

.view-btn.active {
	background-color: rgba(64, 158, 255, 0.15);
	color: #409eff;
}

.app-content {
	flex: 1;
	display: flex;
	overflow: hidden;
}

.sidebar {
	width: 200px;
	border-right: 1px solid #e5e5e5;
	background-color: #f9f9f9;
	overflow-y: auto;
	padding: 8px 0;
}

.sidebar-section {
	margin-bottom: 8px;
}

.sidebar-title {
	padding: 8px 16px 4px;
	font-size: 12px;
	font-weight: 600;
	color: #999;
}

.sidebar-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 24px;
	cursor: pointer;
	font-size: 13px;
	color: #333;
	transition: background-color 0.15s;
}

.sidebar-item:hover {
	background-color: #f0f0f0;
}

.sidebar-item.active {
	background-color: rgba(64, 158, 255, 0.15);
	color: #409eff;
}

.main-content {
	flex: 1;
	overflow: auto;
	padding: 8px;
}

.view-tiles {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
	gap: 4px;
}

.tile-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 12px 8px;
	border-radius: 4px;
	cursor: pointer;
	text-align: center;
	transition: background-color 0.15s;
}

.tile-item:hover {
	background-color: #f5f5f5;
}

.tile-item.selected {
	background-color: rgba(64, 158, 255, 0.15);
}

.tile-icon {
	margin-bottom: 4px;
	color: #ffb900;
}

.tile-item.selected .tile-icon {
	color: #409eff;
}

.tile-name {
	font-size: 12px;
	color: #333;
	word-break: break-word;
	line-height: 1.3;
	max-width: 90px;
}

.view-list {
	display: flex;
	flex-direction: column;
}

.list-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.15s;
}

.list-item:hover {
	background-color: #f5f5f5;
}

.list-item.selected {
	background-color: rgba(64, 158, 255, 0.15);
}

.list-name {
	font-size: 13px;
	color: #333;
}

.view-details {
	display: flex;
	flex-direction: column;
}

.details-header {
	display: flex;
	padding: 8px 12px;
	background-color: #f5f5f5;
	border-bottom: 1px solid #e5e5e5;
	font-size: 12px;
	font-weight: 500;
	color: #999;
}

.details-header>div {
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
	user-select: none;
}

.details-header>div:hover {
	color: #333;
}

.col-name {
	flex: 2;
	min-width: 200px;
	margin: 0 6px;
}

.col-name span {
	word-break: break-all;
}

.col-date {
	min-width: 140px;
	margin: 0 6px;
}

.col-type {
	min-width: 100px;
	margin: 0 6px;
}

.col-size {
	width: 80px;
	text-align: right;
	margin: 0 6px;
}

.details-body {
	flex: 1;
}

.details-row {
	display: flex;
	align-items: center;
	padding: 6px 12px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.15s;
}

.details-row:hover {
	background-color: #f5f5f5;
}

.details-row.selected {
	background-color: rgba(64, 158, 255, 0.15);
}

.details-row .col-name {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: #333;
}

.details-row .col-date,
.details-row .col-type {
	font-size: 12px;
	color: #666;
}

.details-row .col-size {
	font-size: 12px;
	color: #666;
	text-align: right;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #999;
}

.empty-state p {
	margin-top: 12px;
	font-size: 14px;
}

.app-statusbar {
	display: flex;
	align-items: center;
	padding: 4px 12px;
	background-color: #f9f9f9;
	border-top: 1px solid #e5e5e5;
	font-size: 12px;
	color: #666;
}
</style>
