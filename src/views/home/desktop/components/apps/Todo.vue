<template>
	<div class="app-container app-light">
		<div class="app-toolbar">
			<span class="app-header-title">待办</span>
			<span class="todo-count">{{ todoCount }} 项待完成</span>
		</div>

		<div class="todo-input">
			<el-input v-model="title" maxlength="256" show-word-limit clearable placeholder="添加新待办..."
				@keyup.enter="addTodo">
				<template #append>
					<el-button @click="addTodo" :disabled="!title.trim()">
						<sc-icon name="ms-add" style="color: #000;" />
					</el-button>
				</template>
			</el-input>
		</div>

		<div class="todo-filters">
			<el-radio-group v-model="filter" size="small">
				<el-radio-button value="all">全部 ({{ gtd_list.length }})</el-radio-button>
				<el-radio-button value="todo">待完成 ({{ todoCount }})</el-radio-button>
				<el-radio-button value="done">已完成 ({{ doneCount }})</el-radio-button>
			</el-radio-group>
		</div>

		<div class="todo-list">
			<transition-group name="todo-list">
				<div v-for="gtd in filteredTodos" :key="gtd.id" class="todo-item"
					:class="{ completed: gtd.handle === 3 }">
					<el-checkbox v-model="gtd.checked" @change="handleTodo(gtd)" />
					<el-input v-if="currentGtd.id === gtd.id" v-model="gtd.title" maxlength="256" show-word-limit
						clearable size="small" @blur="finishEdit(gtd)" @keyup.enter="finishEdit(gtd)"
						@keyup.escape="cancelEdit" class="edit-input" ref="editInput" />
					<span v-else class="todo-text" @dblclick="startEdit(gtd)">{{ gtd.title }}</span>
					<div class="todo-actions">
						<span class="todo-time">{{ formatTime(gtd.create_time) }}</span>
						<el-button text size="small" @click="deleteTodo(gtd)">
							<sc-icon name="ms-delete" :size="16" />
						</el-button>
					</div>
				</div>
			</transition-group>

			<div v-if="filteredTodos.length === 0" class="todo-empty">
				<sc-icon name="ms-assignment_turned_in" :size="48" />
				<p>{{ filter === 'todo' ? '暂无待办事项' : '暂无已完成事项' }}</p>
			</div>
		</div>

		<div v-if="gtd_list.length > 0" class="todo-footer">
			<el-button v-if="doneCount > 0" text type="danger" @click="clearDone">
				清除已完成 ({{ doneCount }})
			</el-button>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Todo',
	components: {
		scIcon,
	},
	data() {
		return {
			title: '',
			gtd_list: [],
			filter: 'all',
			currentGtd: {}
		};
	},
	computed: {
		filteredTodos() {
			if (this.filter === 'todo') {
				return this.gtd_list.filter(todo => todo.handle === 1);
			} else if (this.filter === 'done') {
				return this.gtd_list.filter(todo => todo.handle === 3);
			}

			return this.gtd_list;
		},
		todoCount() {
			return this.gtd_list.filter(gtd => gtd.handle === 1).length;
		},
		doneCount() {
			return this.gtd_list.filter(gtd => gtd.handle === 3).length;
		},
	},
	methods: {
		async addTodo() {
			const text = this.title.trim();
			if (!text) return;

			var gtd = {
				title: text
			};
			var res = await this.$API.scmsysgtdheader.add.post(gtd);
			if (res.code == 200) {
				await this.loadTodos();
			} else {
				this.$alert(res.message, "提示", { type: "error" });
			}

			this.title = '';
		},
		startEdit(todo) {
			this.currentGtd = todo;
			this.$nextTick(() => {
				const inputs = this.$refs.editInput;
				if (inputs) {
					const input = Array.isArray(inputs) ? inputs[0] : inputs;
					if (input && input.focus) {
						input.focus();
					} else if (input && input.$el) {
						input.$el.querySelector('input')?.focus();
					}
				}
			});
		},
		finishEdit(todo) {
			this.saveTodo(todo);
			this.currentGtd = {};
		},
		cancelEdit() {
			this.currentGtd = {};
		},
		async clearDone() {
			var res = await this.$API.scmsysgtdheader.remove.post();
			if (res.code == 200) {
				await this.loadTodos();
			}
		},
		async saveTodo(gtd) {
			var res = await this.$API.scmsysgtdheader.update.put(gtd);
			if (res.code == 200) {
				await this.loadTodos();
			}
		},
		async handleTodo(gtd) {
			console.log(gtd.handle);
			gtd.handle = gtd.handle === 1 ? 3 : 1;
			var res = await this.$API.scmsysgtdheader.handle.post(gtd);
			if (res.code == 200) {
				await this.loadTodos();
			}
		},
		async deleteTodo(gtd) {
			var res = await this.$API.scmsysgtdheader.delete.delete(gtd.id);
			if (res.code == 200) {
				await this.loadTodos();
			}
		},
		async loadTodos() {
			var res = await this.$API.scmsysgtdheader.list.get();
			if (res.code == 200) {
				this.gtd_list = res.data;
			}

			this.gtd_list = res.data || {};
			for (let todo of this.gtd_list) {
				todo.checked = todo.handle === 3;
			}
		},
		formatTime(date) {
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
	},
	mounted() {
		this.loadTodos();
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.todo-count {
	font-size: 13px;
	color: var(--color-text-tertiary);
}

.todo-input {
	padding: 15px 20px;
	border-bottom: 1px solid var(--color-border-light);
}

.todo-input .el-input-group__append {
	background-color: var(--color-primary);
	border-color: var(--color-primary);
}

.todo-input .el-input-group__append .el-button {
	color: #fff;
}

.todo-filters {
	padding: 10px 20px;
	border-bottom: 1px solid var(--color-border-light);
	display: flex;
	justify-content: center;
}

.todo-list {
	flex: 1;
	overflow-y: auto;
	padding: 10px 0;
}

.todo-item {
	display: flex;
	align-items: center;
	padding: 12px 20px;
	gap: 12px;
	transition: all 0.3s;
	border-bottom: 1px solid var(--color-bg-hover);
}

.todo-item:hover {
	background-color: var(--color-bg-secondary);
}

.todo-item.completed .todo-text {
	text-decoration: line-through;
	color: var(--color-text-tertiary);
}

.todo-text {
	flex: 1;
	font-size: 14px;
	color: var(--color-text);
	cursor: pointer;
	word-break: break-word;
}

.edit-input {
	flex: 1;
}

.todo-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.todo-time {
	font-size: 12px;
	color: var(--color-text-hint);
}

.todo-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	color: var(--color-text-tertiary);
}

.todo-empty p {
	margin-top: 15px;
	font-size: 14px;
}

.todo-footer {
	padding: 10px 20px;
	border-top: 1px solid var(--color-border-light);
	text-align: center;
}

.todo-list-enter-active,
.todo-list-leave-active {
	transition: all 0.3s ease;
}

.todo-list-enter-from,
.todo-list-leave-to {
	opacity: 0;
	transform: translateX(-30px);
}
</style>
