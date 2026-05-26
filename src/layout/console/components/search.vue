<template>
	<div class="sc-search">
		<el-input ref="input" v-model="input" placeholder="搜索" size="large" clearable prefix-icon="el-icon-search"
			:trigger-on-focus="false" @input="inputChange" v-on:keydown="keyAction($event)" />
		<div class="sc-search-history" v-if="history.length > 0">
			<el-tag closable effect="dark" type="info" v-for="(item, index) in history" :key="item"
				@click="historyClick(item)" @close="historyClose(index)">
				{{ item }}
			</el-tag>
		</div>
		<div class="sc-search-result">
			<div class="sc-search-no-result" v-if="result.length <= 0">暂无搜索结果</div>
			<el-scrollbar max-height="366px" v-else>
				<ul>
					<li v-for="(item, index) in result" :key="item.path" @click="to(item)"
						:class="{ active: index == selected }">
						<sc-icon :name="item.icon || 'ms-keyboard_return'" />
						<span class="title">{{ item.breadcrumb }}</span>
					</li>
				</ul>
			</el-scrollbar>
		</div>
		<div class="sc-search-key-hint">
			<div class="sc-search-key-group">
				<span class="sc-search-key">Enter</span>
				<span class="sc-search_label">确认</span>
			</div>
			<div class="sc-search-key-group">
				<span class="sc-search-key">↑</span>
				<span class="sc-search-key">↓</span>
				<span class="sc-search_label">切换</span>
			</div>
			<div class="sc-search-key-group">
				<span class="sc-search-key">Esc</span>
				<span class="sc-search_label">关闭</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			input: "",
			menu: [],
			result: [],
			selected: 0,
			history: []
		}
	},
	mounted() {
		var searchHistory = this.$TOOL.session.get("SEARCH_HISTORY") || []
		this.history = searchHistory
		var menuTree = this.$TOOL.session.get("MENU")
		this.filterMenu(menuTree)
		this.$refs.input.focus()
	},
	methods: {
		inputChange(value) {
			if (value) {
				this.result = this.menuFilter(value)
			} else {
				this.result = []
			}
		},
		keyAction(event) {
			if (event.altKey || event.ctrlKey || event.shiftKey) {
				return false;
			}

			var qty = this.result.length - 1;
			if (qty < 0) {
				return true;
			}

			var idx = this.selected;
			var key = event.keyCode;
			// Down
			if (key == 40 || key == 34) {
				idx += 1;
				if (idx > qty) {
					idx = 0;
				}
				this.selected = idx;
				return true;
			}
			// Up & Page Up
			if (key == 38 || key == 33) {
				idx -= 1;
				if (idx < 0) {
					idx = qty;
				}
				this.selected = idx;
				return true;
			}
			// Enter
			if (key == 13) {
				this.selectNext();
				return true;
			}

			return false;
		},
		selectNext() {
			var item = this.result[this.selected];
			this.to(item);
		},
		filterMenu(map) {
			map.forEach(item => {
				if (item.meta.hidden || item.meta.type == "button") {
					return false
				}
				if (item.meta.type == 'iframe') {
					item.path = `/i/${item.name}`
				}
				if (item.children && item.children.length > 0 && !item.component) {
					this.filterMenu(item.children)
				} else {
					this.menu.push(item)
				}
			})
		},
		menuFilter(queryString) {
			var res = [];
			queryString = queryString.toLowerCase();
			//过滤菜单树
			var filterMenu = this.menu.filter((item) => {
				var meta = (item.meta.title || '').toLowerCase();
				if (meta && meta.indexOf(queryString) >= 0) {
					return true
				}
				meta = (item.name || '').toLowerCase();
				if (meta && meta.indexOf(queryString) >= 0) {
					return true
				}
			})
			//匹配系统路由
			var router = this.$router.getRoutes()
			var filterRouter = filterMenu.map((m) => {
				if (m.meta.type == "link") {
					return router.find(r => r.path == '/' + m.path)
				} else {
					return router.find(r => r.path == m.path)
				}
			})
			//重组对象
			filterRouter.forEach(item => {
				if (!item) {
					return;
				}

				res.push({
					id: item.id,
					name: item.name,
					type: item.meta.type,
					path: item.meta.type == "link" ? item.path.slice(1) : item.path,
					icon: item.meta.icon,
					title: item.meta.title,
					breadcrumb: item.meta.breadcrumb.map(v => v.title || v.meta?.title || '').join(' - ')
				})
			})
			return res
		},
		to(item) {
			if (!this.history.includes(this.input)) {
				this.history.push(this.input)
				this.$TOOL.data.set("SEARCH_HISTORY", this.history)
			}
			if (item.type == "link") {
				setTimeout(() => {
					let a = document.createElement("a")
					a.style = "display: none"
					a.target = "_blank"
					a.href = item.path
					document.body.appendChild(a)
					a.click()
					document.body.removeChild(a)
				}, 10);
			} else {
				this.$router.push({ path: item.path })
			}
			this.$emit('success', true)
		},
		historyClick(text) {
			this.input = text
			this.inputChange(text)
		},
		historyClose(index) {
			this.history.splice(index, 1);
			if (this.history.length <= 0) {
				this.$TOOL.session.remove("SEARCH_HISTORY")
			} else {
				this.$TOOL.session.set("SEARCH_HISTORY", this.history)
			}
		}
	}
}
</script>

<style scoped>
.sc-search {
	background: var(--el-bg-color);
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
	border: 1px solid var(--el-border-color-lighter);
	position: relative;
}

.sc-search::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 2px;
	background: linear-gradient(90deg, transparent 0%, var(--el-color-primary) 50%, transparent 100%);
	opacity: 0.5;
}

.sc-search-no-result {
	text-align: center;
	padding: 40px 20px;
	color: var(--el-text-color-secondary);
	font-size: 14px;
}

.sc-search-history {
	margin-top: 16px;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.sc-search-history .el-tag {
	cursor: pointer;
	background: rgba(var(--el-color-primary-rgb), 0.06);
	border-color: rgba(var(--el-color-primary-rgb), 0.12);
	color: var(--el-text-color-secondary);
	border-radius: 8px;
	padding: 4px 12px;
	font-size: 13px;
	transition: all 0.2s ease;
}

.sc-search-history .el-tag:hover {
	background: rgba(var(--el-color-primary-rgb), 0.12);
	border-color: rgba(var(--el-color-primary-rgb), 0.25);
}

.sc-search-result {
	margin-top: 16px;
}

.sc-search-result ul {
	padding: 0;
	margin: 0;
}

.sc-search-result li {
	height: 48px;
	padding: 0 16px;
	background: var(--el-bg-color-page);
	border: 1px solid transparent;
	list-style: none;
	border-radius: 8px;
	margin-bottom: 4px;
	font-size: 14px;
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: all 0.2s ease;
	position: relative;
}

.sc-search-result li::before {
	content: '';
	position: absolute;
	left: 0;
	top: 50%;
	transform: translateY(-50%);
	width: 2px;
	height: 24px;
	background: var(--el-color-primary);
	opacity: 0;
	transition: opacity 0.2s ease;
}

.sc-search-result li:hover {
	background: rgba(var(--el-color-primary-rgb), 0.06);
	border-color: rgba(var(--el-color-primary-rgb), 0.2);
}

.sc-search-result li:hover::before {
	opacity: 1;
}

.sc-search-result .active {
	background: rgba(var(--el-color-primary-rgb), 0.1);
	border-color: var(--el-color-primary);
}

.sc-search-result .active::before {
	opacity: 1;
}

.sc-search-result .active .title {
	color: var(--el-color-primary);
	font-weight: 500;
}

.sc-search-result li i {
	font-size: 16px;
	margin-right: 12px;
	color: var(--el-text-color-secondary);
	flex-shrink: 0;
}

.sc-search-result .active i {
	color: var(--el-color-primary);
}

.sc-search-result li .title {
	color: var(--el-text-color-primary);
	font-size: 14px;
}

.sc-search-key-hint {
	display: flex;
	align-items: center;
	gap: 16px;
	padding-top: 16px;
	border-top: 1px solid var(--el-border-color-lighter);
	margin-top: 16px;
}

.sc-search-key-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

.sc-search-key {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 24px;
	height: 24px;
	padding: 0 6px;
	border-radius: 4px;
	background: var(--el-bg-color-page);
	border: 1px solid var(--el-border-color-lighter);
	font-size: 12px;
	color: var(--el-text-color-secondary);
	font-family: monospace;
}

.sc-search_label {
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.el-input__wrapper {
	border-radius: 12px;
	background: var(--el-bg-color-page);
	border: 1px solid var(--el-border-color-lighter);
	transition: all 0.2s ease;
}

.el-input__wrapper:hover {
	border-color: rgba(var(--el-color-primary-rgb), 0.3);
}

.el-input__wrapper.is-focus {
	border-color: var(--el-color-primary);
	box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.08);
}

.el-input__prefix {
	color: var(--el-text-color-secondary);
}

.el-input__clear {
	color: var(--el-text-color-secondary);
}

.el-divider--horizontal {
	display: none;
}

.el-scrollbar__bar.is-vertical {
	width: 4px;
}

.el-scrollbar__thumb {
	background: rgba(var(--el-color-primary-rgb), 0.25);
	border-radius: 2px;
}

.el-scrollbar__thumb:hover {
	background: rgba(var(--el-color-primary-rgb), 0.4);
}
</style>
