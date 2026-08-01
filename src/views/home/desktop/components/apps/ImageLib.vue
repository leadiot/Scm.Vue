<template>
	<div class="app-container app-light" @click.self="clearSelection">
		<!-- 顶部工具栏 -->
		<div class="app-toolbar image-toolbar">
			<div class="toolbar-left">
				<span class="app-header-title">图库</span>
				<span class="image-count">{{ filteredImages.length }} 张照片</span>
			</div>
			<div class="toolbar-center">
				<el-input v-model="param.key" placeholder="搜索照片、文件夹或标签…" size="small" clearable
					class="gallery-search">
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
				<el-select v-model="sortField" size="small" class="sort-select">
					<el-option v-for="s in sortOptions" :key="s.value" :label="s.label" :value="s.value" />
				</el-select>
				<el-button type="primary" size="small" @click="openUploadDialog">
					<sc-icon name="ms-upload" :size="16" style="margin-right: 4px;" />
					上传
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
							<div class="category-item" :class="{ active: selectedCategory === cat.id }"
								@click="selectCategory(cat.id)">
								<sc-icon :name="cat.icon" :size="16" />
								<span class="category-label">{{ cat.name }}</span>
								<span v-if="cat.count" class="category-count">{{ cat.count }}</span>
							</div>
							<div v-if="cat.children" class="category-children">
								<div v-for="child in cat.children" :key="child.id"
									class="category-child" :class="{ active: selectedCategory === child.id }"
									@click.stop="selectCategory(child.id)">
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
					<div v-for="item in pagedImages" :key="item.id" class="grid-item"
						:class="{ selected: selectedItems.includes(item.id) }"
						@click="handleItemClick($event, item)" @dblclick="previewImage(item)">
						<div class="grid-thumb">
							<img :src="item.url" :alt="item.name" loading="lazy" />
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
							<span class="grid-name">{{ item.name }}</span>
							<span class="grid-meta">{{ formatSize(item.size) }} · {{ item.width }}×{{ item.height }}</span>
						</div>
					</div>
				</div>

				<!-- 表格视图 -->
				<div v-else-if="viewMode === 'table'" class="view-table">
					<el-table :data="pagedImages" style="width: 100%;" height="100%" @row-click="handleRowClick"
						@selection-change="handleSelectionChange">
						<el-table-column type="selection" width="45" />
						<el-table-column label="缩略图" width="80">
							<template #default="{ row }">
								<div class="table-thumb">
									<img :src="row.url" :alt="row.name" />
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="name" label="文件名" min-width="160" show-overflow-tooltip />
						<el-table-column prop="folder" label="目录" width="120" show-overflow-tooltip />
						<el-table-column prop="category" label="分类" width="100" />
						<el-table-column label="尺寸" width="120">
							<template #default="{ row }">
								{{ row.width }}×{{ row.height }}
							</template>
						</el-table-column>
						<el-table-column label="大小" width="100">
							<template #default="{ row }">
								{{ formatSize(row.size) }}
							</template>
						</el-table-column>
						<el-table-column prop="shootDate" label="拍摄日期" width="120" sortable />
						<el-table-column prop="createdAt" label="创建日期" width="120" sortable />
						<el-table-column label="主色调" width="80">
							<template #default="{ row }">
								<div class="table-color-dot" :style="{ backgroundColor: row.color }" />
							</template>
						</el-table-column>
						<el-table-column label="操作" width="100" fixed="right">
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
					<div v-for="item in pagedImages" :key="item.id" class="waterfall-item"
						:class="{ selected: selectedItems.includes(item.id) }"
						@click="handleItemClick($event, item)" @dblclick="previewImage(item)">
						<div class="waterfall-thumb" :style="{ paddingBottom: (item.height / item.width * 100) + '%' }">
							<img :src="item.url" :alt="item.name" loading="lazy" />
						</div>
						<div class="waterfall-info">
							<span class="waterfall-name">{{ item.name }}</span>
							<span class="waterfall-meta">{{ formatSize(item.size) }}</span>
						</div>
					</div>
				</div>

				<!-- 空状态 -->
				<div v-if="pagedImages.length === 0" class="empty-state">
					<sc-icon :name="param.key ? 'ms-search_off' : 'ms-image'" :size="64" />
					<p v-if="param.key">未找到匹配 "{{ param.key }}" 的照片</p>
					<p v-else>图库为空</p>
					<el-button v-if="!param.key" type="primary" size="small" @click="openUploadDialog">
						<sc-icon name="ms-upload" :size="16" style="margin-right: 4px;" />
						上传照片
					</el-button>
				</div>

				<!-- 分页 -->
				<div v-if="filteredImages.length > 0" class="gallery-pagination">
					<el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
						:page-sizes="[20, 40, 80, 120]" :total="filteredImages.length" layout="total, sizes, prev, pager, next"
						background />
				</div>
			</div>

			<!-- 右侧过滤面板 -->
			<div class="filter-panel">
				<div class="filter-section">
					<div class="filter-title">主色调</div>
					<div class="color-filter">
						<div v-for="c in colorFilters" :key="c.value" class="color-dot"
							:class="{ active: selectedColors.includes(c.value) }" :style="{ backgroundColor: c.value }"
							:title="c.label" @click="toggleColor(c.value)" />
					</div>
				</div>

				<div class="filter-section">
					<div class="filter-title">尺寸</div>
					<div class="size-filter">
						<el-checkbox-group v-model="selectedSizes">
							<el-checkbox v-for="s in sizeFilters" :key="s.value" :label="s.value">{{ s.label }}</el-checkbox>
						</el-checkbox-group>
					</div>
				</div>

				<div class="filter-section">
					<div class="filter-title">日期范围</div>
					<el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
						end-placeholder="结束日期" size="small" style="width: 100%;" value-format="YYYY-MM-DD" />
				</div>

				<div class="filter-section">
					<div class="filter-title">文件类型</div>
					<el-checkbox-group v-model="selectedTypes">
						<el-checkbox v-for="t in typeFilters" :key="t.value" :label="t.value">{{ t.label }}</el-checkbox>
					</el-checkbox-group>
				</div>

				<el-button text size="small" class="filter-reset" @click="resetFilters">
					<sc-icon name="ms-refresh" :size="14" style="margin-right: 4px;" />
					重置过滤
				</el-button>
			</div>
		</div>

		<!-- 底部状态栏 -->
		<div class="app-statusbar">
			<span>{{ filteredImages.length }} 张照片</span>
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
	name: 'ImageLib',
	components: {
		scIcon,
	},
	props: {
		files: { type: Array, default: () => [] }
	},
	data() {
		return {
			param: {
				key: '',
			},
			viewMode: 'grid',
			viewModes: [
				{ value: 'grid', label: '网格', icon: 'ms-grid_view' },
				{ value: 'table', label: '表格', icon: 'ms-table_rows' },
				{ value: 'waterfall', label: '瀑布流', icon: 'ms-view_week' },
			],
			sortField: 'createdAt',
			sortOptions: [
				{ value: 'createdAt', label: '按创建日期' },
				{ value: 'shootDate', label: '按拍摄日期' },
				{ value: 'name', label: '按文件名' },
				{ value: 'size', label: '按文件大小' },
			],
			selectedCategory: 'all',
			categoryTree: [],
			images: [],
			selectedItems: [],
			selectedColors: [],
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
			selectedSizes: [],
			sizeFilters: [
				{ value: 'small', label: '小 (< 1MB)' },
				{ value: 'medium', label: '中 (1MB - 5MB)' },
				{ value: 'large', label: '大 (> 5MB)' },
			],
			selectedTypes: [],
			typeFilters: [
				{ value: 'jpg', label: 'JPG' },
				{ value: 'png', label: 'PNG' },
				{ value: 'gif', label: 'GIF' },
				{ value: 'webp', label: 'WebP' },
			],
			dateRange: null,
			currentPage: 1,
			pageSize: 40,
			imageViewerVisible: false,
			previewImages: [],
			previewIndex: 0,
			uploadDialogVisible: false,
			imageIdCounter: 1,
		};
	},
	computed: {
		filteredImages() {
			let list = this.images.slice();

			// 搜索过滤
			const keyword = this.param.key.trim().toLowerCase();
			if (keyword) {
				list = list.filter(item => item.name.toLowerCase().includes(keyword));
			}

			// 分类过滤
			if (this.selectedCategory !== 'all') {
				if (this.selectedCategory.startsWith('date-')) {
					const year = this.selectedCategory.replace('date-', '');
					list = list.filter(item => item.createdAt && item.createdAt.startsWith(year));
				} else if (this.selectedCategory.startsWith('folder-')) {
					const folder = this.selectedCategory.replace('folder-', '');
					list = list.filter(item => item.folder === folder);
				} else if (this.selectedCategory.startsWith('category-')) {
					const cat = this.selectedCategory.replace('category-', '');
					list = list.filter(item => item.category === cat);
				} else if (this.selectedCategory.startsWith('shoot-')) {
					const month = this.selectedCategory.replace('shoot-', '');
					list = list.filter(item => item.shootDate && item.shootDate.startsWith(month));
				}
			}

			// 颜色过滤
			if (this.selectedColors.length > 0) {
				list = list.filter(item => this.selectedColors.includes(item.color));
			}

			// 尺寸过滤
			if (this.selectedSizes.length > 0) {
				list = list.filter(item => {
					const mb = item.size / (1024 * 1024);
					return this.selectedSizes.some(size => {
						if (size === 'small') return mb < 1;
						if (size === 'medium') return mb >= 1 && mb <= 5;
						if (size === 'large') return mb > 5;
						return false;
					});
				});
			}

			// 日期范围过滤
			if (this.dateRange && this.dateRange.length === 2) {
				const [start, end] = this.dateRange;
				list = list.filter(item => item.createdAt >= start && item.createdAt <= end);
			}

			// 文件类型过滤
			if (this.selectedTypes.length > 0) {
				list = list.filter(item => this.selectedTypes.includes(item.type));
			}

			// 排序
			list.sort((a, b) => {
				let va = a[this.sortField];
				let vb = b[this.sortField];
				if (this.sortField === 'size') {
					return vb - va;
				}
				if (typeof va === 'string') {
					return vb.localeCompare(va);
				}
				return vb - va;
			});

			return list;
		},
		pagedImages() {
			const start = (this.currentPage - 1) * this.pageSize;
			return this.filteredImages.slice(start, start + this.pageSize);
		},
	},
	watch: {
		filteredImages() {
			this.currentPage = 1;
		},
		selectedCategory() {
			this.selectedItems = [];
		},
	},
	mounted() {
		this.loadDemoData();
		this.buildCategories();
	},
	methods: {
		loadDemoData() {
			const demos = [
				{ id: 1, name: '海边日落.jpg', width: 1920, height: 1080, size: 2.4 * 1024 * 1024, type: 'jpg', color: '#f97316', folder: '/旅行', category: '风景', shootDate: '2024-06-12', createdAt: '2024-06-15' },
				{ id: 2, name: '山间晨雾.jpg', width: 1600, height: 2400, size: 3.1 * 1024 * 1024, type: 'jpg', color: '#22c55e', folder: '/旅行', category: '风景', shootDate: '2024-05-20', createdAt: '2024-05-22' },
				{ id: 3, name: '城市夜景.png', width: 2048, height: 1365, size: 4.5 * 1024 * 1024, type: 'png', color: '#3b82f6', folder: '/街拍', category: '城市', shootDate: '2024-04-08', createdAt: '2024-04-10' },
				{ id: 4, name: '猫咪特写.jpg', width: 1200, height: 1600, size: 0.8 * 1024 * 1024, type: 'jpg', color: '#64748b', folder: '/宠物', category: '动物', shootDate: '2024-07-01', createdAt: '2024-07-02' },
				{ id: 5, name: '樱花季.webp', width: 1800, height: 1200, size: 1.2 * 1024 * 1024, type: 'webp', color: '#ec4899', folder: '/旅行', category: '风景', shootDate: '2024-03-25', createdAt: '2024-03-28' },
				{ id: 6, name: '美食记录.jpg', width: 1500, height: 1500, size: 1.6 * 1024 * 1024, type: 'jpg', color: '#eab308', folder: '/生活', category: '美食', shootDate: '2024-06-30', createdAt: '2024-07-01' },
				{ id: 7, name: '雪山风光.jpg', width: 2400, height: 1600, size: 5.8 * 1024 * 1024, type: 'jpg', color: '#3b82f6', folder: '/旅行', category: '风景', shootDate: '2024-02-14', createdAt: '2024-02-16' },
				{ id: 8, name: '工作会议.jpg', width: 1920, height: 1080, size: 1.1 * 1024 * 1024, type: 'jpg', color: '#8b5cf6', folder: '/工作', category: '文档', shootDate: '2024-07-10', createdAt: '2024-07-10' },
				{ id: 9, name: '儿童节.gif', width: 600, height: 600, size: 0.5 * 1024 * 1024, type: 'gif', color: '#ef4444', folder: '/生活', category: '节日', shootDate: '2024-06-01', createdAt: '2024-06-01' },
				{ id: 10, name: '建筑线条.jpg', width: 1600, height: 2400, size: 2.9 * 1024 * 1024, type: 'jpg', color: '#64748b', folder: '/街拍', category: '城市', shootDate: '2024-01-20', createdAt: '2024-01-22' },
			];
			this.images = demos.map(item => ({
				...item,
				url: `https://picsum.photos/id/${30 + item.id}/${Math.min(item.width, 800)}/${Math.min(item.height, 600)}`,
			}));
			this.imageIdCounter = this.images.length + 1;
		},
		buildCategories() {
			const years = {};
			const folders = {};
			const categories = {};
			const shootMonths = {};

			this.images.forEach(item => {
				if (item.createdAt) {
					const year = item.createdAt.slice(0, 4);
					years[year] = (years[year] || 0) + 1;
				}
				if (item.folder) {
					folders[item.folder] = (folders[item.folder] || 0) + 1;
				}
				if (item.category) {
					categories[item.category] = (categories[item.category] || 0) + 1;
				}
				if (item.shootDate) {
					const month = item.shootDate.slice(0, 7);
					shootMonths[month] = (shootMonths[month] || 0) + 1;
				}
			});

			this.categoryTree = [
				{
					id: 'all',
					name: '全部照片',
					icon: 'ms-image',
					count: this.images.length,
				},
				{
					id: 'date',
					name: '创建日期',
					icon: 'ms-calendar_today',
					children: Object.keys(years).sort((a, b) => b - a).map(year => ({
						id: `date-${year}`,
						name: `${year}年`,
						count: years[year],
					})),
				},
				{
					id: 'shoot',
					name: '拍摄日志',
					icon: 'ms-camera',
					children: Object.keys(shootMonths).sort((a, b) => b.localeCompare(a)).map(month => ({
						id: `shoot-${month}`,
						name: month,
						count: shootMonths[month],
					})),
				},
				{
					id: 'folder',
					name: '目录',
					icon: 'ms-folder',
					children: Object.keys(folders).sort().map(folder => ({
						id: `folder-${folder}`,
						name: folder,
						count: folders[folder],
					})),
				},
				{
					id: 'custom',
					name: '自定义分类',
					icon: 'ms-label',
					children: Object.keys(categories).sort().map(cat => ({
						id: `category-${cat}`,
						name: cat,
						count: categories[cat],
					})),
				},
			];
		},
		selectCategory(id) {
			this.selectedCategory = id;
		},
		changeViewMode(mode) {
			this.viewMode = mode;
			this.selectedItems = [];
		},
		toggleColor(color) {
			const index = this.selectedColors.indexOf(color);
			if (index > -1) {
				this.selectedColors.splice(index, 1);
			} else {
				this.selectedColors.push(color);
			}
		},
		resetFilters() {
			this.selectedColors = [];
			this.selectedSizes = [];
			this.selectedTypes = [];
			this.dateRange = null;
			this.param.key = '';
			this.selectedCategory = 'all';
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
			this.previewImages = this.filteredImages.map(i => i.url);
			this.previewIndex = this.filteredImages.findIndex(i => i.id === item.id);
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
	height: 28px;
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
}

.grid-item:hover {
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	transform: translateY(-2px);
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
	.view-waterfall {
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

	.view-waterfall {
		column-count: 2;
	}
}
</style>
