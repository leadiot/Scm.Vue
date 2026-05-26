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
		<el-divider></el-divider>
		<div style="vertical-align: middle;">
			<sc-icon name="ms-keyboard_return" class="sc-search_key" />
			<label class="sc-search_label">
				确认
			</label>
			<sc-icon name="ms-keyboard_arrow_up" class="sc-search_key" />
			<sc-icon name="ms-keyboard_arrow_down" class="sc-search_key" />
			<label class="sc-search_label">
				切换
			</label>
			<sc-icon name="sc-key-down" class="sc-search_key" />
			<label class="sc-search_label">
				关闭
			</label>
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
				console.log(item)
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
			console.log(this.menu)
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
			console.log(filterRouter)
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
	border-radius: 16px;
	padding: 20px;
	box-shadow:
		0 8px 32px rgba(0, 0, 0, 0.08),
		0 2px 8px rgba(0, 0, 0, 0.04),
		inset 0 1px 0 rgba(255, 255, 255, 0.6);
	position: relative;
	overflow: hidden;
}

.sc-search::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 1px;
}

.sc-search-no-result {
	text-align: center;
	margin: 40px 0;
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
	background: rgba(var(--el-color-primary-rgb), 0.08);
	border-color: rgba(var(--el-color-primary-rgb), 0.15);
	color: var(--el-text-color-secondary);
	border-radius: 20px;
	padding: 4px 12px;
	transition: all 0.2s ease;
}

.sc-search-history .el-tag:hover {
	background: rgba(var(--el-color-primary-rgb), 0.15);
	border-color: rgba(var(--el-color-primary-rgb), 0.3);
	transform: translateY(-1px);
}

.sc-search-result {
	margin-top: 20px;
}

.sc-search-result ul {
	padding: 5px;
	margin: 5px;
}

.sc-search-result .active {
	background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-2) 100%);
	color: var(--color-on-primary, #fff);
	border-color: var(--el-color-primary);
	box-shadow:
		0 4px 12px rgba(var(--el-color-primary-rgb), 0.3),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	transform: translateX(4px);
}

.sc-search-result .active i,
.sc-search-result .active .title {
	color: var(--color-on-primary, #fff);
}

.sc-search-result li {
	height: 56px;
	padding: 0 16px;
	background: rgba(255, 255, 255, 0.6);
	border: 1px solid var(--el-border-color-lighter);
	list-style: none;
	border-radius: 10px;
	margin-bottom: 6px;
	font-size: 14px;
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
}

.sc-search-result li::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	width: 3px;
	background: var(--el-color-primary);
	opacity: 0;
	transition: opacity 0.25s ease;
}

.sc-search-result li:hover {
	background: rgba(var(--el-color-primary-rgb), 0.08);
	border-color: rgba(var(--el-color-primary-rgb), 0.3);
	transform: translateX(4px);
}

.sc-search-result li:hover::before {
	opacity: 1;
}

.sc-search-result li i {
	font-size: 18px;
	margin-right: 14px;
	color: var(--el-color-primary);
	transition: color 0.25s ease;
}

.sc-search-result li .title {
	color: var(--el-text-color-primary);
	font-weight: 500;
	transition: color 0.25s ease;
}

.sc-search_key {
	padding: 0px;
	margin: 0px;
	width: 22px;
	height: 18px;
	border-radius: 4px;
	background: linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%);
	border: 1px solid var(--el-border-color-lighter);
	box-shadow:
		0 1px 2px rgba(0, 0, 0, 0.08),
		inset 0 1px 0 rgba(255, 255, 255, 0.8);
	color: var(--el-text-color-secondary);
	font-size: 11px;
}

.sc-search_label {
	margin-right: 12px;
	font-size: 12px;
	color: var(--el-text-color-secondary);
}

.el-divider--horizontal {
	margin: 16px 0;
	background: linear-gradient(90deg, transparent 0%, var(--el-border-color) 50%, transparent 100%);
}

.el-input__wrapper {
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.8);
	border: 1px solid var(--el-border-color-lighter);
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.04),
		inset 0 1px 0 rgba(255, 255, 255, 0.9);
	transition: all 0.25s ease;
}

.el-input__wrapper:hover {
	border-color: rgba(var(--el-color-primary-rgb), 0.3);
	box-shadow:
		0 4px 16px rgba(0, 0, 0, 0.06),
		inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.el-input__wrapper.is-focus {
	border-color: var(--el-color-primary);
	box-shadow:
		0 0 0 3px rgba(var(--el-color-primary-rgb), 0.1),
		0 4px 16px rgba(var(--el-color-primary-rgb), 0.15),
		inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.el-scrollbar__wrap {
	border-radius: 8px;
}

.el-scrollbar__bar.is-vertical {
	width: 5px;
}

.el-scrollbar__thumb {
	background: rgba(var(--el-color-primary-rgb), 0.3);
	border-radius: 3px;
}

.el-scrollbar__thumb:hover {
	background: rgba(var(--el-color-primary-rgb), 0.5);
}
</style>
