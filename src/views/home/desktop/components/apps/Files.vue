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
					class="search-input" clearable />
				<div class="view-switch">
					<button v-for="v in viewModes" :key="v.value" class="view-btn"
						:class="{ active: viewMode === v.value }" :title="v.label" @click="changeViewMode(v.value)">
						<sc-icon :name="v.icon" :size="18" />
					</button>
				</div>
				<div class="action-buttons">
					<button class="toolbar-btn" title="新建文件夹" @click="createFolder">
						<sc-icon name="ms-create_new_folder" :size="18" />
					</button>
					<button class="toolbar-btn" title="上传文件" @click="openUploadDialog">
						<sc-icon name="ms-upload" :size="18" />
					</button>
					<button class="toolbar-btn" title="下载" :disabled="selectedItems.length !== 1" @click="downloadFile">
						<sc-icon name="ms-download" :size="18" />
					</button>
					<button class="toolbar-btn" title="删除" :disabled="selectedItems.length === 0"
						@click="deleteSelected">
						<sc-icon name="ms-delete" :size="18" />
					</button>
				</div>
			</div>
		</div>

		<div class="app-content">
			<div class="sidebar">
				<div class="sidebar-section">
					<el-tree ref="folderTree" class="folder-tree" node-key="id" :data="folderTreeData"
						:props="treeProps" :highlight-current="true" :expand-on-click-node="false"
						@node-click="handleFolderTreeClick" @node-contextmenu.prevent="showFolderContextMenu">
						<template #default="{ node, data }">
							<span class="tree-node">
								<sc-icon :name="data.type === 10 ? 'ms-folder' : 'ms-folder_open'" :size="16" />
								<span class="tree-label">{{ node.label }}</span>
								<span class="tree-actions" v-if="data.type === 10">
									<sc-icon name="ms-delete" :size="14"
										@click.stop="deleteFolderFromTree(node, data)" />
								</span>
							</span>
						</template>
					</el-tree>
				</div>
			</div>

			<div class="main-content" ref="contentRef" @click.self="clearSelection">
				<div v-if="viewMode === 'tiles'" class="view-tiles">
					<div v-for="item in filteredFileList" :key="item.id" class="tile-item"
						:class="{ selected: selectedItems.includes(item.id) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)" @contextmenu.prevent="showContextMenu($event, item)">
						<div class="tile-icon">
							<sc-icon :name="getFileIcon(item)" :size="48" />
						</div>
						<div class="tile-name">{{ item.name }}</div>
					</div>
				</div>

				<div v-else-if="viewMode === 'list'" class="view-list">
					<div v-for="item in filteredFileList" :key="item.name" class="list-item"
						:class="{ selected: selectedItems.includes(item.name) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)" @contextmenu.prevent="showContextMenu($event, item)">
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
						<div v-for="item in filteredFileList" :key="item.id" class="details-row"
							:class="{ selected: selectedItems.includes(item.id) }"
							@click="handleItemClick($event, item)" @dblclick="handleItemDblClick(item)"
							@contextmenu.prevent="showContextMenu($event, item)">
							<div class="col-name">
								<sc-icon :name="getFileIcon(item)" :size="18" />
								<span>{{ item.name }}</span>
							</div>
							<div class="col-date">{{ item.update_times }}</div>
							<div class="col-type">{{ item.typeLabel || (item.kind === 10 ? '目录' : '文件') }}</div>
							<div class="col-size">{{ item.kind === 30 ? '' : $TOOL.fileSizeFormat(item.size) }}</div>
						</div>
					</div>
				</div>

				<div v-if="filteredFileList.length === 0" class="empty-state">
					<sc-icon :name="param.key ? 'ms-search_off' : 'ms-folder_open'" :size="64" />
					<p v-if="param.key">未找到匹配 "{{ param.key }}" 的文件</p>
					<p v-else>此文件夹为空</p>
					<button v-if="!param.key" class="upload-btn" @click="openUploadDialog">
						<sc-icon name="ms-upload" :size="24" />
						<span>上传文件</span>
					</button>
				</div>
			</div>
		</div>

		<div class="app-statusbar">
			<span>{{ filteredFileList.length }} 个项目</span>
			<span v-if="param.key && filteredFileList.length < fileList.length">· 共 {{ fileList.length }} 个，筛选 {{ filteredFileList.length }} 个</span>
			<span v-if="selectedItems.length > 0">· 已选中 {{ selectedItems.length }} 个项目</span>
		</div>

		<!-- 右键菜单 -->
		<div v-if="contextMenu.visible" class="context-menu" :style="contextMenu.style" @click.self="hideContextMenu">
			<div class="context-item" @click="openDocFromMenu" v-if="contextMenu.item && contextMenu.item.kind !== 10">
				<sc-icon name="ms-open_in_new" :size="16" />
				<span>打开</span>
			</div>
			<div class="context-item" @click="downloadFromMenu" v-if="contextMenu.item && contextMenu.item.kind !== 10">
				<sc-icon name="ms-download" :size="16" />
				<span>下载</span>
			</div>
			<div class="context-item" @click="previewFromMenu" v-if="contextMenu.item && contextMenu.item.kind !== 10">
				<sc-icon name="ms-remove_red_eye" :size="16" />
				<span>预览</span>
			</div>
			<div class="context-divider" v-if="contextMenu.item"></div>
			<div class="context-item" @click="deleteFromMenu" v-if="contextMenu.item">
				<sc-icon name="ms-delete" :size="16" />
				<span>删除</span>
			</div>
		</div>

		<!-- 上传对话框 -->
		<el-dialog v-model="uploadDialogVisible" title="上传文件" width="500px" @close="uploadDialogVisible = false">
			<el-upload ref="uploadRef" class="upload-demo" drag :auto-upload="false" :http-request="handleUpload">
				<sc-icon name="ms-cloud_upload" :size="48" />
				<div class="upload-text">
					<p>将文件拖到此处上传</p>
					<p class="upload-hint">支持拖拽或点击上传，单个文件不超过100MB</p>
				</div>
			</el-upload>
			<div slot="footer" class="dialog-footer">
				<el-button @click="uploadDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="submitUpload">开始上传</el-button>
			</div>
		</el-dialog>

		<!-- 新建文件夹对话框 -->
		<el-dialog v-model="newFolderDialogVisible" title="新建文件夹" width="400px" @close="newFolderDialogVisible = false">
			<el-form :model="newFolderForm" ref="newFolderFormRef" label-width="100px">
				<el-form-item label="文件夹名称" prop="name">
					<el-input v-model="newFolderForm.name" placeholder="请输入文件夹名称" />
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="newFolderDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="createNewFolder">确定</el-button>
			</div>
		</el-dialog>

		<!-- 目录树右键菜单 -->
		<div v-if="folderContextMenu.visible" class="context-menu" :style="folderContextMenu.style"
			@click="hideFolderContextMenu">
			<div class="context-item" @click.stop="openFolder(folderContextMenu.item)">
				<sc-icon name="ms-folder_open" :size="16" />
				<span>打开</span>
			</div>
			<div class="context-divider"></div>
			<div class="context-item" @click.stop="createFolderInTree">
				<sc-icon name="ms-create_new_folder" :size="16" />
				<span>新建文件夹</span>
			</div>
			<div class="context-divider"></div>
			<div class="context-item"
				@click.stop="deleteFolderFromTree(folderContextMenu.node, folderContextMenu.item)">
				<sc-icon name="ms-delete" :size="16" />
				<span>删除</span>
			</div>
		</div>

		<!-- 图片预览 -->
		<el-image-viewer v-if="imageViewerVisible" :url-list="previewImages" @close="imageViewerVisible = false" />

		<!-- 文本预览 -->
		<div v-if="textViewerVisible" class="text-viewer-mask" @click="textViewerVisible = false">
			<div class="text-viewer" @click.stop>
				<div class="text-viewer-header">
					<span class="text-viewer-title">{{ currentPreviewFile?.name }}</span>
					<button class="text-viewer-close" @click="textViewerVisible = false">
						<sc-icon name="ms-close" :size="18" />
					</button>
				</div>
				<div class="text-viewer-content">
					<pre>{{ previewText }}</pre>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import tool from '@/utils/tool.js';

export default {
	name: 'Files',
	components: { scIcon },
	inject: ['openNasFileWithApp'],
	data() {
		return {
			param: {
				path: '/',
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
			folderList: [],
			fileList: [],
			contextMenu: {
				visible: false,
				item: null,
				style: { left: '0px', top: '0px' },
			},
			folderContextMenu: {
				visible: false,
				item: null,
				node: null,
				style: { left: '0px', top: '0px' },
			},
			treeProps: {
				label: 'name',
				children: 'children',
			},
			folderTreeData: [],
			uploadDialogVisible: false,
			newFolderDialogVisible: false,
			newFolderForm: { name: '', parentId: null },
			imageViewerVisible: false,
			previewImages: [],
			textViewerVisible: false,
			currentPreviewFile: null,
			previewText: '',
		};
	},
	computed: {
		canGoBack() {
			return this.historyIndex > 0;
		},
		canGoForward() {
			return this.historyIndex < this.history.length - 1;
		},
		filteredFileList() {
			const keyword = this.param.key.trim().toLowerCase();
			if (!keyword) {
				return this.fileList;
			}
			return this.fileList.filter(item => item.name.toLowerCase().includes(keyword));
		},
	},
	mounted() {
		this.loadCfg();
		this.loadFolderTree();
	},
	methods: {
		async loadFolderTree() {
			var root = { id: 'root', name: '根目录', path: '/' };
			console.log('loadFolderTree', root.path);
			var res = await this.$API.scmsysfile.folders.get({ path: root.path });
			if (res.code == 200) {
				root.children = res.data || [];
			}
			this.buildFolderTree(root.children, root.path);
			this.folderTreeData = [root];
		},
		buildFolderTree(folders, path) {
			return folders.map(folder => {
				folder.path = path + folder.name;
				this.buildFolderTree(folder.children, folder.path + '/');
				return folder;
			});
		},
		async loadCfg() {
			this.viewMode = await this.$SCM.read_cfg("desktop_files_view_mode", 'details');
		},
		getFileIcon(item) {
			if (item.kind === 10) {
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
			this.hideContextMenu();
			if (event.ctrlKey || event.metaKey) {
				const index = this.selectedItems.indexOf(item.id);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				} else {
					this.selectedItems.push(item.id);
				}
			} else if (event.shiftKey && this.selectedItems.length > 0) {
				const items = this.fileList;
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
			this.hideContextMenu();
			if (item.kind === 10) {
				this.openDir(item);
			} else {
				this.openDoc(item);
			}
		},
		showContextMenu(event, item) {
			this.contextMenu.item = item;
			this.contextMenu.style = {
				left: event.clientX + 'px',
				top: event.clientY + 'px',
			};
			this.contextMenu.visible = true;
		},
		hideContextMenu() {
			this.contextMenu.visible = false;
			this.contextMenu.item = null;
		},
		openDocFromMenu() {
			const item = this.contextMenu.item;
			this.hideContextMenu();
			this.openDoc(item);
		},
		downloadFromMenu() {
			const item = this.contextMenu.item;
			this.hideContextMenu();
			this.downloadFile(item);
		},
		previewFromMenu() {
			const item = this.contextMenu.item;
			this.hideContextMenu();
			this.previewFile(item);
		},
		deleteFromMenu() {
			const item = this.contextMenu.item;
			this.hideContextMenu();
			this.deleteFile(item);
		},
		async openFolder(folder) {
			this.currentPath = [];
			this.currentPath.push(folder);
			this.currentFolder = folder;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: folder, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			if (this.$refs.folderTree) {
				this.$refs.folderTree.setCurrentKey(folder.id);
			}

			this.param.path = folder.path || '/';
			var res = await this.$API.scmsysfile.files.get(this.param);
			if (res.code != 200) {
				this.fileList = [];
				return;
			}

			this.fileList = this.transformFileList(res.data || []);
		},
		transformFileList(data) {
			return data.map(item => ({
				...item,
				id: item.name,
				type: item.kind === 10 ? 10 : 0,
				size: parseInt(item.length) || 0,
				typeLabel: item.kind === 10 ? '目录' : '文件',
				lastModified: item.lastWriteTime
			}));
		},
		async openDir(item) {
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.param.path = item.path || '/';
			var res = await this.$API.scmsysfile.files.get(this.param);
			if (res.code != 200) {
				this.fileList = [];
				return;
			}

			this.fileList = res.data || [];
		},
		openDocWithWeb(url) {
			window.open(url, '_blank');
		},
		openDoc(item) {
			var url = this.$SCM.getDataUrl(item.uri);
			if (item.kind === 41) {
				this.previewImages = [url];
				this.imageViewerVisible = true;
				return;
			}

			this.openDocWithWeb(url);
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
				this.param.path = this.currentFolder.path || '/';
				var res = await this.$API.scmsysfile.files.get(this.param);
				if (res.code == 200) {
					// this.fileList = res.data || [];
					this.fileList = this.transformFileList(res.data || []);
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
		openUploadDialog() {
			if (this.$refs.uploadRef) {
				this.$refs.uploadRef.clearFiles();
			}
			this.uploadDialogVisible = true;
		},
		async handleUpload(param) {
			const data = new FormData();
			data.append('file', param.file);
			data.append('filesize', param.file.size);
			data.append('filetime', param.file.lastModified);
			data.append('type', '1');
			data.append('file', param.file);
			data.append('path', this.currentFolder?.path || '/');

			let config = {
				headers: { 'Content-Type': 'multipart/form-data' },
				timeout: 60000,
			};

			try {
				var res = await this.$API.scmsysfile.upload.post(data, config);
				if (res.code == 200) {
					this.$message.success('上传成功');
					await this.loadCurrentFolder();
					param.onSuccess();
				} else {
					this.$message.error(res.message || '上传失败');
					param.onError();
				}
			} catch (error) {
				this.$message.error('上传失败');
				param.onError();
			}
		},
		submitUpload() {
			this.$refs.uploadRef.submit();
		},
		createFolder() {
			this.newFolderForm = { name: '' };
			this.newFolderDialogVisible = true;
		},
		async createNewFolder() {
			if (!this.newFolderForm.name.trim()) {
				this.$message.warning('请输入文件夹名称');
				return;
			}

			try {
				var data = {
					name: this.newFolderForm.name,
					path: this.currentFolder?.path || '/',
				}
				var res = await this.$API.scmsysfile.addFolder.post(data);

				if (res.code == 200) {
					this.$message.success('创建成功');
					this.newFolderDialogVisible = false;
					if (!this.currentFolder.children) {
						this.currentFolder.children = [];
					}
					this.currentFolder.children.push(data);
					data.path = data.path + '/' + data.name;
					// await this.loadCurrentFolder();
				} else {
					this.$message.error(res.message || '创建失败');
				}
			} catch (error) {
				this.$message.error('创建失败');
			}
		},
		createFolderInTree() {
			this.newFolderForm = { name: '', parentId: null };
			this.newFolderDialogVisible = true;
		},
		handleFolderTreeClick(data) {
			this.openFolder(data);
			this.$refs.folderTree.setCurrentKey(data.id);
		},
		showFolderContextMenu(event, node, data) {
			this.folderContextMenu.item = data;
			this.folderContextMenu.node = node;
			this.folderContextMenu.style = {
				left: event.clientX + 'px',
				top: event.clientY + 'px',
			};
			this.folderContextMenu.visible = true;
		},
		hideFolderContextMenu() {
			this.folderContextMenu.visible = false;
			this.folderContextMenu.item = null;
			this.folderContextMenu.node = null;
		},
		async deleteFolderFromTree(node, data) {
			this.$confirm(
				`确定删除文件夹 "${data.name}" 及其所有子目录和文件吗？`,
				'提示',
				{
					type: 'warning',
					confirmButtonText: '确定',
					cancelButtonText: '取消',
				}
			).then(async () => {
				try {
					var res = await this.$API.scmsysfile.delFolder.delete(data.path);
					if (res.code == 200) {
						this.$message.success('删除成功');
						await this.loadFolderTree();
					} else {
						this.$message.error(res.message || '删除失败');
					}
				} catch (error) {
					this.$message.error('删除失败');
				}
			}).catch(() => { });
		},
		async downloadFile(item) {
			const fileItem = item || this.fileList.find(f => f.id === this.selectedItems[0]);
			if (!fileItem || fileItem.type === 10) {
				this.$message.warning('请选择一个文件');
				return;
			}

			const url = this.$SCM.getDataUrl(fileItem.uri);
			try {
				await tool.downloadFile(url, fileItem.name);
			} catch (error) {
				this.$message.error('下载失败');
			}
		},
		async deleteSelected() {
			if (this.selectedItems.length === 0) {
				this.$message.warning('请选择要删除的项目');
				return;
			}

			const itemsToDelete = this.fileList.filter(f => this.selectedItems.includes(f.id));
			const names = itemsToDelete.map(f => f.name).join(', ');

			this.$confirm(
				`确定删除选中的项目：${names}？`,
				'提示',
				{
					type: 'warning',
					confirmButtonText: '确定',
					cancelButtonText: '取消',
				}
			).then(async () => {
				try {
					for (const item of itemsToDelete) {
						if (item.kind === 30) {
							await this.$API.scmsysfile.delFolder.delete(item.path);
						} else {
							await this.$API.scmsysfile.delFile.delete(item.uri);
						}
					}
					this.$message.success('删除成功');
					this.selectedItems = [];
					await this.loadCurrentFolder();
				} catch (error) {
					this.$message.error('删除失败');
				}
			}).catch(() => { });
		},
		async deleteFile(item) {
			this.$confirm(
				`确定删除 "${item.name}"？`,
				'提示',
				{
					type: 'warning',
					confirmButtonText: '确定',
					cancelButtonText: '取消',
				}
			).then(async () => {
				try {
					var res;
					if (item.kind === 30) {
						res = await this.$API.scmsysfile.delFolder.delete(item.path);
					} else {
						res = await this.$API.scmsysfile.delFile.delete(item.uri);
					}
					if (res.code == 200) {
						this.$message.success('删除成功');
						await this.loadCurrentFolder();
					} else {
						this.$message.error(res.message || '删除失败');
					}
				} catch (error) {
					this.$message.error('删除失败');
				}
			}).catch(() => { });
		},
		async previewFile(item) {
			if (!item) {
				return;
			}

			var uri = this.$SCM.getDataUrl(item.uri);
			const ext = item.name.split('.').pop().toLowerCase();
			const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
			const textExts = ['txt', 'md', 'json', 'xml', 'js', 'css', 'html'];

			if (imageExts.includes(ext)) {
				this.previewImages = [uri];
				this.imageViewerVisible = true;
			} else if (textExts.includes(ext)) {
				this.currentPreviewFile = item;
				try {
					const response = await fetch(uri);
					this.previewText = await response.text();
					this.textViewerVisible = true;
				} catch (error) {
					this.$message.error('预览失败');
				}
			} else {
				this.openDocWithWeb(item);
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

.action-buttons {
	display: flex;
	gap: 2px;
	margin-left: 8px;
	padding-left: 8px;
	border-left: 1px solid #ddd;
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

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 16px 4px;
}

.sidebar-add-btn {
	width: 22px;
	height: 22px;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #666;
	border-radius: 4px;
	transition: background-color 0.15s;
}

.sidebar-add-btn:hover {
	background-color: #e0e0e0;
	color: #333;
}

.folder-tree {
	padding: 4px 0;
}

.folder-tree :deep(.el-tree-node) {
	height: auto;
}

.folder-tree :deep(.el-tree-node__content) {
	height: 28px;
	padding: 0 8px;
}

.folder-tree :deep(.el-tree-node__content:hover) {
	background-color: #f0f0f0;
}

.folder-tree :deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
	background-color: rgba(64, 158, 255, 0.15);
}

.tree-node {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
}

.tree-label {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.tree-actions {
	visibility: hidden;
	display: flex;
	gap: 4px;
	color: #999;
}

.folder-tree :deep(.el-tree-node__content:hover) .tree-actions {
	visibility: visible;
}

.tree-actions sc-icon {
	cursor: pointer;
	padding: 2px;
	border-radius: 3px;
}

.tree-actions sc-icon:hover {
	background-color: #e0e0e0;
	color: #ff4d4f;
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

.upload-btn {
	margin-top: 16px;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 20px;
	border: 1px solid #409eff;
	border-radius: 4px;
	background-color: #fff;
	color: #409eff;
	cursor: pointer;
	transition: all 0.2s;
}

.upload-btn:hover {
	background-color: rgba(64, 158, 255, 0.1);
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

.context-menu {
	position: fixed;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 4px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	min-width: 140px;
}

.context-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	cursor: pointer;
	font-size: 13px;
	color: #333;
	transition: background-color 0.15s;
}

.context-item:hover {
	background-color: #f5f5f5;
}

.context-divider {
	height: 1px;
	background-color: #e5e5e5;
	margin: 4px 0;
}

.upload-demo {
	margin: 16px 0;
}

.upload-text {
	text-align: center;
}

.upload-hint {
	font-size: 12px;
	color: #999;
	margin-top: 8px;
}

.text-viewer-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.text-viewer {
	width: 80%;
	max-width: 800px;
	max-height: 80%;
	background-color: #fff;
	border-radius: 8px;
	overflow: hidden;
}

.text-viewer-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-bottom: 1px solid #e5e5e5;
	background-color: #f9f9f9;
}

.text-viewer-title {
	font-size: 14px;
	font-weight: 500;
	color: #333;
}

.text-viewer-close {
	width: 28px;
	height: 28px;
	border: none;
	background: transparent;
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #666;
	transition: background-color 0.15s;
}

.text-viewer-close:hover {
	background-color: #e0e0e0;
}

.text-viewer-content {
	padding: 16px;
	max-height: calc(80vh - 60px);
	overflow: auto;
}

.text-viewer-content pre {
	margin: 0;
	font-size: 13px;
	line-height: 1.6;
	color: #333;
	white-space: pre-wrap;
	word-wrap: break-word;
}

.dialog-footer {
	text-align: right;
}
</style>