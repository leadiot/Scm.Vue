<template>
	<div class="app-container app-light notes-layout">
		<!-- 左侧笔记列表 -->
		<div class="notes-sidebar">
			<div class="sidebar-header">
				<span class="sidebar-title">笔记列表</span>
				<el-button text size="small" @click="createNote" type="primary">
					<sc-icon name="ms-add" :size="18" />
				</el-button>
			</div>

			<div class="sidebar-search">
				<el-input v-model="searchKeyword" placeholder="搜索笔记..." clearable size="small">
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
					<p>{{ searchKeyword ? '未找到匹配的笔记' : '暂无笔记' }}</p>
				</div>
			</div>
		</div>

		<!-- 右侧编辑区 -->
		<div class="notes-main">
			<template v-if="currentNote">
				<!-- 工具栏 -->
				<div class="notepad-toolbar">
					<div class="toolbar-group">
						<el-dropdown trigger="click" @command="setFontSize" @visible-change="onDropdownVisible">
							<el-button text size="small">
								字号 <sc-icon name="ms-arrow_drop_down" :size="16" />
							</el-button>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item v-for="size in fontSizes" :key="size" :command="size">
										{{ size }}px
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="execCommand('bold')" title="加粗">
							<sc-icon name="ms-format_bold" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('italic')" title="斜体">
							<sc-icon name="ms-format_italic" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('underline')" title="下划线">
							<sc-icon name="ms-format_underlined" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('strikeThrough')" title="删除线">
							<sc-icon name="ms-strikethrough_s" :size="18" />
						</el-button>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<div @mousedown="saveColorRange">
							<el-color-picker v-model="textColor" size="small" @change="setTextColor" title="文字颜色" />
						</div>
						<div @mousedown="saveColorRange">
							<el-color-picker v-model="bgColor" size="small" @change="setBgColor" title="背景颜色" />
						</div>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="execCommand('justifyLeft')" title="左对齐">
							<sc-icon name="ms-format_align_left" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('justifyCenter')" title="居中">
							<sc-icon name="ms-format_align_center" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('justifyRight')" title="右对齐">
							<sc-icon name="ms-format_align_right" :size="18" />
						</el-button>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="execCommand('insertUnorderedList')" title="无序列表">
							<sc-icon name="ms-format_list_bulleted" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('insertOrderedList')" title="有序列表">
							<sc-icon name="ms-format_list_numbered" :size="18" />
						</el-button>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="execCommand('undo')" title="撤销">
							<sc-icon name="ms-undo" :size="18" />
						</el-button>
						<el-button text size="small" @click="execCommand('redo')" title="重做">
							<sc-icon name="ms-redo" :size="18" />
						</el-button>
					</div>

					<div class="toolbar-divider"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="clearFormat" title="清除格式">
							<sc-icon name="ms-format_clear" :size="18" />
						</el-button>
					</div>

					<div class="toolbar-spacer"></div>

					<div class="toolbar-group">
						<el-button text size="small" @click="saveNote" type="primary" :disabled="!hasChanges">
							<sc-icon name="ms-save" :size="18" style="margin-right: 4px;" />
							保存
						</el-button>
					</div>
				</div>

				<!-- 编辑区 -->
				<div class="notepad-editor" ref="editorRef" contenteditable="true" @input="onEditorInput"
					@paste="onPaste">
				</div>

				<!-- 状态栏 -->
				<div class="notepad-status">
					<span>字数：{{ wordCount }}</span>
					<span v-if="currentNote.update_time">上次保存：{{ $TOOL.dateTimeFormat(currentNote.update_time) }}</span>
				</div>
			</template>

			<!-- 未选择笔记时的提示 -->
			<div v-else class="notes-placeholder">
				<sc-icon name="ms-note" :size="64" />
				<p>选择或创建一个笔记开始编辑</p>
				<el-button type="primary" @click="createNote">
					<sc-icon name="ms-add" :size="18" style="margin-right: 4px;" />
					新建笔记
				</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
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
			originalContent: '',
			bgColor: '#ffff00',
			textColor: '#333333',
			fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72],
			wordCount: 0,
			savedRange: null,
			savedColorRange: null,
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
				const content = this.getPlainText(note.content).toLowerCase();
				return title.includes(keyword) || content.includes(keyword);
			});
		},
		hasChanges() {
			return this.currentNote && this.currentNote.content !== this.originalContent;
		},
	},
	methods: {
		execCommand(command, value = null) {
			document.execCommand(command, false, value);
			this.$refs.editorRef?.focus();
		},
		onDropdownVisible(visible) {
			if (visible) {
				const selection = window.getSelection();
				if (selection.rangeCount > 0) {
					this.savedRange = selection.getRangeAt(0).cloneRange();
				}
			}
		},
		setFontSize(size) {
			if (!this.savedRange || this.savedRange.collapsed) {
				this.$message.warning('请先选择要修改字号的文字');
				return;
			}

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this.savedRange);

			const span = document.createElement('span');
			span.style.fontSize = size + 'px';
			span.appendChild(this.savedRange.extractContents());
			this.savedRange.insertNode(span);

			this.savedRange = null;
			this.$refs.editorRef?.focus();
			this.onEditorInput();
		},
		saveColorRange() {
			const selection = window.getSelection();
			if (selection.rangeCount > 0) {
				this.savedColorRange = selection.getRangeAt(0).cloneRange();
			}
		},
		setTextColor(color) {
			if (!this.savedColorRange || this.savedColorRange.collapsed) {
				this.$message.warning('请先选择要修改颜色的文字');
				return;
			}

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this.savedColorRange);

			document.execCommand('foreColor', false, color);

			this.savedColorRange = null;
			this.$refs.editorRef?.focus();
			this.onEditorInput();
		},
		setBgColor(color) {
			if (!this.savedColorRange || this.savedColorRange.collapsed) {
				this.$message.warning('请先选择要修改背景色的文字');
				return;
			}

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this.savedColorRange);

			document.execCommand('hiliteColor', false, color);

			this.savedColorRange = null;
			this.$refs.editorRef?.focus();
			this.onEditorInput();
		},
		clearFormat() {
			document.execCommand('removeFormat', false, null);
		},
		onEditorInput() {
			if (this.currentNote && this.$refs.editorRef) {
				this.currentNote.content = this.$refs.editorRef.innerHTML;
				this.currentNote.title = this.getTitle(this.currentNote.content);
				this.wordCount = this.$refs.editorRef.innerText.length;
			}
		},
		onPaste(e) {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			document.execCommand('insertText', false, text);
		},
		getTitle(html) {
			if (!html) return '未命名';
			const div = document.createElement('div');
			div.innerHTML = html;

			let firstLine = '';
			let currentNode = div.firstChild;

			while (currentNode) {
				if (currentNode.nodeType === 3) {
					const text = currentNode.textContent;
					const newlineIndex = text.indexOf('\n');
					if (newlineIndex >= 0) {
						firstLine += text.substring(0, newlineIndex);
						break;
					}
					firstLine += text;
				} else if (currentNode.nodeType === 1) {
					const tagName = currentNode.tagName.toLowerCase();
					if (tagName === 'br') {
						break;
					}
					if (['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
						if (firstLine) {
							break;
						}
					}
					const childText = currentNode.textContent || '';
					const newlineIndex = childText.indexOf('\n');
					if (newlineIndex >= 0) {
						firstLine += childText.substring(0, newlineIndex);
						break;
					}
					firstLine += childText;
				}
				currentNode = currentNode.nextSibling;
			}

			firstLine = firstLine.trim().substring(0, 20);
			return firstLine || '未命名';
		},
		getPreview(html) {
			if (!html) return '';
			const text = this.getPlainText(html);
			return text.substring(0, 50);
		},
		getPlainText(html) {
			if (!html) return '';
			const div = document.createElement('div');
			div.innerHTML = html;
			return div.textContent || div.innerText || '';
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
					await this.$confirm('当前笔记有未保存的更改，是否保存？', '提示', {
						confirmButtonText: '保存',
						cancelButtonText: '不保存',
						distinguishCancelAndClose: true,
						type: 'warning',
					});
					await this.saveNote();
				} catch (action) {
					// 用户选择不保存或关闭，继续打开新笔记
				}
			}

			this.currentNoteId = note.id;
			var res = await this.$API.scmsysnotes.edit.get(note.id);
			if (res.code != 200) {
				this.$message.error(res.message || '获取笔记失败');
				return;
			}

			this.currentNote = res.data;
			this.originalContent = this.currentNote.content || '';

			this.$nextTick(() => {
				if (this.$refs.editorRef) {
					this.$refs.editorRef.innerHTML = this.currentNote.content || '';
					this.wordCount = this.$refs.editorRef.innerText.length;
					this.$refs.editorRef.focus();
				}
			});
		},
		async createNote() {
			// 检查是否有未保存的更改
			if (this.hasChanges) {
				try {
					await this.$confirm('当前笔记有未保存的更改，是否保存？', '提示', {
						confirmButtonText: '保存',
						cancelButtonText: '不保存',
						distinguishCancelAndClose: true,
						type: 'warning',
					});
					await this.saveNote();
				} catch (action) {
					// 用户选择不保存或关闭，继续创建新笔记
				}
			}

			var res = await this.$API.scmsysnotes.add.post({
				title: '新建笔记',
				content: '',
				types: 1
			});

			if (res.code == 200) {
				const newNote = res.data || {
					id: this.$SCM.DEF_ID,
					title: '新建笔记',
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

			var data = {
				id: this.currentNote.id,
				types: this.currentNote.types || 1,
				title: this.currentNote.title,
				content: this.currentNote.content,
			};

			var res = await this.$API.scmsysnotes.save.post(data);
			if (res.code != 200) {
				this.$message.warning(res.message);
				return false;
			}

			// 更新列表中的笔记
			const index = this.noteList.findIndex(n => n.id === this.currentNote.id);
			if (index >= 0) {
				this.noteList[index] = { ...this.noteList[index], ...res.data, title: this.currentNote.title, content: this.currentNote.content };
			}

			this.currentNote = { ...this.currentNote, ...res.data };
			this.originalContent = this.currentNote.content;
			this.$message.success('保存成功');
		},
		async deleteNote(note) {
			try {
				await this.$confirm('确定要删除这个笔记吗？', '提示', {
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

					// 如果删除的是当前打开的笔记，清空编辑区
					if (this.currentNoteId === note.id) {
						this.currentNoteId = null;
						this.currentNote = null;
						this.originalContent = '';
					}

					this.$message.success('删除成功');
				} else {
					this.$message.error(res.message || '删除失败');
				}
			} catch (action) {
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

/* 左侧笔记列表 */
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

/* 工具栏 */
.notepad-toolbar {
	display: flex;
	align-items: center;
	padding: 8px 12px;
	background-color: var(--color-bg-secondary);
	border-bottom: 1px solid var(--color-border-light);
	flex-wrap: wrap;
	gap: 4px;
}

.toolbar-group {
	display: flex;
	align-items: center;
	gap: 2px;
}

.toolbar-divider {
	width: 1px;
	height: 20px;
	background-color: var(--color-border);
	margin: 0 8px;
}

.toolbar-spacer {
	flex: 1;
}

/* 编辑区 */
.notepad-editor {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	outline: none;
	font-size: 14px;
	line-height: 1.8;
	color: var(--color-text);
	background-color: var(--color-bg);
}

.notepad-editor:empty::before {
	content: '开始输入内容...';
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

:deep(.el-color-picker) {
	vertical-align: middle;
}

:deep(.el-color-picker__trigger) {
	width: 24px !important;
	height: 24px !important;
	padding: 2px;
}
</style>
