<template>
	<div class="todo-app">
		<div class="todo-header">
			<h3>待办事项</h3>
			<span class="todo-count">{{ remainingCount }} 项待完成</span>
		</div>

		<div class="todo-input">
			<el-input v-model="newTodo" placeholder="添加新待办事项..." @keyup.enter="addTodo">
				<template #append>
					<el-button @click="addTodo" :disabled="!newTodo.trim()">
						<sc-icon name="ms-add" />
					</el-button>
				</template>
			</el-input>
		</div>

		<div class="todo-filters">
			<el-radio-group v-model="filter" size="small">
				<el-radio-button value="all">全部 ({{ todos.length }})</el-radio-button>
				<el-radio-button value="active">待完成 ({{ remainingCount }})</el-radio-button>
				<el-radio-button value="completed">已完成 ({{ completedCount }})</el-radio-button>
			</el-radio-group>
		</div>

		<div class="todo-list">
			<transition-group name="todo-list">
				<div v-for="todo in filteredTodos" :key="todo.id" class="todo-item" :class="{ completed: todo.completed }">
					<el-checkbox v-model="todo.completed" @change="saveTodos" />
					<span class="todo-text" @dblclick="startEdit(todo)">{{ todo.text }}</span>
					<el-input v-if="editingId === todo.id" v-model="editingText" size="small"
						@blur="finishEdit(todo)" @keyup.enter="finishEdit(todo)" @keyup.escape="cancelEdit"
						class="edit-input" ref="editInput" />
					<div class="todo-actions">
						<span class="todo-time">{{ formatTime(todo.createdAt) }}</span>
						<el-button text size="small" @click="removeTodo(todo.id)">
							<sc-icon name="ms-delete" :size="16" />
						</el-button>
					</div>
				</div>
			</transition-group>

			<div v-if="filteredTodos.length === 0" class="todo-empty">
				<sc-icon name="ms-assignment_turned_in" :size="48" />
				<p>{{ filter === 'completed' ? '暂无已完成事项' : '暂无待办事项' }}</p>
			</div>
		</div>

		<div v-if="todos.length > 0" class="todo-footer">
			<el-button v-if="completedCount > 0" text type="danger" @click="clearCompleted">
				清除已完成 ({{ completedCount }})
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
			newTodo: '',
			todos: [],
			filter: 'all',
			editingId: null,
			editingText: '',
			todoIdCounter: 1,
		};
	},
	computed: {
		filteredTodos() {
			if (this.filter === 'active') {
				return this.todos.filter(todo => !todo.completed);
			} else if (this.filter === 'completed') {
				return this.todos.filter(todo => todo.completed);
			}
			return this.todos;
		},
		remainingCount() {
			return this.todos.filter(todo => !todo.completed).length;
		},
		completedCount() {
			return this.todos.filter(todo => todo.completed).length;
		},
	},
	methods: {
		addTodo() {
			const text = this.newTodo.trim();
			if (!text) return;

			this.todos.unshift({
				id: this.todoIdCounter++,
				text: text,
				completed: false,
				createdAt: new Date(),
			});

			this.newTodo = '';
			this.saveTodos();
		},
		removeTodo(id) {
			this.todos = this.todos.filter(todo => todo.id !== id);
			this.saveTodos();
		},
		startEdit(todo) {
			this.editingId = todo.id;
			this.editingText = todo.text;
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
			const text = this.editingText.trim();
			if (text) {
				todo.text = text;
				this.saveTodos();
			}
			this.editingId = null;
			this.editingText = '';
		},
		cancelEdit() {
			this.editingId = null;
			this.editingText = '';
		},
		clearCompleted() {
			this.todos = this.todos.filter(todo => !todo.completed);
			this.saveTodos();
		},
		saveTodos() {
			localStorage.setItem('desktop_todos', JSON.stringify(this.todos));
		},
		loadTodos() {
			const saved = localStorage.getItem('desktop_todos');
			if (saved) {
				this.todos = JSON.parse(saved);
				const maxId = this.todos.reduce((max, todo) => Math.max(max, todo.id), 0);
				this.todoIdCounter = maxId + 1;
			}
		},
		formatTime(date) {
			if (!date) return '';
			const d = new Date(date);
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

<style scoped>
.todo-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #fff;
}

.todo-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 20px;
	border-bottom: 1px solid #eee;
}

.todo-header h3 {
	margin: 0;
	font-size: 18px;
	color: #333;
}

.todo-count {
	font-size: 13px;
	color: #999;
}

.todo-input {
	padding: 15px 20px;
	border-bottom: 1px solid #eee;
}

.todo-input .el-input-group__append {
	background-color: #409eff;
	border-color: #409eff;
}

.todo-input .el-input-group__append .el-button {
	color: #fff;
}

.todo-filters {
	padding: 10px 20px;
	border-bottom: 1px solid #eee;
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
	border-bottom: 1px solid #f5f5f5;
}

.todo-item:hover {
	background-color: #fafafa;
}

.todo-item.completed .todo-text {
	text-decoration: line-through;
	color: #999;
}

.todo-text {
	flex: 1;
	font-size: 14px;
	color: #333;
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
	color: #bbb;
}

.todo-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	color: #ccc;
}

.todo-empty p {
	margin-top: 15px;
	font-size: 14px;
}

.todo-footer {
	padding: 10px 20px;
	border-top: 1px solid #eee;
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
