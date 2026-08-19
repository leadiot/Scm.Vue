<template>
	<div class="app-container app-light notes-layout">
		<!-- 左侧便签列表 -->
		<div class="notes-sidebar">
			<div class="sidebar-header">
				<span class="sidebar-title">便签列表</span>
				<el-button text size="small" @click="createNote" type="primary">
					<sc-icon name="ms-add" :size="18" />
				</el-button>
			</div>

			<div class="sidebar-search">
				<el-input v-model="searchKeyword" placeholder="搜索便签..." clearable size="small">
					<template #prefix>
						<sc-icon name="ms-search" :size="16" />
					</template>
				</el-input>
			</div>

			<div class="sidebar-list">
				<div v-for="note in filteredNotes" :key="note.id" class="note-item"
					:class="{ active: currentNoteId === note.id }" @click="openNote(note)">
					<div class="note-item-content">
						<div class="note-item-title">{{ note.title || '未命名' }}</div>
						<div class="note-item-preview">{{ getPreview(note.content) }}</div>
						<div class="note-item-meta">
							<span>{{ formatDate(note.update_time || note.create_time) }}</span>
						</div>
					</div>
					<div class="note-item-actions">
						<el-button text size="small" @click.stop="deleteNote(note)" type="danger">
							<sc-icon name="ms-delete" :size="14" />
						</el-button>
					</div>
				</div>

				<div v-if="filteredNotes.length === 0" class="sidebar-empty">
					<sc-icon name="ms-note" :size="48" />
					<p>{{ searchKeyword ? '未找到匹配的便签' : '暂无便签' }}</p>
				</div>
			</div>
		</div>

		<!-- 右侧编辑区 -->
		<div class="notes-main">
			<template v-if="currentNote">
				<!-- 标题栏 -->
				<div class="note-title-bar">
					<el-input v-model="currentNote.title" placeholder="请输入标题" size="small" maxlength="50" clearable />
					<el-button text size="small" @click="saveNote" type="primary" :disabled="!hasChanges">
						<sc-icon name="ms-save" :size="18" style="margin-right: 4px;" />
						保存
					</el-button>
				</div>

				<!-- 编辑区 -->
				<textarea ref="editorRef" v-model="currentNote.content" class="notepad-editor"
					placeholder="开始输入内容..."></textarea>

				<!-- 状态栏 -->
				<div class="notepad-status">
					<span>字数：{{ wordCount }}</span>
					<span v-if="currentNote.update_time">上次保存：{{ $TOOL.dateTimeFormat(currentNote.update_time) }}</span>
				</div>
			</template>

			<!-- 未选择便签时的提示 -->
			<div v-else class="notes-placeholder">
				<sc-icon name="ms-note" :size="64" />
				<p>选择或创建一个便签开始编辑</p>
				<el-button type="primary" @click="createNote">
					<sc-icon name="ms-add" :size="18" style="margin-right: 4px;" />
					新建便签
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	windowOptions: {
		icon: 'ms-sticky_note_2',
		width: 800,
		height: 560,
		resizable: true,
	},
	name: 'Notepad',
	components: {
		scIcon,
	},
	props: {
		files: { type: Array, default: () => [] },
		index: { type: Number, default: 0 }
	},
	data() {
		return {
			noteList: [],
			currentNoteId: null,
			currentNote: null,
			originalTitle: '',
			originalContent: '',
			searchKeyword: '',
			loading: false,
		};
	},
	computed: {
		filteredNotes() {
			if (!this.searchKeyword) {
				return this.noteList;
			}
			const keyword = this.searchKeyword.toLowerCase();
			return this.noteList.filter(note => {
				const title = (note.title || '').toLowerCase();
				const content = (note.content || '').toLowerCase();
				return title.includes(keyword) || content.includes(keyword);
			});
		},
		hasChanges() {
			if (!this.currentNote) {
				return false;
			}
			return this.currentNote.title !== this.originalTitle || this.currentNote.content !== this.originalContent;
		},
		wordCount() {
			return this.currentNote ? (this.currentNote.content || '').length : 0;
		},
	},
	methods: {
		getPreview(content) {
			if (!content) return '';
			return content.substring(0, 50);
		},
		formatDate(date) {
			if (!date) return '';
			const d = new Date(Number(date));
			const now = new Date();
			const diff = now - d;

			if (diff < 60000) return '刚刚';
			if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
			if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
			if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

			return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
		},
		async loadNoteList() {
			this.loading = true;
			try {
				var res = await this.$API.scmsysnotes.list.get();
				if (res.code == 200) {
					this.noteList = res.data || [];
				}
			} finally {
				this.loading = false;
			}
		},
		async openNote(note) {
			// 检查是否有未保存的更改
			if (this.hasChanges) {
				try {
					await this.$confirm('当前便签有未保存的更改，是否保存？', '提示', {
						confirmButtonText: '保存',
						cancelButtonText: '不保存',
						distinguishCancelAndClose: true,
						type: 'warning',
					});
					await this.saveNote();
				} catch {
					// 用户选择不保存或关闭，继续打开新便签
				}
			}

			this.currentNoteId = note.id;
			var res = await this.$API.scmsysnotes.edit.get(note.id);
			if (res.code != 200) {
				this.$message.error(res.message || '获取便签失败');
				return;
			}

			this.currentNote = res.data;
			this.originalTitle = this.currentNote.title || '';
			this.originalContent = this.currentNote.content || '';

			this.$nextTick(() => {
				this.$refs.editorRef?.focus();
			});
		},
		async createNote() {
			// 检查是否有未保存的更改
			if (this.hasChanges) {
				try {
					await this.$confirm('当前便签有未保存的更改，是否保存？', '提示', {
						confirmButtonText: '保存',
						cancelButtonText: '不保存',
						distinguishCancelAndClose: true,
						type: 'warning',
					});
					await this.saveNote();
				} catch {
					// 用户选择不保存或关闭，继续创建新便签
				}
			}

			var res = await this.$API.scmsysnotes.add.post({
				title: '新建便签',
				content: '',
				types: 1
			});

			if (res.code == 200) {
				const newNote = res.data || {
					id: this.$SCM.DEF_ID,
					title: '新建便签',
					content: '',
					create_time: Date.now()
				};
				this.noteList.unshift(newNote);
				await this.openNote(newNote);
			} else {
				this.$message.error(res.message || '创建失败');
			}
		},
		async saveNote() {
			if (!this.currentNote) {
				return false;
			}

			const title = (this.currentNote.title || '').trim();
			if (!title) {
				this.$message.warning('标题不能为空');
				return false;
			}
			this.currentNote.title = title;

			var data = {
				id: this.currentNote.id,
				types: this.currentNote.types || 1,
				title: title,
				content: this.currentNote.content,
			};

			var res = await this.$API.scmsysnotes.save.post(data);
			if (res.code != 200) {
				this.$message.warning(res.message);
				return false;
			}

			// 更新列表中的便签
			const index = this.noteList.findIndex(n => n.id === this.currentNote.id);
			if (index >= 0) {
				this.noteList[index] = { ...this.noteList[index], ...res.data, title: this.currentNote.title, content: this.currentNote.content };
			}

			this.currentNote = { ...this.currentNote, ...res.data };
			this.originalTitle = this.currentNote.title || '';
			this.originalContent = this.currentNote.content || '';
			this.$message.success('保存成功');
		},
		async deleteNote(note) {
			try {
				await this.$confirm('确定要删除这个便签吗？', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning',
				});

				var res = await this.$API.scmsysnotes.delete.delete(note.id);
				if (res.code == 200) {
					const index = this.noteList.findIndex(n => n.id === note.id);
					if (index >= 0) {
						this.noteList.splice(index, 1);
					}

					// 如果删除的是当前打开的便签，清空编辑区
					if (this.currentNoteId === note.id) {
						this.currentNoteId = null;
						this.currentNote = null;
						this.originalTitle = '';
						this.originalContent = '';
					}

					this.$message.success('删除成功');
				} else {
					this.$message.error(res.message || '删除失败');
				}
			} catch {
				// 用户取消删除
			}
		},
	},
	mounted() {
		this.loadNoteList();
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.notes-layout {
	display: flex;
	flex-direction: row;
	padding: 0;
}

/* 左侧便签列表 */
.notes-sidebar {
	width: 280px;
	min-width: 280px;
	border-right: 1px solid var(--color-border-light);
	display: flex;
	flex-direction: column;
	background-color: var(--color-bg-secondary);
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 15px 15px 10px;
	border-bottom: 1px solid var(--color-border-light);
}

.sidebar-title {
	font-size: 14px;
	font-weight: 500;
	color: var(--color-text);
}

.sidebar-search {
	padding: 10px 15px;
	border-bottom: 1px solid var(--color-border-light);
}

.sidebar-list {
	flex: 1;
	overflow-y: auto;
	padding: 10px 0;
}

.note-item {
	display: flex;
	align-items: flex-start;
	padding: 10px 15px;
	cursor: pointer;
	transition: all 0.2s;
	border-bottom: 1px solid var(--color-border-lighter);
}

.note-item:hover {
	background-color: var(--color-bg-hover);
}

.note-item.active {
	background-color: var(--color-primary-light-9);
	border-left: 3px solid var(--color-primary);
}

.note-item-content {
	flex: 1;
	min-width: 0;
}

.note-item-title {
	font-size: 14px;
	font-weight: 500;
	color: var(--color-text);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 4px;
}

.note-item-preview {
	font-size: 12px;
	color: var(--color-text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	margin-bottom: 4px;
}

.note-item-meta {
	font-size: 11px;
	color: var(--color-text-hint);
}

.note-item-actions {
	opacity: 0;
	transition: opacity 0.2s;
}

.note-item:hover .note-item-actions {
	opacity: 1;
}

.sidebar-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	color: var(--color-text-tertiary);
}

.sidebar-empty p {
	margin-top: 15px;
	font-size: 14px;
}

/* 右侧编辑区 */
.notes-main {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
	background-color: var(--color-bg);
}

.notes-placeholder {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--color-text-tertiary);
	gap: 20px;
}

.notes-placeholder p {
	font-size: 16px;
}

/* 标题栏 */
.note-title-bar {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background-color: var(--color-bg-secondary);
	border-bottom: 1px solid var(--color-border-light);
}

.note-title-bar .el-input {
	flex: 1;
}

/* 编辑区 */
.notepad-editor {
	flex: 1;
	width: 100%;
	padding: 20px;
	overflow-y: auto;
	outline: none;
	border: none;
	resize: none;
	font-family: inherit;
	font-size: 14px;
	line-height: 1.8;
	color: var(--color-text);
	background-color: var(--color-bg);
}

.notepad-editor::placeholder {
	color: var(--color-text-hint);
}

/* 状态栏 */
.notepad-status {
	display: flex;
	justify-content: space-between;
	padding: 6px 12px;
	background-color: var(--color-bg-secondary);
	border-top: 1px solid var(--color-border-light);
	font-size: 12px;
	color: var(--color-text-hint);
}
</style>
