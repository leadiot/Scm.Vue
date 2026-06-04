<template>
	<div class="notepad-container">
		<div class="notepad-menu-bar">
			<el-dropdown v-model="showFileMenu" trigger="click" @visible-change="showFileMenu = false">
				<span class="menu-item">文件</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="new" @click="createNewFile">新建</el-dropdown-item>
						<el-dropdown-item command="open" @click="openFileDialog">打开...</el-dropdown-item>
						<el-dropdown-item divided command="save" @click="saveFile">保存</el-dropdown-item>
						<el-dropdown-item command="saveAs" @click="saveAsFile">另存为...</el-dropdown-item>
						<el-dropdown-item divided command="exit" @click="closeApp">退出</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-dropdown v-model="showEditMenu" trigger="click" @visible-change="showEditMenu = false">
				<span class="menu-item">编辑</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="undo" @click="execUndo">撤销</el-dropdown-item>
						<el-dropdown-item command="redo" @click="execRedo">重做</el-dropdown-item>
						<el-dropdown-item divided command="cut" @click="execCut">剪切</el-dropdown-item>
						<el-dropdown-item command="copy" @click="execCopy">复制</el-dropdown-item>
						<el-dropdown-item command="paste" @click="execPaste">粘贴</el-dropdown-item>
						<el-dropdown-item divided command="delete" @click="execDelete">删除</el-dropdown-item>
						<el-dropdown-item divided command="selectAll" @click="execSelectAll">全选</el-dropdown-item>
						<el-dropdown-item command="timeDate" @click="insertTimeDate">时间/日期</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-dropdown v-model="showFormatMenu" trigger="click" @visible-change="showFormatMenu = false">
				<span class="menu-item">格式</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="wordWrap" @click="toggleWordWrap">
							<span :class="{ checked: wordWrap }">✓</span> 自动换行
						</el-dropdown-item>
						<el-dropdown-item divided command="font" @click="showFontDialog = true">字体...</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-dropdown v-model="showViewMenu" trigger="click" @visible-change="showViewMenu = false">
				<span class="menu-item">查看</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="statusBar" @click="toggleStatusBar">
							<span :class="{ checked: showStatusBar }">✓</span> 状态栏
						</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-dropdown v-model="showHelpMenu" trigger="click" @visible-change="showHelpMenu = false">
				<span class="menu-item">帮助</span>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="about" @click="showAbout = true">关于记事本</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>

		<div class="notepad-editor-wrapper">
			<div class="line-numbers" :style="lineNumbersStyle">
				<div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
			</div>
			<textarea ref="editorRef" class="notepad-editor" :class="{ 'word-wrap': wordWrap }" v-model="currentContent"
				@input="onContentChange" @scroll="onScroll" @keydown="onKeyDown" :style="editorStyle"
				spellcheck="false"></textarea>
		</div>

		<div v-if="showStatusBar" class="notepad-status-bar">
			<span class="status-left">行 {{ currentLine }}, 列 {{ currentColumn }}</span>
			<span class="status-right">记事本</span>
		</div>

		<el-dialog title="字体" v-model="showFontDialog" draggable width="360px" :show-close="false">
			<div class="font-dialog">
				<div class="font-section">
					<label>字体:</label>
					<select v-model="fontFamily" class="font-select">
						<option value="Consolas">Consolas</option>
						<option value="Courier New">Courier New</option>
						<option value="Arial">Arial</option>
						<option value="Times New Roman">Times New Roman</option>
						<option value="Microsoft YaHei">微软雅黑</option>
						<option value="SimSun">宋体</option>
						<option value="KaiTi">楷体</option>
					</select>
				</div>
				<div class="font-section">
					<label>字形:</label>
					<select v-model="fontStyle" class="font-select">
						<option value="normal">常规</option>
						<option value="bold">粗体</option>
						<option value="italic">斜体</option>
						<option value="bold italic">粗体 斜体</option>
					</select>
				</div>
				<div class="font-section">
					<label>大小:</label>
					<select v-model="fontSize" class="font-select">
						<option :value="8">8</option>
						<option :value="9">9</option>
						<option :value="10">10</option>
						<option :value="11">11</option>
						<option :value="12">12</option>
						<option :value="14">14</option>
						<option :value="16">16</option>
						<option :value="18">18</option>
						<option :value="20">20</option>
						<option :value="22">22</option>
						<option :value="24">24</option>
						<option :value="26">26</option>
						<option :value="28">28</option>
						<option :value="36">36</option>
						<option :value="48">48</option>
						<option :value="72">72</option>
					</select>
				</div>
				<div class="font-preview">
					<label>示例:</label>
					<div class="preview-text" :style="previewStyle">AaBb1234</div>
				</div>
			</div>
			<div class="dialog-footer">
				<el-button @click="showFontDialog = false">取消</el-button>
				<el-button type="primary" @click="applyFont">确定</el-button>
			</div>
		</el-dialog>

		<el-dialog title="关于记事本" v-model="showAbout" draggable width="300px" :show-close="false">
			<div class="about-dialog">
				<div class="about-title">记事本</div>
				<div class="about-version">版本 1.0.0</div>
				<div class="about-copyright">© 2024 Scm.Vue 桌面应用</div>
			</div>
			<div class="dialog-footer">
				<el-button type="primary" @click="showAbout = false">确定</el-button>
			</div>
		</el-dialog>

		<input ref="fileInput" type="file" accept=".txt" class="file-input" @change="handleFileSelect" />
	</div>
</template>

<script>
export default {
	name: 'Notepad',
	props: {
		files: { type: Array, default: () => [] },
		index: { type: Number, default: 0 }
	},
	data() {
		return {
			currentContent: '',
			fileName: '无标题',
			isModified: false,
			wordWrap: true,
			showStatusBar: true,
			showFileMenu: false,
			showEditMenu: false,
			showFormatMenu: false,
			showViewMenu: false,
			showHelpMenu: false,
			showFontDialog: false,
			showAbout: false,
			fontFamily: 'Consolas',
			fontStyle: 'normal',
			fontSize: 12,
			currentLine: 1,
			currentColumn: 1,
			lineCount: 1,
			history: [],
			historyIndex: -1,
		};
	},
	computed: {
		editorStyle() {
			return {
				fontFamily: this.fontFamily,
				fontSize: this.fontSize + 'pt',
				fontStyle: this.fontStyle.includes('italic') ? 'italic' : 'normal',
				fontWeight: this.fontStyle.includes('bold') ? 'bold' : 'normal',
			};
		},
		lineNumbersStyle() {
			return {
				fontFamily: this.fontFamily,
				fontSize: this.fontSize + 'pt',
			};
		},
		previewStyle() {
			return {
				fontFamily: this.fontFamily,
				fontSize: this.fontSize + 'pt',
				fontStyle: this.fontStyle.includes('italic') ? 'italic' : 'normal',
				fontWeight: this.fontStyle.includes('bold') ? 'bold' : 'normal',
			};
		},
	},
	methods: {
		onContentChange() {
			this.isModified = true;
			this.updateLineInfo();
			this.saveToHistory();
			this.saveToStorage();
		},
		updateLineInfo() {
			const textarea = this.$refs.editorRef;
			if (!textarea) return;

			const text = textarea.value.substring(0, textarea.selectionStart);
			const lines = text.split('\n');
			this.currentLine = lines.length;
			this.currentColumn = (lines[lines.length - 1]?.length || 0) + 1;
			this.lineCount = this.currentContent.split('\n').length;
		},
		onScroll() {
			const textarea = this.$refs.editorRef;
			const lineNumbers = this.$el.querySelector('.line-numbers');
			if (textarea && lineNumbers) {
				lineNumbers.scrollTop = textarea.scrollTop;
			}
		},
		onKeyDown(e) {
			if (e.ctrlKey || e.metaKey) {
				switch (e.key.toLowerCase()) {
					case 's':
						e.preventDefault();
						this.saveFile();
						break;
					case 'n':
						e.preventDefault();
						this.createNewFile();
						break;
					case 'o':
						e.preventDefault();
						this.openFileDialog();
						break;
					case 'z':
						if (e.shiftKey) {
							e.preventDefault();
							this.execRedo();
						} else {
							e.preventDefault();
							this.execUndo();
						}
						break;
					case 'a':
						e.preventDefault();
						this.execSelectAll();
						break;
					case 'x':
						e.preventDefault();
						this.execCut();
						break;
					case 'c':
						e.preventDefault();
						this.execCopy();
						break;
					case 'v':
						e.preventDefault();
						this.execPaste();
						break;
				}
			}
		},
		saveToHistory() {
			this.history = this.history.slice(0, this.historyIndex + 1);
			this.history.push(this.currentContent);
			this.historyIndex++;
			if (this.history.length > 50) {
				this.history.shift();
				this.historyIndex--;
			}
		},
		execUndo() {
			if (this.historyIndex > 0) {
				this.historyIndex--;
				this.currentContent = this.history[this.historyIndex];
				this.isModified = true;
				this.$nextTick(() => this.updateLineInfo());
			}
		},
		execRedo() {
			if (this.historyIndex < this.history.length - 1) {
				this.historyIndex++;
				this.currentContent = this.history[this.historyIndex];
				this.isModified = true;
				this.$nextTick(() => this.updateLineInfo());
			}
		},
		execCut() {
			document.execCommand('cut');
		},
		execCopy() {
			document.execCommand('copy');
		},
		execPaste() {
			document.execCommand('paste');
		},
		execDelete() {
			const textarea = this.$refs.editorRef;
			if (textarea) {
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				if (start !== end) {
					this.currentContent = this.currentContent.substring(0, start) + this.currentContent.substring(end);
					this.isModified = true;
				}
			}
		},
		execSelectAll() {
			const textarea = this.$refs.editorRef;
			if (textarea) {
				textarea.select();
			}
		},
		insertTimeDate() {
			const now = new Date();
			const dateStr = now.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false
			});
			const textarea = this.$refs.editorRef;
			if (textarea) {
				const start = textarea.selectionStart;
				const end = textarea.selectionEnd;
				this.currentContent = this.currentContent.substring(0, start) + dateStr + this.currentContent.substring(end);
				this.isModified = true;
				this.$nextTick(() => {
					textarea.setSelectionRange(start + dateStr.length, start + dateStr.length);
					textarea.focus();
				});
			}
		},
		toggleWordWrap() {
			this.wordWrap = !this.wordWrap;
		},
		toggleStatusBar() {
			this.showStatusBar = !this.showStatusBar;
		},
		createNewFile() {
			if (this.isModified) {
				this.$confirm('是否保存更改？', '提示', {
					confirmButtonText: '保存',
					cancelButtonText: '不保存',
					type: 'warning',
					distinguishCancelAndClose: true
				}).then(() => {
					this.saveFile().then(() => this.resetNewFile());
				}).catch((action) => {
					if (action === 'cancel') {
						this.resetNewFile();
					}
				});
			} else {
				this.resetNewFile();
			}
		},
		resetNewFile() {
			this.currentContent = '';
			this.fileName = '无标题';
			this.isModified = false;
			this.history = [];
			this.historyIndex = -1;
			this.saveToStorage();
		},
		openFileDialog() {
			if (this.isModified) {
				this.$confirm('是否保存更改？', '提示', {
					confirmButtonText: '保存',
					cancelButtonText: '不保存',
					type: 'warning',
					distinguishCancelAndClose: true
				}).then(() => {
					this.saveFile().then(() => this.$refs.fileInput.click());
				}).catch((action) => {
					if (action === 'cancel') {
						this.$refs.fileInput.click();
					}
				});
			} else {
				this.$refs.fileInput.click();
			}
		},
		handleFileSelect(e) {
			const file = e.target.files[0];
			if (file) {
				this.readFile(file);
			}
			e.target.value = '';
		},
		readFile(file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				this.currentContent = e.target.result;
				this.fileName = file.name;
				this.isModified = false;
				this.history = [this.currentContent];
				this.historyIndex = 0;
				this.updateLineInfo();
				this.saveToStorage();
			};
			reader.readAsText(file, 'UTF-8');
		},
		async saveFile() {
			if (!this.isModified) return;

			if (this.fileName === '无标题') {
				await this.saveAsFile();
			} else {
				this.isModified = false;
				this.$message.success('保存成功');
				this.saveToStorage();
			}
		},
		saveAsFile() {
			return new Promise((resolve) => {
				const blob = new Blob([this.currentContent], { type: 'text/plain;charset=utf-8' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = this.fileName === '无标题' ? '新建文本文档.txt' : this.fileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
				this.fileName = link.download;
				this.isModified = false;
				this.$message.success('保存成功');
				this.saveToStorage();
				resolve();
			});
		},
		closeApp() {
			if (this.isModified) {
				this.$confirm('是否保存更改？', '提示', {
					confirmButtonText: '保存',
					cancelButtonText: '不保存',
					type: 'warning',
					distinguishCancelAndClose: true
				}).then(() => {
					this.saveFile();
				}).catch(() => { });
			}
		},
		applyFont() {
			this.showFontDialog = false;
			this.saveToStorage();
		},
		saveToStorage() {
			localStorage.setItem('notepad_state', JSON.stringify({
				content: this.currentContent,
				fileName: this.fileName,
				wordWrap: this.wordWrap,
				showStatusBar: this.showStatusBar,
				fontFamily: this.fontFamily,
				fontStyle: this.fontStyle,
				fontSize: this.fontSize,
			}));
		},
		loadFromStorage() {
			const saved = localStorage.getItem('notepad_state');
			if (saved) {
				try {
					const data = JSON.parse(saved);
					this.currentContent = data.content || '';
					this.fileName = data.fileName || '无标题';
					this.wordWrap = data.wordWrap !== undefined ? data.wordWrap : true;
					this.showStatusBar = data.showStatusBar !== undefined ? data.showStatusBar : true;
					this.fontFamily = data.fontFamily || 'Consolas';
					this.fontStyle = data.fontStyle || 'normal';
					this.fontSize = data.fontSize || 12;
				} catch (e) {
					console.error('加载记事本状态失败:', e);
				}
			}
		},
	},
	mounted() {
		this.loadFromStorage();
		this.history = [this.currentContent];
		this.historyIndex = 0;
		this.updateLineInfo();

		if (this.files && this.files.length > 0) {
			const index = Math.min(this.index, this.files.length - 1);
			const file = this.files[index];
			if (file.content) {
				this.currentContent = file.content;
				this.fileName = file.name || '无标题';
				this.isModified = false;
				this.history = [this.currentContent];
				this.historyIndex = 0;
				this.updateLineInfo();
			}
		}
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.notepad-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #ffffff;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.notepad-menu-bar {
	display: flex;
	align-items: center;
	padding: 2px 4px;
	background-color: #f0f0f0;
	border-bottom: 1px solid #cccccc;
	gap: 1px;
}

.menu-item {
	padding: 4px 10px;
	font-size: 12px;
	color: #333333;
	cursor: pointer;
	border-radius: 2px;
	transition: background-color 0.1s;
	position: relative;
}

.menu-item:hover {
	background-color: #e0e0e0;
}

.notepad-editor-wrapper {
	flex: 1;
	display: flex;
	overflow: hidden;
	position: relative;
}

.notepad-editor {
	flex: 1;
	width: 100%;
	height: 100%;
	padding: 4px;
	border: none;
	outline: none;
	resize: none;
	line-height: 1.5;
	tab-size: 4;
	background-color: #ffffff;
	color: #000000;
	overflow: auto;
	white-space: nowrap;
	overflow-x: auto;
}

.notepad-editor.word-wrap {
	white-space: pre-wrap;
	overflow-wrap: break-word;
	word-break: break-all;
	overflow-x: hidden;
}

.line-numbers {
	width: 40px;
	padding: 4px 2px;
	background-color: #f5f5f5;
	border-right: 1px solid #cccccc;
	text-align: right;
	overflow: hidden;
	user-select: none;
	color: #888888;
	font-size: 12px;
	line-height: 1.5;
}

.line-number {
	height: 1.5em;
}

.notepad-status-bar {
	display: flex;
	justify-content: space-between;
	padding: 4px 10px;
	background-color: #f0f0f0;
	border-top: 1px solid #cccccc;
	font-size: 11px;
	color: #666666;
}

.status-left {
	font-family: 'Consolas', 'Courier New', monospace;
}

.font-dialog {
	padding: 10px;
}

.font-section {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
	gap: 10px;
}

.font-section label {
	width: 50px;
	font-size: 12px;
}

.font-select {
	flex: 1;
	padding: 4px;
	font-size: 12px;
	border: 1px solid #cccccc;
	border-radius: 3px;
	background-color: #ffffff;
}

.font-preview {
	margin-top: 15px;
	padding-top: 15px;
	border-top: 1px solid #eeeeee;
}

.font-preview label {
	display: block;
	font-size: 12px;
	margin-bottom: 8px;
}

.preview-text {
	font-size: 16px;
	color: #333333;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 15px;
	border-top: 1px solid #eeeeee;
}

.about-dialog {
	text-align: center;
	padding: 20px;
}

.about-title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 10px;
}

.about-version {
	font-size: 12px;
	color: #666666;
	margin-bottom: 5px;
}

.about-copyright {
	font-size: 11px;
	color: #888888;
}

.file-input {
	display: none;
}

.checked {
	color: #0078d7;
}

:deep(.el-dropdown-menu) {
	min-width: 120px;
	padding: 2px 0;
	background-color: #ffffff;
	border: 1px solid #e0e0e0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
	font-size: 12px;
	padding: 4px 20px;
	color: #333333;
}

:deep(.el-dropdown-menu__item:hover) {
	background-color: #e0e0e0;
}

:deep(.el-dropdown-menu__item--divided) {
	border-top: 1px solid #eeeeee;
	margin-top: 2px;
	padding-top: 6px;
}
</style>