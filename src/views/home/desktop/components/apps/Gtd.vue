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
				<el-radio-button value="remind">待提醒 ({{ remindCount }})</el-radio-button>
				<el-radio-button value="done">已完成 ({{ doneCount }})</el-radio-button>
			</el-radio-group>
		</div>

		<div class="todo-list">
			<transition-group name="todo-list">
				<div v-for="gtd in filteredTodos" :key="gtd.id" class="todo-item"
					:class="{ completed: gtd.handle === 3, 'has-remind': gtd.remind_time && gtd.handle === 1 }">
					<el-checkbox v-model="gtd.checked" @change="handleTodo(gtd)" />
					
					<!-- 编辑模式 -->
					<div v-if="currentGtd.id === gtd.id" class="edit-form">
						<el-input v-model="gtd.title" maxlength="256" show-word-limit
							clearable size="small" class="edit-title" />
						<el-date-picker
							v-model="gtd.remind_time"
							type="datetime"
							placeholder="设置提醒时间"
							size="small"
							:disabled-date="disabledDate"
						>
						</el-date-picker>
						<el-input
							v-model="gtd.remark"
							type="textarea"
							:rows="3"
							maxlength="500"
							show-word-limit
							placeholder="添加备注"
							size="small"
						>
						</el-input>
					</div>
					
					<!-- 显示模式 -->
					<div v-else class="todo-content">
						<span class="todo-text" @dblclick="startEdit(gtd)">{{ gtd.title }}</span>
						<!-- 备注显示 -->
						<span v-if="gtd.remark" class="todo-remark" @dblclick="startEdit(gtd)">
							<sc-icon name="ms-comment" :size="14" />
							{{ gtd.remark.length > 20 ? gtd.remark.substring(0, 20) + '...' : gtd.remark }}
						</span>
					</div>
					
					<div class="todo-actions">
						<!-- 提醒时间显示 -->
						<div v-if="gtd.remind_time" class="todo-remind" :class="{ 'remind-soon': isRemindSoon(gtd.remind_time) }">
							<sc-icon name="ms-access_alarm" :size="14" />
							<span>{{ formatRemindTime(gtd.remind_time) }}</span>
						</div>
						<span v-else class="todo-time">{{ formatTime(gtd.create_time) }}</span>
						
						<el-button text size="small" @click="startEdit(gtd)" class="edit-btn">
							<sc-icon name="ms-edit" :size="16" />
						</el-button>
						<el-button text size="small" @click="deleteTodo(gtd)">
							<sc-icon name="ms-delete" :size="16" />
						</el-button>
					</div>
				</div>
			</transition-group>

			<div v-if="filteredTodos.length === 0" class="todo-empty">
				<sc-icon name="ms-assignment_turned_in" :size="48" />
				<p>{{ getEmptyText() }}</p>
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
			} else if (this.filter === 'remind') {
				return this.gtd_list.filter(todo => todo.handle === 1 && todo.remind_time && new Date(todo.remind_time) > new Date());
			}
			return this.gtd_list;
		},
		todoCount() {
			return this.gtd_list.filter(gtd => gtd.handle === 1).length;
		},
		doneCount() {
			return this.gtd_list.filter(gtd => gtd.handle === 3).length;
		},
		remindCount() {
			return this.gtd_list.filter(gtd => gtd.handle === 1 && gtd.remind_time && new Date(gtd.remind_time) > new Date()).length;
		},
	},
	methods: {
		disabledDate(time) {
			return time.getTime() < Date.now() - 8.64e7;
		},
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
		setReminder(gtd) {
			const remindTime = new Date(gtd.remind_time);
			const now = new Date();
			const delay = remindTime.getTime() - now.getTime();
			
			if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
				setTimeout(() => {
					// 检查待办是否仍未完成
					this.$API.scmsysgtdheader.view.get(gtd.id).then(res => {
						if (res.code == 200 && res.data.handle === 1) {
							this.showNotification(gtd);
						}
					});
				}, delay);
			}
		},
		showNotification(gtd) {
			if ('Notification' in window) {
				if (Notification.permission === 'granted') {
					new Notification('待办提醒', {
						body: gtd.title,
						icon: '/favicon.ico',
						tag: `todo-${gtd.id}`,
						requireInteraction: true
					});
				} else if (Notification.permission === 'default') {
					Notification.requestPermission().then(permission => {
						if (permission === 'granted') {
							new Notification('待办提醒', {
								body: gtd.title,
								icon: '/favicon.ico',
								tag: `todo-${gtd.id}`,
								requireInteraction: true
							});
						}
					});
				}
			}
		},
		startEdit(todo) {
			this.currentGtd = { ...todo };
			if (todo.remind_time) {
				this.currentGtd.remind_time = new Date(Number(todo.remind_time));
			}
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
			var data = {
				id: gtd.id,
				title: gtd.title,
				remark: gtd.remark || '',
				remind_time: gtd.remind_time ? (typeof gtd.remind_time === 'object' ? gtd.remind_time.getTime() : gtd.remind_time) : null
			};
			var res = await this.$API.scmsysgtdheader.update.put(data);
			if (res.code == 200) {
				await this.loadTodos();
				// 如果更新了提醒时间，重新设置提醒
				if (data.remind_time) {
					this.setReminder(data);
				}
			}
		},
		async handleTodo(gtd) {
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

			this.gtd_list = res.data || [];
			for (let todo of this.gtd_list) {
				todo.checked = todo.handle === 3;
			}

			// 检查是否有即将到期的待办需要提醒
			this.checkReminders();
		},
		checkReminders() {
			const now = new Date();
			const fiveMinutes = 5 * 60 * 1000;

			for (let todo of this.gtd_list) {
				if (todo.handle === 1 && todo.remind_time) {
					const remindTime = new Date(Number(todo.remind_time));
					const diff = remindTime.getTime() - now.getTime();
					
					if (diff > 0 && diff <= fiveMinutes) {
						this.showNotification(todo);
					}
				}
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
		formatRemindTime(date) {
			if (!date) return '';
			const d = new Date(Number(date));
			const now = new Date();
			const diff = d.getTime() - now.getTime();

			if (diff < 0) return '已过期';
			if (diff < 60000) return '即将提醒';
			if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟后`;
			if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时后`;
			if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天后`;

			return d.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
		},
		isRemindSoon(date) {
			if (!date) return false;
			const d = new Date(Number(date));
			const now = new Date();
			const diff = d.getTime() - now.getTime();
			return diff > 0 && diff <= 30 * 60 * 1000; // 30分钟内
		},
		getEmptyText() {
			switch (this.filter) {
				case 'todo':
					return '暂无待办事项';
				case 'done':
					return '暂无已完成事项';
				case 'remind':
					return '暂无待提醒事项';
				default:
					return '暂无待办事项';
			}
		},
	},
	mounted() {
		this.loadTodos();
		// 请求通知权限
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
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
	align-items: flex-start;
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

.todo-item.completed .todo-remark {
	text-decoration: line-through;
	color: var(--color-text-tertiary);
}

.todo-item.has-remind {
	background-color: rgba(250, 187, 44, 0.08);
}

.todo-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.todo-text {
	font-size: 14px;
	color: var(--color-text);
	cursor: pointer;
	word-break: break-word;
}

.todo-remark {
	font-size: 12px;
	color: var(--color-text-secondary);
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 4px;
}

.edit-form {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.edit-title {
	width: 100%;
}

.todo-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	white-space: nowrap;
}

.todo-time {
	font-size: 12px;
	color: var(--color-text-hint);
}

.todo-remind {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	color: var(--el-color-warning);
	padding: 2px 6px;
	background-color: rgba(250, 187, 44, 0.15);
	border-radius: 4px;
}

.todo-remind.remind-soon {
	background-color: rgba(250, 187, 44, 0.3);
	font-weight: 500;
}

.edit-btn {
	display: none;
}

.todo-item:hover .edit-btn {
	display: inline-flex;
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
