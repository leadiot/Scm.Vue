<template>
	<div class="app-container app-light" @click.self="clearSelection">
		<!-- 顶部工具栏 -->
		<div class="app-toolbar image-toolbar">
			<div class="toolbar-left">
				<span class="app-header-title">图库</span>
				<span class="image-count">{{ total }} 张照片</span>
			</div>
			<div class="toolbar-center">
				<el-input v-model="param.key" placeholder="搜索照片、文件夹或标签…" size="small" clearable class="gallery-search">
					<template #prefix>
						<sc-icon name="ms-search" :size="16" />
					</template>
				</el-input>
			</div>
			<div class="toolbar-right">
				<div class="view-switch">
					<button v-for="v in viewModes" :key="v.value" class="view-btn"
						:class="{ active: viewMode === v.value }" :title="v.label" @click="changeViewMode(v.value)">
						<sc-icon :name="v.icon" :size="18" />
					</button>
				</div>
				<el-select v-model="param.field" class="sort-select">
					<el-option v-for="s in sortOptions" :key="s.value" :label="s.label" :value="s.value" />
				</el-select>
				<el-button type="primary" @click="openUploadDialog">
					<sc-icon name="ms-upload" :size="16" style="margin-right: 4px;" />上传
				</el-button>
			</div>
		</div>

		<!-- 主体内容 -->
		<div class="app-content gallery-content">
			<!-- 左侧分类边栏 -->
			<div class="sidebar gallery-sidebar">
				<div class="sidebar-section">
					<div class="sidebar-header">
						<span class="sidebar-title">分类</span>
					</div>
					<div class="category-list">
						<div v-for="cat in categoryTree" :key="cat.id" class="category-group">
							<div class="category-item" :class="{ active: param.cat_id === cat.id }"
								@click="selectCategory(cat)">
								<sc-icon :name="cat.icon" :size="16" />
								<span class="category-label">{{ cat.name }}</span>
								<span v-if="cat.count" class="category-count">{{ cat.count }}</span>
							</div>
							<div v-if="cat.children" class="category-children">
								<div v-for="child in cat.children" :key="child.id" class="category-child"
									:class="{ active: param.cat_id === child.id }" @click.stop="selectCategory(child)">
									<span class="category-label">{{ child.name }}</span>
									<span v-if="child.count" class="category-count">{{ child.count }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 中间主内容区 -->
			<div class="main-content gallery-main" @click.self="clearSelection">
				<!-- 网格视图 -->
				<div v-if="viewMode === 'grid'" class="view-grid">
					<div v-for="item in images" :key="item.id" class="grid-item"
						:class="{ selected: selectedItems.includes(item.id) }" @click="handleItemClick($event, item)"
						@dblclick="previewImage(item)">
						<div class="grid-thumb">
							<img :src="getThumbUrl(item)" :alt="item.name" loading="lazy" />
							<div class="grid-overlay">
								<div class="grid-actions">
									<el-button text size="small" @click.stop="previewImage(item)">
										<sc-icon name="ms-remove_red_eye" :size="16" />
									</el-button>
									<el-button text size="small" @click.stop="deleteImage(item)">
										<sc-icon name="ms-delete" :size="16" />
									</el-button>
								</div>
							</div>
							<div class="grid-color-badge" :style="{ backgroundColor: item.color }" />
						</div>
						<div class="grid-info">
							<span class="grid-name" :title="item.name">{{ item.name }}</span>
							<div class="grid-subrow">
								<span class="grid-meta">{{ formatSize(item.size) }}</span>
								<span class="grid-date">{{ getShootDate(item.shoot_time) }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- 表格视图 -->
				<div v-else-if="viewMode === 'table'" class="view-table">
					<el-table :data="images" style="width: 100%;" height="100%" @row-click="handleRowClick"
						@selection-change="handleSelectionChange">
						<el-table-column type="selection" width="45" />
						<el-table-column label="缩略图" width="80">
							<template #default="{ row }">
								<div class="table-thumb">
									<img :src="getThumbUrl(row)" :alt="row.name" />
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="name" label="文件名" min-width="160" show-overflow-tooltip />
						<el-table-column label="尺寸" width="120" align="center">
							<template #default="{ row }">
								{{ row.width }}×{{ row.height }}
							</template>
						</el-table-column>
						<el-table-column label="大小" width="100" align="right">
							<template #default="{ row }">
								{{ formatSize(row.size) }}
							</template>
						</el-table-column>
						<el-table-column prop="shootDate" label="拍摄日期" width="140" sortable="custom" />
						<el-table-column prop="createdAt" label="创建日期" width="140" sortable="custom" />
						<el-table-column label="主色调" width="80">
							<template #default="{ row }">
								<div class="table-color-dot" :style="{ backgroundColor: row.color }" />
							</template>
						</el-table-column>
						<el-table-column label="操作" width="120" fixed="right">
							<template #default="{ row }">
								<el-button text size="small" @click.stop="previewImage(row)">
									<sc-icon name="ms-remove_red_eye" :size="16" />
								</el-button>
								<el-button text size="small" @click.stop="deleteImage(row)">
									<sc-icon name="ms-delete" :size="16" />
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>

				<!-- 瀑布流视图 -->
				<div v-else-if="viewMode === 'waterfall'" class="view-waterfall">
					<div class="waterfall-columns">
						<div v-for="item in images" :key="item.id" class="waterfall-item"
							:class="{ selected: selectedItems.includes(item.id) }"
							@click="handleItemClick($event, item)" @dblclick="previewImage(item)">
							<div class="waterfall-thumb"
								:style="{ paddingBottom: (item.height / item.width * 100) + '%' }">
								<img :src="getThumbUrl(item)" :alt="item.name" loading="lazy" />
							</div>
							<div class="waterfall-info">
								<span class="waterfall-name">{{ item.name }}</span>
								<span class="waterfall-meta">{{ formatSize(item.size) }}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- 空状态 -->
				<div v-if="images.length === 0" class="empty-state">
					<sc-icon :name="param.key ? 'ms-search_off' : 'ms-image'" :size="64" />
					<p v-if="param.key">未找到匹配 "{{ param.key }}" 的照片</p>
					<p v-else>图库为空</p>
					<el-button v-if="!param.key" type="primary" size="small" @click="openUploadDialog">
						<sc-icon name="ms-upload" :size="16" style="margin-right: 4px;" />上传照片
					</el-button>
				</div>

				<!-- 分页 -->
				<div v-if="images.length > 0" class="gallery-pagination">
					<el-pagination v-model:current-page="param.page" v-model:page-size="param.limit"
						:page-sizes="[20, 40, 80, 120]" :total="total" layout="total, sizes, prev, pager, next"
						background @current-change="paginationChange" @size-change="paginationSizeChange" />
				</div>
			</div>

			<!-- 右侧过滤面板 -->
			<div class="filter-panel">
				<div class="filter-section">
					<div class="filter-title">主色调</div>
					<div class="color-filter">
						<div v-for="c in colorFilters" :key="c.value" class="color-dot"
							:class="{ active: param.colors.includes(c.value) }" :style="{ backgroundColor: c.value }"
							:title="c.label" @click="toggleColor(c.value)" />
					</div>
				</div>

				<div class="filter-section">
					<div class="filter-title">日期范围</div>
					<el-select v-model="datePreset" size="small" style="width: 100%; margin-bottom: 8px;"
						@change="handleDatePresetChange">
						<el-option v-for="opt in datePresetOptions" :key="opt.value" :label="opt.label"
							:value="opt.value" />
					</el-select>
					<el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
						end-placeholder="结束日期" size="small" style="width: 100%;" value-format="YYYY-MM-DD"
						:disabled="datePreset !== 'custom'" />
				</div>

				<div class="filter-section">
					<div class="filter-title">文件大小(Mb)</div>
					<div class="size-filter">
						<el-input-number v-model="param.from_size" placeholder="文件大小" size="small" :min="0"
							style="width: 100%;" />
						<el-input-number v-model="param.to_size" placeholder="文件大小" size="small" :min="0"
							style="width: 100%;" />
					</div>
				</div>


				<div class="filter-section">
					<div class="filter-title">图像比例</div>
					<div class="size-filter">
						<el-checkbox-group v-model="param.ratios">
							<el-checkbox v-for="s in ratioFilters" :key="s.value" :value="s.value">
								{{ s.label }}
							</el-checkbox>
						</el-checkbox-group>
					</div>
				</div>

				<div class="filter-section">
					<div class="filter-title">文件类型</div>
					<el-checkbox-group v-model="param.formats">
						<el-checkbox v-for="t in formatFilters" :key="t.value" :value="t.value">
							{{ t.label }}
						</el-checkbox>
					</el-checkbox-group>
				</div>

				<el-button text size="small" class="filter-reset" @click="resetFilters">
					<sc-icon name="ms-refresh" :size="14" style="margin-right: 4px;" />重置过滤
				</el-button>
			</div>
		</div>

		<!-- 底部状态栏 -->
		<div class="app-statusbar">
			<span>{{ total }} 张照片</span>
			<span v-if="selectedItems.length > 0">· 已选择 {{ selectedItems.length }} 张</span>
		</div>

		<!-- 图片预览 -->
		<el-image-viewer v-if="imageViewerVisible" :url-list="previewImages" :initial-index="previewIndex"
			@close="imageViewerVisible = false" />

		<!-- 上传对话框 -->
		<el-dialog v-model="uploadDialogVisible" title="上传照片" width="520px" @close="uploadDialogVisible = false">
			<el-upload ref="uploadRef" class="upload-demo" drag :auto-upload="false" :http-request="handleUpload"
				accept="image/*" multiple>
				<sc-icon name="ms-cloud_upload" :size="48" />
				<div class="upload-text">
					<p>将照片拖到此处，或点击上传</p>
					<p class="upload-hint">支持 JPG、PNG、GIF、WebP 格式</p>
				</div>
			</el-upload>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="uploadDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="submitUpload">开始上传</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	windowOptions: {
		width: 900,
		height: 700,
		resizable: true,
	},
	appIcon: 'ms-collections',
	name: 'ImageLib',
	components: {
		scIcon,
	},
	data() {
		return {
			param: {
				page: 1,
				limit: 20,
				key: '',
				cat: 'all',
				cat_id: '0',
				colors: [],
				ratios: [],
				formats: [],
				start_date: '',
				end_date: '',
				from_size: 0,
				to_size: 0,
				field: 'createdAt',
				order: '1',
			},
			rootCat: {
				id: '0',
				code: 'all',
				name: '全部照片',
				icon: 'ms-image',
				count: 0,
			},
			loadTimer: null,
			viewMode: 'grid',
			viewModes: [
				{ value: 'grid', label: '网格', icon: 'ms-grid_view' },
				{ value: 'table', label: '表格', icon: 'ms-table_rows' },
				{ value: 'waterfall', label: '瀑布流', icon: 'ms-view_week' },
			],
			sortOptions: [
				{ value: 'createdAt', label: '按创建日期' },
				{ value: 'shootDate', label: '按拍摄日期' },
				{ value: 'name', label: '按文件名' },
				{ value: 'size', label: '按文件大小' },
			],
			categoryTree: [],
			images: [],
			total: 0,
			selectedItems: [],
			colorFilters: [
				{ value: '#ef4444', label: '红' },
				{ value: '#f97316', label: '橙' },
				{ value: '#eab308', label: '黄' },
				{ value: '#22c55e', label: '绿' },
				{ value: '#3b82f6', label: '蓝' },
				{ value: '#8b5cf6', label: '紫' },
				{ value: '#ec4899', label: '粉' },
				{ value: '#64748b', label: '灰' },
			],
			ratioFilters: [
				{ value: '1', label: '方图' },
				{ value: '2', label: '宽图' },
				{ value: '3', label: '长图' },
				{ value: '4', label: '超宽图' },
				{ value: '5', label: '超长图' },
			],
			formatFilters: [
				{ value: 'jpg', label: 'JPG' },
				{ value: 'png', label: 'PNG' },
				{ value: 'gif', label: 'GIF' },
				{ value: 'webp', label: 'WebP' },
			],
			datePresetOptions: [
				{ value: '', label: '不限' },
				{ value: 'today', label: '今天' },
				{ value: '3days', label: '近3天' },
				{ value: '7days', label: '近7天' },
				{ value: '30days', label: '近30天' },
				{ value: 'year', label: '今年' },
				{ value: 'custom', label: '自定义' },
			],
			datePreset: '30days',
			dateRange: null,
			imageViewerVisible: false,
			previewImages: [],
			previewIndex: 0,
			uploadDialogVisible: false,
			imageIdCounter: 1,
		};
	},
	computed: {
		computedDateRange() {
			if (this.datePreset === 'custom') {
				return (this.dateRange && this.dateRange.length === 2) ? this.dateRange : null;
			}
			if (!this.datePreset) return null;
			const now = new Date();
			const end = '';//this.formatDate(now);
			let start;
			switch (this.datePreset) {
				case 'today':
					start = end;
					break;
				case '3days': {
					const d = new Date(now);
					d.setDate(d.getDate() - 2);
					start = this.formatDate(d);
					break;
				}
				case '7days': {
					const d = new Date(now);
					d.setDate(d.getDate() - 6);
					start = this.formatDate(d);
					break;
				}
				case '30days': {
					const d = new Date(now);
					d.setDate(d.getDate() - 29);
					start = this.formatDate(d);
					break;
				}
				case 'year':
					start = `${now.getFullYear()}-01-01`;
					break;
				default:
					return null;
			}
			return [start, end];
		},
	},
	watch: {
		'param.cat_id'() {
			this.selectedItems = [];
			this.param.page = 1;
			this.loadData();
		},
		'param.colors': {
			handler() {
				this.param.page = 1;
				this.loadData();
			},
			deep: true,
		},
		'param.ratios': {
			handler() {
				this.param.page = 1;
				this.loadData();
			},
			deep: true,
		},
		'param.formats': {
			handler() {
				this.param.page = 1;
				this.loadData();
			},
			deep: true,
		},
		'param.key'() {
			this.param.page = 1;
			this.loadData();
		},
		'param.field'() {
			this.param.page = 1;
			this.loadData();
		},
		computedDateRange() {
			this.applyDateRange();
			this.param.page = 1;
			this.loadData();
		},
	},
	mounted() {
		this.applyDateRange();
		this.listcat();
		this.loadData();
	},
	methods: {
		async listcat() {
			var res = await this.$API.nasdocimage.listcat.get();
			if (res.code === 200) {
				this.categoryTree = [this.rootCat, ...res.data];
				console.log(this.categoryTree);
				return;
			}
			this.categoryTree = [this.rootCat];
			console.log(this.categoryTree);
		},
		loadData() {
			clearTimeout(this.loadTimer);
			this.loadTimer = setTimeout(this.fetchImages, 150);
		},
		async fetchImages() {
			var res = await this.$API.nasdocimage.page.get(this.param);
			if (res.code === 200) {
				if (res.data.items) {
					this.images = res.data.items;
					this.total = parseInt(res.data.totalItems);
				} else {
					this.images = res.data;
					this.total = res.data.length;
				}
				this.buildCategories();
			}
		},
		applyDateRange() {
			const range = this.computedDateRange;
			this.param.start_date = range ? range[0] : '';
			this.param.end_date = range ? range[1] : '';
		},
		paginationChange(page) {
			this.param.page = page;
			this.loadData();
		},
		paginationSizeChange(size) {
			this.param.limit = size;
			this.param.page = 1;
			this.loadData();
		},
		sortChange({ prop, order }) {
			if (prop && order) {
				this.param.field = prop;
				this.param.order = order;
			} else {
				this.param.field = 'createdAt';
				this.param.order = '1';
			}
			this.param.page = 1;
			this.loadData();
		},
		getThumbUrl(item) {
			return this.$SCM.getDataUrl('/Nas/thumbs/' + item.res_id + '.png');
		},
		getImageUrl(id) {
			return this.$SCM.getApiUrl('/NasFile/Vf/' + id);
		},
		getShootDate(time) {
			return this.$TOOL.dateFormat(time);
		},
		buildCategories() {
			this.rootCat.qty = this.images.length;
		},
		selectCategory(cat) {
			console.log(cat)
			this.param.cat = cat.code;
			this.param.cat_id = cat.id;
		},
		changeViewMode(mode) {
			this.viewMode = mode;
			this.selectedItems = [];
		},
		toggleColor(color) {
			const index = this.param.colors.indexOf(color);
			if (index > -1) {
				this.param.colors.splice(index, 1);
			} else {
				this.param.colors.push(color);
			}
		},
		handleDatePresetChange(val) {
			if (val !== 'custom') {
				this.dateRange = null;
			}
		},
		resetFilters() {
			this.param.colors = [];
			this.param.ratios = [];
			this.param.formats = [];
			this.param.key = '';
			this.param.cat_id = 'all';
			this.param.field = 'createdAt';
			this.param.order = '1';
			this.datePreset = '30days';
			this.dateRange = null;
		},
		handleItemClick(event, item) {
			if (event.ctrlKey || event.metaKey) {
				const index = this.selectedItems.indexOf(item.id);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				} else {
					this.selectedItems.push(item.id);
				}
			} else {
				this.selectedItems = [item.id];
			}
		},
		handleRowClick(row) {
			this.selectedItems = [row.id];
		},
		handleSelectionChange(selection) {
			this.selectedItems = selection.map(item => item.id);
		},
		clearSelection() {
			this.selectedItems = [];
		},
		previewImage(item) {
			console.log(this.images)
			this.previewImages = this.images.map(i => this.getImageUrl(i.res_id));
			this.previewIndex = this.images.findIndex(i => i.id === item.id);
			this.imageViewerVisible = true;
		},
		deleteImage(item) {
			this.$confirm(`确定删除 "${item.name}" 吗？`, '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}).then(() => {
				const index = this.images.findIndex(i => i.id === item.id);
				if (index > -1) {
					this.images.splice(index, 1);
					this.buildCategories();
					this.$message.success('删除成功');
				}
			}).catch(() => { });
		},
		formatSize(size) {
			return this.$TOOL.fileSizeFormat(size);
		},
		openUploadDialog() {
			this.uploadDialogVisible = true;
		},
		handleUpload(param) {
			const file = param.file;
			if (!file.type.startsWith('image/')) {
				this.$message.warning('仅支持图片文件');
				param.onError();
				return;
			}

			const url = URL.createObjectURL(file);
			const img = new Image();
			img.onload = () => {
				this.images.unshift({
					id: this.imageIdCounter++,
					name: file.name,
					url: url,
					width: img.naturalWidth,
					height: img.naturalHeight,
					size: file.size,
					type: file.name.split('.').pop().toLowerCase(),
					color: '#64748b',
					folder: '/未分类',
					category: '未分类',
					shootDate: this.formatDate(new Date()),
					createdAt: this.formatDate(new Date()),
				});
				this.buildCategories();
				param.onSuccess();
			};
			img.onerror = () => {
				this.$message.error('图片加载失败');
				param.onError();
			};
			img.src = url;
		},
		submitUpload() {
			this.$refs.uploadRef.submit();
		},
		formatDate(date) {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, '0');
			const d = String(date.getDate()).padStart(2, '0');
			return `${y}-${m}-${d}`;
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
/* 顶部工具栏 */
.image-toolbar {
	justify-content: space-between;
}

.toolbar-left {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-shrink: 0;
}

.image-count {
	font-size: 13px;
	color: var(--color-text-secondary);
}

.toolbar-center {
	flex: 1;
	max-width: 420px;
	margin: 0 16px;
}

.gallery-search :deep(.el-input__wrapper) {
	padding: 3px 12px;
	box-shadow: 0 0 0 1px var(--color-border-dark);
	background-color: #fff;
}

.gallery-search :deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 1px var(--color-primary);
}

.toolbar-right {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-shrink: 0;
}

.view-switch {
	display: flex;
	border: 1px solid var(--color-border-dark);
	border-radius: 4px;
	overflow: hidden;
	background-color: #fff;
}

.view-btn {
	width: 32px;
	height: 30px;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--color-text-secondary);
	transition: all 0.15s;
}

.view-btn:hover {
	background-color: var(--color-bg-hover);
}

.view-btn.active {
	background-color: var(--color-primary-light);
	color: var(--color-primary);
}

.sort-select {
	width: 120px;
}

/* 主内容区布局 */
.gallery-content {
	flex: 1;
	display: flex;
	overflow: hidden;
}

.gallery-sidebar {
	width: 220px;
	flex-shrink: 0;
}

.gallery-main {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.filter-panel {
	width: 260px;
	flex-shrink: 0;
	border-left: 1px solid var(--color-border);
	background-color: var(--color-bg-secondary);
	padding: 16px;
	overflow-y: auto;
}

/* 左侧分类 */
.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 16px 4px;
}

.sidebar-title {
	font-size: 13px;
	font-weight: 600;
	color: var(--color-text-secondary);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.category-list {
	padding: 4px 0;
}

.category-group {
	margin-bottom: 4px;
}

.category-item,
.category-child {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 13px;
	color: var(--color-text);
	transition: background-color 0.15s;
	border-radius: 0;
}

.category-item:hover,
.category-child:hover {
	background-color: var(--color-bg-hover);
}

.category-item.active,
.category-child.active {
	background-color: var(--color-bg-active);
	color: var(--color-primary);
}

.category-child {
	padding-left: 40px;
}

.category-label {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.category-count {
	font-size: 12px;
	color: var(--color-text-tertiary);
	background-color: var(--color-bg-hover);
	padding: 1px 6px;
	border-radius: 10px;
}

/* 右侧过滤面板 */
.filter-section {
	margin-bottom: 20px;
}

.filter-title {
	font-size: 13px;
	font-weight: 600;
	color: var(--color-text);
	margin-bottom: 10px;
}

.color-filter {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.color-dot {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	cursor: pointer;
	border: 2px solid transparent;
	transition: transform 0.15s, box-shadow 0.15s;
}

.color-dot:hover {
	transform: scale(1.1);
}

.color-dot.active {
	box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
	transform: scale(1.1);
}

.size-filter,
.type-filter {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.filter-reset {
	width: 100%;
	justify-content: center;
	color: var(--color-primary) !important;
}

/* 网格视图 */
.view-grid {
	flex: 1;
	overflow-y: auto;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 16px;
	padding: 16px;
	align-content: start;
}

.grid-item {
	cursor: pointer;
	border-radius: 8px;
	overflow: hidden;
	background-color: #fff;
	border: 1px solid var(--color-border-light);
	transition: box-shadow 0.2s, transform 0.2s;
	position: relative;
	min-width: 180px;
	min-height: 218px;
}

.grid-item:hover {
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
	z-index: 2;
}

.grid-item.selected {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px var(--color-primary-light);
}

.grid-thumb {
	position: relative;
	width: 100%;
	height: 160px;
	overflow: hidden;
	background-color: var(--color-bg-secondary);
}

.grid-thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s;
}

.grid-item:hover .grid-thumb img {
	transform: scale(1.05);
}

.grid-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 60%, rgba(0, 0, 0, 0.5) 100%);
	opacity: 0;
	transition: opacity 0.2s;
	display: flex;
	align-items: flex-end;
	justify-content: flex-end;
	padding: 8px;
}

.grid-item:hover .grid-overlay {
	opacity: 1;
}

.grid-actions {
	display: flex;
	gap: 4px;
}

.grid-actions .el-button {
	color: #fff !important;
}

.grid-color-badge {
	position: absolute;
	top: 8px;
	left: 8px;
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: 2px solid #fff;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.grid-info {
	padding: 10px 12px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.grid-name {
	font-size: 13px;
	color: var(--color-text);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.grid-meta {
	font-size: 11px;
	color: var(--color-text-tertiary);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.grid-subrow {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.grid-date {
	font-size: 11px;
	color: var(--color-text-tertiary);
	opacity: 0.8;
	white-space: nowrap;
	flex-shrink: 0;
}

/* 表格视图 */
.view-table {
	flex: 1;
	overflow: hidden;
	padding: 16px;
}

.table-thumb {
	width: 48px;
	height: 48px;
	border-radius: 4px;
	overflow: hidden;
	background-color: var(--color-bg-secondary);
}

.table-thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.table-color-dot {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 1px solid var(--color-border);
}

/* 瀑布流视图 */
.view-waterfall {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
}

.waterfall-columns {
	column-count: 4;
	column-gap: 16px;
}

.waterfall-item {
	break-inside: avoid;
	margin-bottom: 16px;
	cursor: pointer;
	border-radius: 8px;
	overflow: hidden;
	background-color: #fff;
	border: 1px solid var(--color-border-light);
	transition: box-shadow 0.2s, transform 0.2s;
}

.waterfall-item:hover {
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

.waterfall-item.selected {
	border-color: var(--color-primary);
	box-shadow: 0 0 0 2px var(--color-primary-light);
}

.waterfall-thumb {
	position: relative;
	width: 100%;
	overflow: hidden;
	background-color: var(--color-bg-secondary);
}

.waterfall-thumb img {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.waterfall-info {
	padding: 10px 12px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.waterfall-name {
	font-size: 13px;
	color: var(--color-text);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.waterfall-meta {
	font-size: 11px;
	color: var(--color-text-tertiary);
}

/* 空状态与分页 */
.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--color-empty);
}

.empty-state p {
	margin: 12px 0;
	font-size: 14px;
}

.gallery-pagination {
	padding: 12px 16px;
	border-top: 1px solid var(--color-border-light);
	background-color: #fff;
	display: flex;
	justify-content: flex-end;
}

/* 上传对话框 */
.upload-demo {
	margin: 16px 0;
}

.upload-text {
	text-align: center;
}

.upload-hint {
	font-size: 12px;
	color: var(--color-text-tertiary);
	margin-top: 8px;
}

.dialog-footer {
	text-align: right;
}

/* 响应式 */
@media (max-width: 1200px) {
	.waterfall-columns {
		column-count: 3;
	}
}

@media (max-width: 900px) {
	.filter-panel {
		width: 220px;
	}

	.gallery-sidebar {
		width: 180px;
	}

	.waterfall-columns {
		column-count: 2;
	}
}
</style>
