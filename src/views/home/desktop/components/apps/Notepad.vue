<template>
	<div class="notepad-app">
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
				<el-button text size="small" @click="saveNote" type="primary">
					<sc-icon name="ms-save" :size="18" style="margin-right: 4px;" />
					保存
				</el-button>
			</div>
		</div>

		<div class="notepad-tabs">
			<div v-for="note in notes" :key="note.id" class="note-tab"
				:class="{ active: currentNoteId === note.id }" @click="switchNote(note.id)">
				<span class="note-tab-title">{{ note.title || '未命名' }}</span>
				<el-icon class="note-tab-close" @click.stop="closeNote(note.id)">
					<el-icon-close />
				</el-icon>
			</div>
			<div class="note-tab add-tab" @click="createNote">
				<sc-icon name="ms-add" :size="16" />
			</div>
		</div>

		<div class="notepad-editor" ref="editorRef" contenteditable="true" @input="onEditorInput"
			@paste="onPaste"></div>

		<div class="notepad-status">
			<span>字数：{{ wordCount }}</span>
			<span v-if="lastSaved">上次保存：{{ lastSaved }}</span>
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
	data() {
		return {
			notes: [],
			currentNoteId: null,
			textColor: '#333333',
			bgColor: '#ffff00',
			fontSizes: [12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72],
			wordCount: 0,
			lastSaved: null,
			noteIdCounter: 1,
			savedRange: null,
			savedColorRange: null,
		};
	},
	computed: {
		currentNote() {
			return this.notes.find(n => n.id === this.currentNoteId);
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
				this.saveToStorage();
			}
		},
		onPaste(e) {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			document.execCommand('insertText', false, text);
		},
		getTitle(html) {
			const div = document.createElement('div');
			div.innerHTML = html;
			const text = div.innerText.trim();
			return text.substring(0, 20) || '未命名';
		},
		createNote() {
			const note = {
				id: this.noteIdCounter++,
				title: '未命名',
				content: '',
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			this.notes.push(note);
			this.switchNote(note.id);
			this.saveToStorage();
		},
		switchNote(id) {
			this.currentNoteId = id;
			this.$nextTick(() => {
				if (this.$refs.editorRef && this.currentNote) {
					this.$refs.editorRef.innerHTML = this.currentNote.content || '';
					this.wordCount = this.$refs.editorRef.innerText.length;
				}
			});
		},
		closeNote(id) {
			const index = this.notes.findIndex(n => n.id === id);
			if (index > -1) {
				this.notes.splice(index, 1);
				if (this.currentNoteId === id) {
					this.currentNoteId = this.notes.length > 0 ? this.notes[0].id : null;
					this.switchNote(this.currentNoteId);
				}
				this.saveToStorage();
			}
		},
		saveNote() {
			if (this.currentNote) {
				this.currentNote.updatedAt = new Date();
				this.saveToStorage();
				this.lastSaved = new Date().toLocaleTimeString('zh-CN');
				this.$message.success('保存成功');
			}
		},
		saveToStorage() {
			localStorage.setItem('desktop_notepad', JSON.stringify({
				notes: this.notes,
				noteIdCounter: this.noteIdCounter,
			}));
		},
		loadFromStorage() {
			const saved = localStorage.getItem('desktop_notepad');
			if (saved) {
				const data = JSON.parse(saved);
				this.notes = data.notes || [];
				this.noteIdCounter = data.noteIdCounter || 1;
				if (this.notes.length > 0) {
					this.currentNoteId = this.notes[0].id;
				}
			}
		},
	},
	mounted() {
		this.loadFromStorage();
		if (this.notes.length === 0) {
			this.createNote();
		} else {
			this.switchNote(this.currentNoteId);
		}
	},
};
</script>

<style scoped>
.notepad-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #fff;
}

.notepad-toolbar {
	display: flex;
	align-items: center;
	padding: 8px 12px;
	background-color: #f5f5f5;
	border-bottom: 1px solid #e0e0e0;
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
	background-color: #ddd;
	margin: 0 8px;
}

.toolbar-spacer {
	flex: 1;
}

.notepad-tabs {
	display: flex;
	align-items: center;
	padding: 0 10px;
	background-color: #f0f0f0;
	border-bottom: 1px solid #e0e0e0;
	min-height: 36px;
	overflow-x: auto;
}

.note-tab {
	display: flex;
	align-items: center;
	padding: 6px 12px;
	background-color: #e8e8e8;
	border-radius: 4px 4px 0 0;
	cursor: pointer;
	font-size: 13px;
	color: #666;
	margin-right: 2px;
	white-space: nowrap;
	max-width: 150px;
}

.note-tab:hover {
	background-color: #ddd;
}

.note-tab.active {
	background-color: #fff;
	color: #333;
}

.note-tab-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.note-tab-close {
	margin-left: 8px;
	opacity: 0;
	transition: opacity 0.2s;
}

.note-tab:hover .note-tab-close {
	opacity: 1;
}

.addTab {
	padding: 6px 10px;
	background-color: transparent;
}

.addTab:hover {
	background-color: #e0e0e0;
}

.notepad-editor {
	flex: 1;
	padding: 20px;
	overflow-y: auto;
	outline: none;
	font-size: 14px;
	line-height: 1.8;
	color: #333;
}

.notepad-editor:empty::before {
	content: '开始输入内容...';
	color: #bbb;
}

.notepad-status {
	display: flex;
	justify-content: space-between;
	padding: 6px 12px;
	background-color: #f5f5f5;
	border-top: 1px solid #e0e0e0;
	font-size: 12px;
	color: #999;
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
