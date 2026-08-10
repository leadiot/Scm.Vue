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
				<button class="toolbar-btn" @click="refresh">
					<sc-icon name="ms-refresh" :size="18" />
				</button>
				<div class="action-buttons">
					<button class="toolbar-btn" :title="$t('desktop.newFolder')" :disabled="!canOperate"
						@click="openNewFolderDialog">
						<sc-icon name="ms-create_new_folder" :size="18" />
					</button>
					<button class="toolbar-btn" :title="$t('desktop.uploadFile')" :disabled="!canOperate"
						@click="openUploadDialog">
						<sc-icon name="ms-upload" :size="18" />
					</button>
					<button class="toolbar-btn" :title="$t('desktop.download')" :disabled="!hasSelectedFile"
						@click="downloadSelected">
						<sc-icon name="ms-download" :size="18" />
					</button>
					<button class="toolbar-btn" :title="$t('desktop.delete')" :disabled="selectedItems.length === 0"
						@click="deleteSelected">
						<sc-icon name="ms-delete" :size="18" />
					</button>
				</div>
				<div class="path-bar">
					<span class="path-root" @click="goToRoot">
						<sc-icon name="ms-desktop_windows" :size="16" />
						<span>{{ $t('desktop.myComputer') }}</span>
					</span>
					<span v-for="(item, index) in visiblePath" :key="index" class="path-segment">
						<sc-icon name="ms-chevron_right" :size="16" />
						<span @click="goToPath(item.realIndex)">{{ item.name }}</span>
					</span>
					<span v-if="collapsedSegments.length > 0" class="path-segment path-ellipsis">
						<sc-icon name="ms-chevron_right" :size="16" />
						<el-popover placement="bottom" :width="200" trigger="click">
							<template #reference>
								<span class="ellipsis-btn" @click.stop>
									<sc-icon name="ms-more_horiz" :size="16" />
								</span>
							</template>
							<div class="collapsed-list">
								<div v-for="(item, index) in collapsedSegments" :key="index" class="collapsed-item"
									@click="goToPath(item.realIndex)">
									<sc-icon name="ms-folder" :size="16" />
									<span>{{ item.name }}</span>
								</div>
							</div>
						</el-popover>
					</span>
					<span v-for="(item, index) in tailPath" :key="'tail-' + index" class="path-segment">
						<sc-icon name="ms-chevron_right" :size="16" />
						<span @click="goToPath(item.realIndex)">{{ item.name }}</span>
					</span>
				</div>
			</div>
			<div class="toolbar-right">
				<el-input v-model="param.key" :placeholder="$t('desktop.search')" prefix-icon="el-icon-search"
					size="small" class="search-input" />
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
					<div class="sidebar-title">{{ $t('desktop.cloudSpace') }}</div>
					<div v-for="item in stores" :key="item.name" class="sidebar-item"
						:class="{ active: currentFolder?.name === item.name }" @click="openFolder(item)">
						<sc-icon :name="item.icon" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
				<div class="sidebar-section">
					<div class="sidebar-title">{{ $t('desktop.quickAccess') }}</div>
					<div v-for="item in libs" :key="item.name" class="sidebar-item"
						:class="{ active: currentFolder?.name === item.name }" @click="openLib(item)">
						<sc-icon :name="item.icon" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
				<div class="sidebar-section">
					<div class="sidebar-title">{{ $t('desktop.myComputer') }}</div>
					<div v-for="item in deviceList" :key="item.name" class="sidebar-item"
						:class="{ active: currentFolder?.name === item.name }" @click="openDevice(item)">
						<sc-icon name="ms-devices" :size="18" />
						<span>{{ item.name }}</span>
					</div>
				</div>
			</div>

			<div class="main-content" ref="contentRef" v-loading="loading" @click.self="handleBlankClick"
				@scroll="handleScroll" @contextmenu.prevent="showBlankContextMenu($event)"
				@dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="handleFileDrop">
				<div v-if="viewMode === 'tiles'" class="view-tiles">
					<div v-for="item in fileList" :key="item.name" class="tile-item"
						:class="{ selected: selectedItems.includes(item.name) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)" @contextmenu.prevent.stop="showContextMenu($event, item)">
						<div class="tile-icon">
							<sc-icon :name="getFileIcon(item)" :size="48" />
						</div>
						<div class="tile-name">{{ item.name }}</div>
					</div>
				</div>

				<div v-else-if="viewMode === 'list'" class="view-list">
					<div v-for="item in fileList" :key="item.name" class="list-item"
						:class="{ selected: selectedItems.includes(item.name) }" @click="handleItemClick($event, item)"
						@dblclick="handleItemDblClick(item)" @contextmenu.prevent.stop="showContextMenu($event, item)">
						<sc-icon :name="getFileIcon(item)" :size="20" />
						<span class="list-name">{{ item.name }}</span>
					</div>
				</div>

				<div v-else-if="viewMode === 'details'" class="view-details">
					<div class="details-header">
						<div class="col-name" @click="sortBy('name')">
							<span>{{ $t('desktop.name') }}</span>
							<sc-icon v-if="sortField === 'name'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-date" @click="sortBy('modifiedDate')">
							<span>{{ $t('desktop.modifiedDate') }}</span>
							<sc-icon v-if="sortField === 'modifiedDate'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-type" @click="sortBy('type')">
							<span>{{ $t('desktop.type') }}</span>
							<sc-icon v-if="sortField === 'type'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
						<div class="col-size" @click="sortBy('size')">
							<span>{{ $t('desktop.size') }}</span>
							<sc-icon v-if="sortField === 'size'"
								:name="sortOrder === 'asc' ? 'ms-arrow_upward' : 'ms-arrow_downward'" :size="14" />
						</div>
					</div>
					<div class="details-body">
						<div v-for="item in fileList" :key="item.name" class="details-row"
							:class="{ selected: selectedItems.includes(item.name) }"
							@click="handleItemClick($event, item)" @dblclick="handleItemDblClick(item)"
							@contextmenu.prevent.stop="showContextMenu($event, item)">
							<div class="col-name">
								<sc-icon :name="getFileIcon(item)" :size="18" />
								<span>{{ item.name }}</span>
							</div>
							<div class="col-date">{{ item.change_time }}</div>
							<div class="col-type">{{ item.typeLabel || (item.type === 10 ? $t('desktop.directory') :
								$t('desktop.file')) }}</div>
							<div class="col-size">{{ item.type === 10 ? '' : $TOOL.fileSizeFormat(item.size) }}</div>
						</div>
					</div>
				</div>

				<div v-if="loadingMore" class="load-more">
					<span class="load-more-icon"><sc-icon name="ms-refresh" :size="16" /></span>
					<span>{{ $t('desktop.loading') }}</span>
				</div>

				<div v-if="fileList.length === 0 && !loading" class="empty-state">
					<sc-icon name="ms-folder_open" :size="64" />
					<p>{{ $t('desktop.folderEmpty') }}</p>
					<p v-if="canOperate" class="empty-upload-hint">{{ $t('desktop.dragFileHint') }}</p>
				</div>

				<div v-if="dragOver" class="drop-mask">
					<div class="drop-mask-inner">
						<sc-icon name="ms-cloud_upload" :size="48" />
						<p>{{ $t('desktop.dragFileHint') }}</p>
					</div>
				</div>
			</div>
		</div>

		<div class="app-statusbar">
			<span>{{ fileList.length }}<template v-if="total > fileList.length"> / {{ total }}</template> {{
				$t('desktop.items')
			}}</span>
			<span v-if="selectedItems.length > 0">· {{ $t('desktop.selectedItems', [selectedItems.length])
			}}</span>
		</div>

		<!-- 条目右键菜单 -->
		<div v-if="contextMenu.visible" class="context-menu" :style="contextMenu.style">
			<div class="context-item" @click="menuOpen">
				<sc-icon name="ms-open_in_new" :size="16" />
				<span>{{ $t('desktop.open') }}</span>
			</div>
			<div v-if="contextMenu.item && contextMenu.item.type !== 10" class="context-item" @click="menuDownload">
				<sc-icon name="ms-download" :size="16" />
				<span>{{ $t('desktop.download') }}</span>
			</div>
			<div class="context-divider"></div>
			<div class="context-item" @click="menuCut">
				<sc-icon name="ms-content_cut" :size="16" />
				<span>{{ $t('desktop.cut') }}</span>
			</div>
			<div class="context-item" @click="menuCopy">
				<sc-icon name="ms-content_copy" :size="16" />
				<span>{{ $t('desktop.copy') }}</span>
			</div>
			<div v-if="contextMenu.item && contextMenu.item.type === 10 && canPaste" class="context-item"
				@click="menuPasteInto">
				<sc-icon name="ms-content_paste" :size="16" />
				<span>{{ $t('desktop.paste') }}</span>
			</div>
			<div class="context-item" @click="menuMoveTo">
				<sc-icon name="ms-drive_file_move" :size="16" />
				<span>{{ $t('desktop.moveTo') }}</span>
			</div>
			<div class="context-divider"></div>
			<div class="context-item" @click="menuRename">
				<sc-icon name="ms-edit" :size="16" />
				<span>{{ $t('desktop.rename') }}</span>
			</div>
			<div class="context-item context-danger" @click="menuDelete">
				<sc-icon name="ms-delete" :size="16" />
				<span>{{ $t('desktop.delete') }}</span>
			</div>
			<div class="context-divider"></div>
			<div class="context-item" @click="menuProperties">
				<sc-icon name="ms-info" :size="16" />
				<span>{{ $t('desktop.properties') }}</span>
			</div>
		</div>

		<!-- 空白区右键菜单 -->
		<div v-if="blankMenu.visible" class="context-menu" :style="blankMenu.style">
			<div v-if="canPaste" class="context-item" @click="menuBlankPaste">
				<sc-icon name="ms-content_paste" :size="16" />
				<span>{{ $t('desktop.paste') }}</span>
			</div>
			<div v-if="canOperate" class="context-item" @click="menuBlankNewFolder">
				<sc-icon name="ms-create_new_folder" :size="16" />
				<span>{{ $t('desktop.newFolder') }}</span>
			</div>
			<div v-if="canOperate" class="context-item" @click="menuBlankUpload">
				<sc-icon name="ms-upload" :size="16" />
				<span>{{ $t('desktop.uploadFile') }}</span>
			</div>
			<div class="context-item" @click="menuBlankRefresh">
				<sc-icon name="ms-refresh" :size="16" />
				<span>{{ $t('desktop.refresh') }}</span>
			</div>
		</div>

		<!-- 新建文件夹对话框 -->
		<el-dialog v-model="newFolderVisible" :title="$t('desktop.newFolder')" width="400px" append-to-body
			@opened="focusNameInput">
			<el-form @submit.prevent>
				<el-form-item :label="$t('desktop.folderNameLabel')">
					<el-input ref="nameInputRef" v-model="newFolderName"
						:placeholder="$t('desktop.folderNamePlaceholder')" maxlength="250" clearable
						@keyup.enter="createNewFolder" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="newFolderVisible = false">{{ $t('desktop.cancel') }}</el-button>
				<el-button type="primary" :loading="busy" @click="createNewFolder">{{ $t('desktop.confirm')
				}}</el-button>
			</template>
		</el-dialog>

		<!-- 重命名对话框 -->
		<el-dialog v-model="renameVisible" :title="$t('desktop.renameTitle')" width="400px" append-to-body
			@opened="focusRenameInput">
			<el-form @submit.prevent>
				<el-form-item :label="$t('desktop.nameLabel')">
					<el-input ref="renameInputRef" v-model="renameName" :placeholder="$t('desktop.namePlaceholder')"
						maxlength="250" clearable @keyup.enter="confirmRename" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="renameVisible = false">{{ $t('desktop.cancel') }}</el-button>
				<el-button type="primary" :loading="busy" @click="confirmRename">{{ $t('desktop.confirm') }}</el-button>
			</template>
		</el-dialog>

		<!-- 上传对话框 -->
		<el-dialog v-model="uploadVisible" :title="$t('desktop.uploadFile')" width="500px" append-to-body>
			<el-upload ref="uploadRef" class="upload-demo" drag multiple :auto-upload="false"
				v-model:file-list="uploadList" :http-request="uploadRequest">
				<sc-icon name="ms-cloud_upload" :size="48" />
				<div class="upload-text">
					<p>{{ $t('desktop.uploadDragHint') }}</p>
					<p class="upload-hint">{{ $t('desktop.uploadSizeHint') }}</p>
				</div>
			</el-upload>
			<template #footer>
				<el-button @click="uploadVisible = false">{{ $t('desktop.cancel') }}</el-button>
				<el-button type="primary" :loading="busy" @click="submitUpload">
					{{ $t('desktop.startUpload') }}
				</el-button>
			</template>
		</el-dialog>

		<!-- 移动到对话框 -->
		<el-dialog v-model="moveToVisible" :title="$t('desktop.selectTargetFolder')" width="420px" append-to-body>
			<el-tree class="move-tree" lazy node-key="id" :load="loadMoveTree"
				:props="{ label: 'name', isLeaf: 'leaf' }" highlight-current :expand-on-click-node="false"
				@node-click="handleMoveTreeClick">
				<template #default="{ data }">
					<span class="move-tree-node">
						<sc-icon name="ms-folder" :size="16" />
						<span class="move-tree-label">{{ data.name }}</span>
					</span>
				</template>
			</el-tree>
			<template #footer>
				<el-button @click="moveToVisible = false">{{ $t('desktop.cancel') }}</el-button>
				<el-button type="primary" :disabled="!moveToTarget" :loading="busy" @click="confirmMoveTo">{{
					$t('desktop.confirm') }}</el-button>
			</template>
		</el-dialog>

		<!-- 属性对话框 -->
		<el-dialog v-model="propsVisible" :title="$t('desktop.properties')" width="420px" append-to-body>
			<div v-if="propsItem" class="props-box">
				<div class="props-head">
					<sc-icon :name="getFileIcon(propsItem)" :size="48" />
					<span class="props-name">{{ propsDetail.name || propsItem.name }}</span>
				</div>
				<div class="props-row">
					<span class="props-label">{{ $t('desktop.type') }}</span>
					<span>{{ propsItem.type === 10 ? $t('desktop.directory') : $t('desktop.file') }}</span>
				</div>
				<div class="props-row">
					<span class="props-label">{{ $t('desktop.location') }}</span>
					<span class="props-value">{{ propsLocation }}</span>
				</div>
				<div v-if="propsItem.type !== 10" class="props-row">
					<span class="props-label">{{ $t('desktop.size') }}</span>
					<span>{{ $TOOL.fileSizeFormat(propsDetail.size || propsItem.size || 0) }}</span>
				</div>
				<div class="props-row">
					<span class="props-label">{{ $t('desktop.modifiedDate') }}</span>
					<span>{{ $TOOL.dateFormat(propsDetail.modify_time || propsItem.modify_time) }}</span>
				</div>
			</div>
			<template #footer>
				<el-button type="primary" @click="propsVisible = false">{{ $t('desktop.confirm') }}</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import tool from '@/utils/tool.js';

export default {
	windowOptions: {
		icon: 'ms-computer',
		width: 900,
		height: 620,
		resizable: true,
	},
	name: 'Computer',
	components: { scIcon },
	data() {
		return {
			param: {
				key: '',
				path: '',
				page: 1,
				limit: 20,
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
				{ id: 'home', name: '主目录', icon: 'ms-home', type: 'folder', path: "~home" },
				{ id: 'desktop', name: '桌面', icon: 'ms-desktop_windows', type: 'folder', path: "~desk" },
			],
			libs: [
				{ id: 'documents', name: '文档', icon: 'ms-description', type: 'folder', path: '~documents' },
				{ id: 'pictures', name: '图片', icon: 'ms-photo_library', type: 'folder', path: '~image' },
				{ id: 'music', name: '音乐', icon: 'ms-music_note', type: 'folder', path: '~audio' },
				{ id: 'videos', name: '视频', icon: 'ms-videocam', type: 'folder', path: '~video' },
				{ id: 'office', name: '办公', icon: 'ms-window', type: 'folder', path: '~office' },
				{ id: 'archives', name: '归档', icon: 'ms-archive', type: 'folder', path: '~archives' },
				{ id: 'downloads', name: '下载', icon: 'ms-download', type: 'folder', path: '~download' },
			],
			deviceList: [],
			fileList: [],
			total: 0,
			loading: false,
			loadingMore: false,
			busy: false,
			dragOver: false,
			// 剪贴板：复制/剪切的条目
			clipboard: { op: '', items: [] },
			// 右键菜单
			contextMenu: { visible: false, item: null, style: { left: '0px', top: '0px' } },
			blankMenu: { visible: false, style: { left: '0px', top: '0px' } },
			// 新建文件夹
			newFolderVisible: false,
			newFolderName: '',
			// 重命名
			renameVisible: false,
			renameItem: null,
			renameName: '',
			// 上传
			uploadVisible: false,
			uploadPending: 0,
			uploadFailed: false,
			uploadList: [],
			// 移动到
			moveToVisible: false,
			moveToTarget: null,
			// 属性
			propsVisible: false,
			propsItem: null,
			propsDetail: {},
		};
	},
	computed: {
		canGoBack() {
			return this.historyIndex > 0;
		},
		canGoForward() {
			return this.historyIndex < this.history.length - 1;
		},
		visiblePath() {
			if (this.currentPath.length <= 4) {
				return this.currentPath.map((item, index) => ({ ...item, realIndex: index }));
			}
			return this.currentPath.slice(0, 2).map((item, index) => ({ ...item, realIndex: index }));
		},
		collapsedSegments() {
			if (this.currentPath.length <= 4) {
				return [];
			}
			const tailStart = this.currentPath.length - 2;
			return this.currentPath.slice(2, tailStart).map((item, i) => ({ ...item, realIndex: i + 2 }));
		},
		tailPath() {
			if (this.currentPath.length <= 4) {
				return [];
			}
			const tailStart = this.currentPath.length - 2;
			return this.currentPath.slice(tailStart).map((item, i) => ({ ...item, realIndex: tailStart + i }));
		},
		noMore() {
			return this.fileList.length >= this.total;
		},
		// 当前是否处于目录视图（可执行新建/上传/粘贴等操作）
		canOperate() {
			return this.currentFolder != null;
		},
		canPaste() {
			return this.clipboard.items.length > 0 && this.canOperate;
		},
		hasSelectedFile() {
			return this.fileList.some(f => this.selectedItems.includes(f.name) && f.type !== 10);
		},
		propsLocation() {
			const names = this.currentPath.map(p => p.name).filter(n => !!n);
			return names.length > 0 ? names.join(' / ') : '/';
		},
	},
	watch: {
		// 搜索防抖，避免输入时频繁请求
		'param.key'() {
			if (this.searchTimer) {
				clearTimeout(this.searchTimer);
			}
			this.searchTimer = setTimeout(() => {
				this.listFile();
			}, 300);
		},
	},
	mounted() {
		this.loadCfg();
		this.listRoot();
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('click', this.handleWindowClick);
	},
	beforeUnmount() {
		if (this.searchTimer) {
			clearTimeout(this.searchTimer);
		}
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('click', this.handleWindowClick);
	},
	methods: {
		async listRoot() {
			var res = await this.$API.computer.root.get();
			if (res.code !== 200) {
				this.deviceList = [];
				return;
			}
			this.deviceList = res.data.items || [];
		},
		async listFile() {
			// 分页加载：重置到第一页并清空已有数据
			this.param.page = 1;
			this.fileList = [];
			this.total = 0;
			this.$nextTick(() => {
				if (this.$refs.contentRef) {
					this.$refs.contentRef.scrollTop = 0;
				}
			});
			await this.loadFilePage();
		},
		async loadFilePage() {
			if (this.loading || this.loadingMore) {
				return;
			}
			if (this.param.page === 1) {
				this.loading = true;
			} else {
				this.loadingMore = true;
			}

			var res = await this.$API.computer.list.get(this.param);

			this.loading = false;
			this.loadingMore = false;

			if (res.code != 200) {
				return;
			}

			var rows = res.data.items || [];
			this.total = res.data.totalItems || 0;
			if (this.param.page === 1) {
				this.fileList = rows;
			} else {
				this.fileList = this.fileList.concat(rows);
			}
		},
		async loadMore() {
			if (this.loading || this.loadingMore || this.noMore) {
				return;
			}
			this.param.page++;
			await this.loadFilePage();
		},
		handleScroll(e) {
			var el = e.target;
			// 滚动到距底部 80px 内自动加载下一页
			if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
				this.loadMore();
			}
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
			this.hideMenus();
			if (event.ctrlKey || event.metaKey) {
				const index = this.selectedItems.indexOf(item.name);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				} else {
					this.selectedItems.push(item);
				}
			} else if (event.shiftKey && this.selectedItems.length > 0) {
				const items = this.fileList;
				const lastSelected = this.selectedItems[this.selectedItems.length - 1];
				const lastIndex = items.findIndex(i => i.name === lastSelected);
				const currentIndex = items.findIndex(i => i.name === item.name);
				const start = Math.min(lastIndex, currentIndex);
				const end = Math.max(lastIndex, currentIndex);
				this.selectedItems = items.slice(start, end + 1).map(i => i.name);
			} else {
				this.selectedItems = [item.name];
			}
		},
		handleItemDblClick(item) {
			if (item.type === 10) {
				this.openDir(item);
			} else {
				this.openDoc(item);
			}
		},
		saveParam(item) {
			this.param.path = item.path || '';
			this.param.page = 1;
			this.param.limit = 100;
		},
		async openLib(item) {
			this.currentPath = [];
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.saveParam(item);
			this.listFile();
		},
		async openFolder(item) {
			this.currentPath = [];
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.saveParam(item);
			this.listFile();
		},
		async openDevice(item) {
			this.currentPath = [];
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.saveParam(item);
			this.listFile();
		},
		async openDir(item) {
			this.currentPath.push(item);
			this.currentFolder = item;
			this.selectedItems = [];
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: item, path: [...this.currentPath] });
			this.historyIndex = this.history.length - 1;

			this.saveParam(item);
			this.listFile();
		},
		/**
		 * 打开文档
		 * @param item 文档项
		 */
		openDoc(item) {
			const url = this.$API.computer.view.get({ path: item.path });
			window.open(url, '_blank');
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
				this.history = this.history.slice(0, this.historyIndex + 1);
				this.history.push({ folder: null, path: [] });
				this.historyIndex = this.history.length - 1;
				this.loadCurrentFolder();
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
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push({ folder: null, path: [] });
			this.historyIndex = this.history.length - 1;
			this.loadCurrentFolder();
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
			if (!this.currentFolder) {
				this.fileList = [];
				return;
			}

			this.param.path = this.currentFolder.path || '';
			this.listFile();
		},
		sortBy(field) {
			if (this.sortField === field) {
				this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
			} else {
				this.sortField = field;
				this.sortOrder = 'asc';
			}
		},
		async refresh() {
			this.hideMenus();
			await this.listRoot();
			await this.listFile();
		},
		getSelectedItems() {
			return this.fileList.filter(f => this.selectedItems.includes(f.name));
		},
		hideMenus() {
			this.contextMenu.visible = false;
			this.blankMenu.visible = false;
		},
		handleWindowClick() {
			this.hideMenus();
		},
		handleBlankClick() {
			this.clearSelection();
			this.hideMenus();
		},
		menuStyle(event) {
			const menuWidth = 180;
			const menuHeight = 340;
			let left = event.clientX;
			let top = event.clientY;
			if (left + menuWidth > window.innerWidth) {
				left = Math.max(0, window.innerWidth - menuWidth);
			}
			if (top + menuHeight > window.innerHeight) {
				top = Math.max(0, window.innerHeight - menuHeight);
			}
			return { left: left + 'px', top: top + 'px' };
		},
		showContextMenu(event, item) {
			if (!this.selectedItems.includes(item.name)) {
				this.selectedItems = [item.name];
			}
			this.contextMenu.item = item;
			this.contextMenu.style = this.menuStyle(event);
			this.blankMenu.visible = false;
			this.contextMenu.visible = true;
		},
		showBlankContextMenu(event) {
			this.contextMenu.visible = false;
			this.blankMenu.style = this.menuStyle(event);
			this.blankMenu.visible = true;
		},
		// ===== 右键菜单动作 =====
		menuOpen() {
			const item = this.contextMenu.item;
			this.hideMenus();
			if (item) {
				this.handleItemDblClick(item);
			}
		},
		menuDownload() {
			const item = this.contextMenu.item;
			this.hideMenus();
			this.downloadItem(item);
		},
		menuCut() {
			this.hideMenus();
			this.cutSelected();
		},
		menuCopy() {
			this.hideMenus();
			this.copySelected();
		},
		menuPasteInto() {
			const item = this.contextMenu.item;
			this.hideMenus();
			if (item && item.type === 10) {
				this.pasteInto(item.name);
			}
		},
		menuMoveTo() {
			this.hideMenus();
			this.openMoveToDialog();
		},
		menuRename() {
			const item = this.contextMenu.item;
			this.hideMenus();
			this.openRenameDialog(item);
		},
		menuDelete() {
			this.hideMenus();
			this.deleteSelected();
		},
		async menuProperties() {
			const item = this.contextMenu.item;
			this.hideMenus();
			await this.openProperties(item);
		},
		menuBlankPaste() {
			this.hideMenus();
			this.pasteHere();
		},
		menuBlankNewFolder() {
			this.hideMenus();
			this.openNewFolderDialog();
		},
		menuBlankUpload() {
			this.hideMenus();
			this.openUploadDialog();
		},
		menuBlankRefresh() {
			this.hideMenus();
			this.refresh();
		},
		// ===== 剪切/复制/粘贴 =====
		cutSelected() {
			const items = this.getSelectedItems();
			if (items.length === 0) {
				return;
			}
			this.clipboard = { op: 'cut', items: items.map(i => ({ ...i })) };
		},
		copySelected() {
			const items = this.getSelectedItems();
			if (items.length === 0) {
				return;
			}
			this.clipboard = { op: 'copy', items: items.map(i => ({ ...i })) };
		},
		pasteHere() {
			if (!this.canPaste) {
				return;
			}
			this.pasteInto(this.param.path);
		},
		async pasteInto(path) {
			if (this.clipboard.items.length === 0) {
				return;
			}
			// 不允许将文件夹粘贴到自身
			if (this.clipboard.items.some(i => i.name === path)) {
				this.$message.warning(this.$t('desktop.operationFailed'));
				return;
			}
			const srcList = this.clipboard.items.map(i => i.path);
			const isCut = this.clipboard.op === 'cut';
			const api = isCut ? this.$API.computer.move : this.$API.computer.copy;
			this.busy = true;
			try {
				var res = await api.post({ files: srcList, path: path, overwrite: true });
				if (res.code == 200) {
					this.$message.success(isCut ? this.$t('desktop.moveSuccess') : this.$t('desktop.copySuccess'));
					if (isCut) {
						this.clipboard = { op: '', items: [] };
					}
					this.listFile();
				} else {
					this.$message.error(res.message || this.$t('desktop.operationFailed'));
				}
			} catch (e) {
			this.$LOG.error('文件复制/移动失败', e);
			this.$message.error(this.$t('desktop.operationFailed'));
		}
		this.busy = false;
	},
	// ===== 删除 =====
		deleteSelected() {
			const items = this.getSelectedItems();
			if (items.length === 0) {
				return;
			}
			const msg = items.length === 1
				? this.$t('desktop.confirmDeleteSingle', [items[0].name])
				: this.$t('desktop.confirmDelete', [items.length]);
			this.$confirm(msg, this.$t('desktop.tip'), {
				type: 'warning',
				confirmButtonText: this.$t('desktop.confirm'),
				cancelButtonText: this.$t('desktop.cancel'),
			}).then(async () => {
				this.busy = true;
				try {
					const path = items.map(i => i.path);
					var res = await this.$API.computer.delete.post({ files: path });
					if (res.code == 200) {
						this.$message.success(this.$t('desktop.deleteSuccess'));
						this.selectedItems = [];
						this.listFile();
					} else {
						this.$message.error(res.message || this.$t('desktop.operationFailed'));
					}
				} catch (e) {
				this.$LOG.error('删除文件失败', e);
				this.$message.error(this.$t('desktop.operationFailed'));
			}
				this.busy = false;
			}).catch(() => { });
		},
		// ===== 新建文件夹 =====
		openNewFolderDialog() {
			if (!this.canOperate) {
				return;
			}
			this.newFolderName = '';
			this.newFolderVisible = true;
		},
		focusNameInput() {
			this.$nextTick(() => {
				if (this.$refs.nameInputRef) {
					this.$refs.nameInputRef.focus();
				}
			});
		},
		focusRenameInput() {
			this.$nextTick(() => {
				if (this.$refs.renameInputRef) {
					this.$refs.renameInputRef.focus();
					this.$refs.renameInputRef.select();
				}
			});
		},
		async createNewFolder() {
			const name = (this.newFolderName || '').trim();
			if (!name) {
				this.$message.warning(this.$t('desktop.folderNamePlaceholder'));
				return;
			}
			this.busy = true;
			try {
				var res = await this.$API.computer.createDir.post({ path: this.param.path, name: name });
				if (res.code == 200) {
					this.$message.success(this.$t('desktop.createSuccess'));
					this.newFolderVisible = false;
					this.listFile();
				} else {
					this.$message.error(res.message || this.$t('desktop.operationFailed'));
				}
			} catch (e) {
			this.$LOG.error('新建文件夹失败', e);
			this.$message.error(this.$t('desktop.operationFailed'));
		}
		this.busy = false;
	},
	// ===== 重命名 =====
		openRenameDialog(item) {
			if (!item) {
				const items = this.getSelectedItems();
				if (items.length !== 1) {
					return;
				}
				item = items[0];
			}
			this.renameItem = item;
			this.renameName = item.name;
			this.renameVisible = true;
		},
		async confirmRename() {
			const name = (this.renameName || '').trim();
			if (!name || !this.renameItem) {
				return;
			}
			this.busy = true;
			try {
				var res = await this.$API.computer.rename.post({ file: this.renameItem.path, name: name });
				if (res.code == 200) {
					this.$message.success(this.$t('desktop.renameSuccess'));
					this.renameVisible = false;
					this.listFile();
				} else {
					this.$message.error(this.$t('desktop.operationFailed'));
				}
			} catch (e) {
			this.$LOG.error('重命名失败', e);
			this.$message.error(this.$t('desktop.operationFailed'));
		}
		this.busy = false;
	},
	// ===== 下载 =====
		downloadItem(item) {
			if (!item || item.type === 10) {
				return;
			}
			const url = this.$API.computer.download.get({ path: item.path });
			tool.downloadFile(url, item.name);
		},
		downloadSelected() {
			this.getSelectedItems().filter(i => i.type !== 10).forEach(i => this.downloadItem(i));
		},
		// ===== 上传 =====
		openUploadDialog() {
			if (!this.canOperate) {
				return;
			}
			this.uploadList = [];
			this.uploadVisible = true;
		},
		submitUpload() {
			const files = (this.uploadList || []).filter(f => f.status === 'ready');
			if (files.length === 0) {
				return;
			}
			this.uploadPending = files.length;
			this.uploadFailed = false;
			this.busy = true;
			this.$refs.uploadRef.submit();
		},
		uploadRequest(param) {
			this.uploadOne(param.file).then(() => {
				if (param.onSuccess) {
					param.onSuccess();
				}
			}).catch(() => {
				this.uploadFailed = true;
				if (param.onError) {
					param.onError(new Error('upload failed'));
				}
			}).finally(() => {
				this.uploadPending--;
				if (this.uploadPending <= 0) {
					this.busy = false;
					if (this.uploadFailed) {
						this.$message.error(this.$t('desktop.operationFailed'));
					} else {
						this.$message.success(this.$t('desktop.uploadSuccess'));
						this.uploadVisible = false;
					}
					this.listFile();
				}
			});
		},
		async uploadOne(file) {
			const data = new FormData();
			data.append('type', 1);
			data.append('file', file);
			data.append('name', file.name);
			data.append('size', file.size);
			data.append('path', this.param.path);
			const config = {
				headers: { 'Content-Type': 'multipart/form-data' },
				timeout: 300000,
			};
			var res = await this.$API.computer.upload.post(data, config);
			if (res.code != 200) {
				throw new Error(res.message || 'upload failed');
			}
			return res;
		},
		onDragOver(e) {
			if (!this.canOperate) {
				return;
			}
			if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
				this.dragOver = true;
			}
		},
		onDragLeave(e) {
			if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
				return;
			}
			this.dragOver = false;
		},
		async handleFileDrop(e) {
			this.dragOver = false;
			if (!this.canOperate) {
				return;
			}
			const files = e.dataTransfer && e.dataTransfer.files;
			if (!files || files.length === 0) {
				return;
			}
			this.busy = true;
			let failed = false;
			for (const file of files) {
				try {
					await this.uploadOne(file);
				} catch {
					failed = true;
				}
			}
			this.busy = false;
			if (failed) {
				this.$message.error(this.$t('desktop.operationFailed'));
			} else {
				this.$message.success(this.$t('desktop.uploadSuccess'));
			}
			this.listFile();
		},
		// ===== 移动到 =====
		openMoveToDialog() {
			const items = this.getSelectedItems();
			if (items.length === 0) {
				return;
			}
			this.moveToTarget = null;
			this.moveToVisible = true;
		},
		handleMoveTreeClick(data) {
			this.moveToTarget = data;
		},
		async loadMoveTree(node, resolve) {
			if (node.level === 0) {
				const roots = [];
				this.deviceList.forEach(d => roots.push({ id: d.id || d.name, name: d.name, path: d.path, leaf: false }));
				resolve(roots);
				return;
			}
			try {
				var res = await this.$API.computer.list.get({
					path: node.data.path, page: 1, limit: 500,
				});
				if (res.code == 200) {
					const dirs = (res.data.items || [])
						.filter(i => !this.selectedItems.includes(i.name))
						.map(i => ({ id: i.name, name: i.name, path: i.path, leaf: false }));
					resolve(dirs);
					return;
				}
			} catch { }
			resolve([]);
		},
		async confirmMoveTo() {
			if (!this.moveToTarget) {
				return;
			}
			const items = this.getSelectedItems();
			const targetPath = this.moveToTarget.path;
			if (items.some(i => i.path === targetPath)) {
				this.$message.warning(this.$t('desktop.operationFailed'));
				return;
			}
			this.busy = true;
			try {
				var res = await this.$API.computer.move.post({ files: items.map(i => i.path), path: targetPath, overwrite: true });
				if (res.code == 200) {
					this.$message.success(this.$t('desktop.moveSuccess'));
					this.moveToVisible = false;
					this.selectedItems = [];
					this.listFile();
				} else {
					this.$message.error(res.message || this.$t('desktop.operationFailed'));
				}
			} catch (e) {
			this.$LOG.error('移动文件失败', e);
			this.$message.error(this.$t('desktop.operationFailed'));
		}
		this.busy = false;
	},
	// ===== 属性详情 =====
		async openProperties(item) {
			if (!item) {
				return;
			}
			this.propsItem = item;
			this.propsDetail = {};
			this.propsVisible = true;
			try {
				var res = await this.$API.computer.info.get({ path: item.path });
				if (res.code == 200 && res.data) {
					this.propsDetail = res.data;
				}
			} catch (e) {
				this.$LOG.warn('获取文件属性失败', e);
			}
		},
		// ===== 快捷键 =====
		handleKeyDown(e) {
			const target = e.target || {};
			const tag = target.tagName || '';
			if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
				return;
			}
			if (this.newFolderVisible || this.renameVisible || this.uploadVisible || this.moveToVisible || this.propsVisible) {
				return;
			}
			const key = (e.key || '').toLowerCase();
			if ((e.ctrlKey || e.metaKey) && key === 'c') {
				this.copySelected();
			} else if ((e.ctrlKey || e.metaKey) && key === 'x') {
				this.cutSelected();
			} else if ((e.ctrlKey || e.metaKey) && key === 'v') {
				this.pasteHere();
			} else if (e.key === 'Delete') {
				this.deleteSelected();
			} else if (e.key === 'F2') {
				this.openRenameDialog();
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
	min-width: 0;
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
	flex-shrink: 0;
	white-space: nowrap;
}

.path-root:hover {
	background-color: #f0f0f0;
}

.path-segment {
	display: flex;
	align-items: center;
	color: #999;
	flex-shrink: 0;
}

.path-segment span:last-child {
	cursor: pointer;
	padding: 2px 4px;
	border-radius: 3px;
	max-width: 120px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.path-segment span:last-child:hover {
	background-color: #f0f0f0;
	color: #333;
}

.path-ellipsis .ellipsis-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 2px 4px;
	border-radius: 3px;
	cursor: pointer;
	color: #999;
}

.path-ellipsis .ellipsis-btn:hover {
	background-color: #f0f0f0;
	color: #333;
}

.collapsed-list {
	max-height: 200px;
	overflow-y: auto;
}

.collapsed-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 8px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 13px;
	color: #333;
}

.collapsed-item:hover {
	background-color: #f5f5f5;
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
	width: 60px;
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

.load-more {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	padding: 12px;
	color: #999;
	font-size: 12px;
}

.load-more-icon {
	display: inline-flex;
	animation: nas-spin 1s linear infinite;
}

@keyframes nas-spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
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

.action-buttons {
	display: flex;
	gap: 2px;
	margin-left: 4px;
	padding-left: 8px;
	border-left: 1px solid #ddd;
}

.main-content {
	position: relative;
}

/* 右键菜单 */
.context-menu {
	position: fixed;
	background: #fff;
	border: 1px solid #e5e5e5;
	border-radius: 4px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
	z-index: 3000;
	min-width: 160px;
	padding: 4px 0;
}

.context-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 7px 14px;
	cursor: pointer;
	font-size: 13px;
	color: #333;
	transition: background-color 0.15s;
}

.context-item:hover {
	background-color: #f5f5f5;
}

.context-danger {
	color: #f56c6c;
}

.context-divider {
	height: 1px;
	background-color: #e5e5e5;
	margin: 4px 0;
}

/* 上传 */
.upload-demo {
	margin: 8px 0;
}

.upload-text {
	text-align: center;
}

.upload-hint {
	font-size: 12px;
	color: #999;
	margin-top: 8px;
}

.empty-upload-hint {
	margin-top: 4px;
	font-size: 12px;
	color: #bbb;
}

/* 拖拽上传遮罩 */
.drop-mask {
	position: absolute;
	inset: 0;
	background-color: rgba(64, 158, 255, 0.08);
	border: 2px dashed #409eff;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
	pointer-events: none;
}

.drop-mask-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
	color: #409eff;
	font-size: 14px;
}

/* 移动到树 */
.move-tree {
	max-height: 360px;
	overflow: auto;
}

.move-tree :deep(.el-tree-node__content) {
	height: 30px;
}

.move-tree-node {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
}

.move-tree-label {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 属性对话框 */
.props-box {
	font-size: 13px;
	color: #333;
}

.props-head {
	display: flex;
	align-items: center;
	gap: 12px;
	padding-bottom: 12px;
	margin-bottom: 12px;
	border-bottom: 1px solid #e5e5e5;
}

.props-name {
	font-size: 14px;
	font-weight: 600;
	word-break: break-all;
}

.props-row {
	display: flex;
	padding: 6px 0;
}

.props-label {
	width: 90px;
	flex-shrink: 0;
	color: #999;
}

.props-value {
	word-break: break-all;
}
</style>