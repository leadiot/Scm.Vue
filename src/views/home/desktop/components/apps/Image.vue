<template>
	<div class="app-container app-dark" @dragover.prevent @drop.prevent="handleDrop">
		<div v-if="!isPreviewMode" class="picture-gallery">
			<div class="app-toolbar">
				<span class="app-header-title">图像</span>
				<span class="gallery-count">{{ pictures.length }} 张图像</span>
				<div class="header-spacer"></div>
				<el-button type="primary" size="small" @click="openFileDialog">
					<sc-icon name="ms-add" style="margin-right: 4px;" />
					添加图像
				</el-button>
				<input ref="fileInput" type="file" accept="image/*" multiple style="display: none;"
					@change="handleFileSelect">
			</div>

			<div v-if="pictures.length === 0" class="app-empty" :class="{ 'drag-over': isDragOver }"
				@dragover="isDragOver = true" @dragleave="isDragOver = false" @drop="handleDrop">
				<sc-icon name="ms-image" :size="64" />
				<p>拖放图像到此处或点击上方按钮添加</p>
				<p class="hint">支持 JPG, PNG, GIF, WebP 格式</p>
			</div>

			<div v-else class="picture-grid">
				<div v-for="(picture, index) in pictures" :key="picture.id" class="picture-item"
					@click="openPreview(index)">
					<div class="picture-thumbnail">
						<img :src="picture.url" :alt="picture.name" />
					</div>
					<div class="picture-info">
						<span class="picture-name">{{ picture.name }}</span>
						<span class="picture-size">{{ $TOOL.fileSizeFormat(picture.size) }}</span>
					</div>
					<div class="picture-actions">
						<el-button text size="small" @click.stop="removePicture(picture.id)">
							<sc-icon name="ms-delete" :size="16" />
						</el-button>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="picture-preview">
			<div class="preview-header">
				<el-button text @click="closePreview">
					<sc-icon name="ms-arrow_back" />
					<span>返回</span>
				</el-button>
				<span class="preview-title">{{ currentPicture?.name }}</span>
				<span class="preview-index">{{ currentIndex + 1 }} / {{ pictures.length }}</span>
			</div>

			<div class="preview-container">
				<div class="preview-image-wrapper" :style="{ transform: `scale(${zoom}) rotate(${rotation}deg)` }"
					@click="toggleControls">
					<img :src="currentPicture?.url" :alt="currentPicture?.name" @load="onImageLoad"
						@error="onImageError" />
				</div>

				<div class="preview-nav prev" @click.stop="prevPicture" :class="{ disabled: currentIndex === 0 }">
					<sc-icon name="ms-chevron_left" :size="48" />
				</div>

				<div class="preview-nav next" @click.stop="nextPicture"
					:class="{ disabled: currentIndex === pictures.length - 1 }">
					<sc-icon name="ms-chevron_right" :size="48" />
				</div>
			</div>

			<div class="preview-toolbar" :class="{ hidden: controlsHidden }">
				<el-button text @click="zoomOut" title="缩小">
					<sc-icon name="ms-zoom_out" :size="24" />
				</el-button>
				<span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
				<el-button text @click="zoomIn" title="放大">
					<sc-icon name="ms-zoom_in" :size="24" />
				</el-button>
				<el-button text @click="resetZoom" title="重置">
					<sc-icon name="ms-fit_screen" :size="24" />
				</el-button>
				<div class="toolbar-divider"></div>
				<el-button text @click="rotateLeft" title="向左旋转">
					<sc-icon name="ms-rotate_left" :size="24" />
				</el-button>
				<el-button text @click="rotateRight" title="向右旋转">
					<sc-icon name="ms-rotate_right" :size="24" />
				</el-button>
				<div class="toolbar-divider"></div>
				<el-button text @click="setAsWallpaper" title="设为壁纸">
					<sc-icon name="ms-wallpaper" :size="24" />
				</el-button>
			</div>

			<div v-if="pictures.length <= 100" class="preview-thumbnails" :class="{ hidden: controlsHidden }">
				<div v-for="(picture, index) in pictures" :key="picture.id" class="thumbnail-item"
					:class="{ active: index === currentIndex }" @click="goToPicture(index)">
					<img :src="picture.url" :alt="picture.name" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Image',
	components: {
		scIcon,
	},
	props: {
		files: { type: Array, default: () => [] },
		index: { type: Number, default: 0 }
	},
	data() {
		return {
			pictures: [],
			isPreviewMode: false,
			currentIndex: 0,
			zoom: 1,
			rotation: 0,
			controlsHidden: false,
			isDragOver: false,
			pictureIdCounter: 1,
		};
	},
	computed: {
		currentPicture() {
			return this.pictures[this.currentIndex];
		},
	},
	methods: {
		loadInitialFiles() {
			if (!this.files || this.files.length < 1) {
				return;
			}

			this.files.forEach(file => {
				this.pictures.push({
					id: file.id,
					name: file.name,
					url: file.url,
					size: file.size || 0,
					type: file.type || 'image/jpeg',
				});
			});

			this.$nextTick(() => {
				this.openPreview(this.index);
			});
		},
		handleDrop(e) {
			this.isDragOver = false;
			const files = e.dataTransfer.files;
			this.loadFiles(files);
		},
		handleFileSelect(e) {
			const files = e.target.files;
			this.loadFiles(files);
			e.target.value = '';
		},
		openFileDialog() {
			this.$refs.fileInput.click();
		},
		loadFiles(files) {
			Array.from(files).forEach(file => {
				if (!file.type.startsWith('image/')) return;

				const url = URL.createObjectURL(file);
				this.pictures.push({
					id: this.pictureIdCounter++,
					name: file.name,
					url: url,
					size: file.size,
					type: file.type,
				});
			});
			this.saveToStorage();
		},
		removePicture(id) {
			const index = this.pictures.findIndex(p => p.id === id);
			if (index > -1) {
				URL.revokeObjectURL(this.pictures[index].url);
				this.pictures.splice(index, 1);
				this.saveToStorage();
			}
		},
		openPreview(index) {
			if (index < 0 || index >= this.pictures.length) {
				index = 0;
			}
			this.currentIndex = index;
			this.isPreviewMode = true;
			this.resetZoom();
			this.rotation = 0;
			this.controlsHidden = false;
		},
		closePreview() {
			this.isPreviewMode = false;
		},
		prevPicture() {
			if (this.currentIndex > 0) {
				this.currentIndex--;
				this.resetZoom();
				this.rotation = 0;
			}
		},
		nextPicture() {
			if (this.currentIndex < this.pictures.length - 1) {
				this.currentIndex++;
				this.resetZoom();
				this.rotation = 0;
			}
		},
		goToPicture(index) {
			this.currentIndex = index;
			this.resetZoom();
			this.rotation = 0;
		},
		zoomIn() {
			if (this.zoom < 5) {
				this.zoom = Math.min(5, this.zoom + 0.25);
			}
		},
		zoomOut() {
			if (this.zoom > 0.25) {
				this.zoom = Math.max(0.25, this.zoom - 0.25);
			}
		},
		resetZoom() {
			this.zoom = 1;
		},
		rotateLeft() {
			this.rotation -= 90;
		},
		rotateRight() {
			this.rotation += 90;
		},
		toggleControls() {
			this.controlsHidden = !this.controlsHidden;
		},
		setAsWallpaper() {
			if (!this.currentPicture) return;
			this.$emit('set-wallpaper', this.currentPicture.url);
			this.$message.success('已设为桌面壁纸');
		},
		onImageLoad() {
		},
		onImageError() {
			this.$message.error('图像加载失败');
		},
		saveToStorage() {
			const data = this.pictures.map(p => ({
				id: p.id,
				name: p.name,
				url: p.url,
				size: p.size,
				type: p.type,
			}));
			localStorage.setItem('desktop_pictures', JSON.stringify({
				pictures: data,
				pictureIdCounter: this.pictureIdCounter,
			}));
		},
		loadFromStorage() {
		},
		handleKeydown(e) {
			if (!this.isPreviewMode) return;

			switch (e.key) {
				case 'ArrowLeft':
					this.prevPicture();
					break;
				case 'ArrowRight':
					this.nextPicture();
					break;
				case 'Escape':
					this.closePreview();
					break;
				case '+':
				case '=':
					this.zoomIn();
					break;
				case '-':
					this.zoomOut();
					break;
				case '0':
					this.resetZoom();
					break;
			}
		},
	},
	mounted() {
		document.addEventListener('keydown', this.handleKeydown);
		this.loadInitialFiles();
	},
	unmounted() {
		document.removeEventListener('keydown', this.handleKeydown);
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.picture-gallery {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header-spacer {
	flex: 1;
}

.gallery-count {
	font-size: 13px;
	color: #999;
}

.picture-grid {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 15px;
	padding: 20px;
	overflow-y: auto;
	align-content: start;
}

.picture-item {
	cursor: pointer;
	transition: transform 0.3s;
	border-radius: 8px;
	overflow: hidden;
	background-color: #2a2a2a;
	position: relative;
}

.picture-item:hover {
	transform: translateY(-5px);
}

.picture-item:hover .picture-actions {
	opacity: 1;
}

.picture-thumbnail {
	width: 100%;
	height: 140px;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #333;
}

.picture-thumbnail img {
	max-width: 100%;
	max-height: 100%;
	object-fit: cover;
}

.picture-info {
	padding: 10px;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.picture-name {
	font-size: 13px;
	color: #fff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.picture-size {
	font-size: 11px;
	color: #666;
}

.picture-actions {
	position: absolute;
	top: 8px;
	right: 8px;
	opacity: 0;
	transition: opacity 0.3s;
}

.picture-preview {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
}

.preview-header {
	display: flex;
	align-items: center;
	padding: 10px 15px;
	background-color: #252525;
	gap: 15px;
	flex-shrink: 0;
}

.preview-header .el-button {
	color: #fff;
}

.preview-title {
	flex: 1;
	font-size: 14px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.preview-index {
	font-size: 13px;
	color: #999;
}

.preview-container {
	flex: 1;
	min-height: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.preview-image-wrapper {
	transition: transform 0.3s ease;
	max-width: 100%;
	max-height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-image-wrapper img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.preview-nav {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	color: rgba(255, 255, 255, 0.7);
	transition: all 0.3s;
	border-radius: 50%;
}

.preview-nav:hover {
	color: #fff;
	background-color: rgba(255, 255, 255, 0.1);
}

.preview-nav.disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

.preview-nav.prev {
	left: 20px;
}

.preview-nav.next {
	right: 20px;
}

.preview-toolbar {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 15px;
	background-color: rgba(0, 0, 0, 0.8);
	gap: 10px;
	transition: opacity 0.3s, height 0.3s, padding 0.3s;
	flex-shrink: 0;
	overflow: hidden;
}

.preview-toolbar.hidden {
	opacity: 0;
	height: 0;
	padding-top: 0;
	padding-bottom: 0;
}

.preview-toolbar .el-button {
	color: #fff !important;
}

.zoom-level {
	font-size: 13px;
	color: #fff;
	min-width: 50px;
	text-align: center;
}

.toolbar-divider {
	width: 1px;
	height: 20px;
	background-color: #555;
	margin: 0 10px;
}

.preview-thumbnails {
	display: flex;
	justify-content: center;
	gap: 8px;
	padding: 10px;
	background-color: #252525;
	overflow-x: auto;
	transition: opacity 0.3s, height 0.3s, padding 0.3s;
	flex-shrink: 0;
}

.preview-thumbnails.hidden {
	opacity: 0;
	height: 0;
	padding-top: 0;
	padding-bottom: 0;
}

.thumbnail-item {
	width: 60px;
	height: 60px;
	border-radius: 4px;
	overflow: hidden;
	cursor: pointer;
	opacity: 0.6;
	transition: all 0.3s;
	flex-shrink: 0;
}

.thumbnail-item:hover {
	opacity: 0.9;
}

.thumbnail-item.active {
	opacity: 1;
	border: 2px solid #409eff;
}

.thumbnail-item img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
</style>
