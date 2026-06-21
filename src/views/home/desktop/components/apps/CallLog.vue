<template>
	<div class="app-container-row app-light">
		<div class="app-sidebar wide">
			<div class="app-header">
				<span class="app-header-title">通话记录</span>
				<el-button text class="app-toolbar-btn" @click="showNewCall = true">
					<sc-icon name="ms-call" :size="20" />
				</el-button>
			</div>
			<div class="call-filters">
				<el-radio-group v-model="filterType" size="small">
					<el-radio-button label="all">全部</el-radio-button>
					<el-radio-button label="missed">未接</el-radio-button>
					<el-radio-button label="outgoing">已拨</el-radio-button>
					<el-radio-button label="incoming">已接</el-radio-button>
				</el-radio-group>
			</div>
			<div class="app-search-box">
				<el-input v-model="searchQuery" placeholder="搜索通话..." prefix-icon="el-icon-search" size="small"
					clearable />
			</div>
			<div class="app-list">
				<div v-for="group in groupedCalls" :key="group.date" class="call-group">
					<div class="group-header">{{ group.date }}</div>
					<div v-for="call in group.calls" :key="call.id" class="app-list-item"
						:class="{ active: selectedCall?.id === call.id }" @click="selectCall(call)">
						<div class="call-icon" :class="call.type">
							<sc-icon :name="getCallIcon(call.type)" :size="18" />
						</div>
						<div class="app-info">
							<div class="app-info-row">
								<span class="app-name">{{ call.name }}</span>
								<span class="call-duration" v-if="call.duration">{{ formatDuration(call.duration) }}</span>
							</div>
							<div class="app-info-row">
								<span class="call-number">{{ call.number }}</span>
								<span class="app-time">{{ call.time }}</span>
							</div>
						</div>
					</div>
				</div>
				<div v-if="groupedCalls.length === 0" class="app-empty">
					<sc-icon name="ms-call" :size="48" />
					<p>暂无通话记录</p>
				</div>
			</div>
		</div>

		<div class="call-detail">
			<div v-if="!selectedCall" class="app-empty">
				<sc-icon name="ms-call" :size="64" />
				<p>选择一个通话查看详情</p>
			</div>
			<template v-else>
				<div class="detail-header">
					<div class="call-icon large" :class="selectedCall.type">
						<sc-icon :name="getCallIcon(selectedCall.type)" :size="32" />
					</div>
					<div class="header-info">
						<span class="app-name">{{ selectedCall.name }}</span>
						<span class="call-number">{{ selectedCall.number }}</span>
						<span class="call-status">{{ getCallStatusText(selectedCall.type) }}</span>
					</div>
				</div>

				<div class="detail-section">
					<div class="section-title">通话信息</div>
					<div class="info-item">
						<sc-icon name="ms-schedule" :size="18" />
						<span class="label">时间:</span>
						<span>{{ selectedCall.datetime }}</span>
					</div>
					<div class="info-item" v-if="selectedCall.duration">
						<sc-icon name="ms-timer" :size="18" />
						<span class="label">时长:</span>
						<span>{{ formatDuration(selectedCall.duration) }}</span>
					</div>
					<div class="info-item" v-if="selectedCall.note">
						<sc-icon name="ms-note" :size="18" />
						<span class="label">备注:</span>
						<span>{{ selectedCall.note }}</span>
					</div>
				</div>

				<div class="detail-actions">
					<el-button type="primary" @click="callNumber">
						<sc-icon name="ms-call" :size="16" />
						回拨
					</el-button>
					<el-button @click="sendSMS">
						<sc-icon name="ms-sms" :size="16" />
						短信
					</el-button>
					<el-button @click="showEditNote = true">
						<sc-icon name="ms-edit" :size="16" />
						备注
					</el-button>
					<el-button type="danger" text @click="deleteCall">
						<sc-icon name="ms-delete" :size="16" />
						删除
					</el-button>
				</div>
			</template>
		</div>

		<el-dialog v-model="showNewCall" title="新建通话" width="400px">
			<el-form :model="newCall" label-width="80px">
				<el-form-item label="电话号码">
					<el-input v-model="newCall.number" placeholder="请输入电话号码">
						<template #append>
							<el-button @click="selectFromContacts">
								<sc-icon name="ms-contacts" :size="16" />
							</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="通话类型">
					<el-radio-group v-model="newCall.type">
						<el-radio label="outgoing">拨出</el-radio>
						<el-radio label="incoming">接入</el-radio>
						<el-radio label="missed">未接</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="时长(秒)">
					<el-input-number v-model="newCall.duration" :min="0" :max="7200" size="small" />
				</el-form-item>
				<el-form-item label="备注">
					<el-input v-model="newCall.note" type="textarea" :rows="2" placeholder="添加备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showNewCall = false">取消</el-button>
				<el-button type="primary" @click="addCall">确定</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="showEditNote" title="编辑备注" width="400px">
			<el-form label-width="80px">
				<el-form-item label="备注">
					<el-input v-model="callNote" type="textarea" :rows="3" placeholder="添加备注" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showEditNote = false">取消</el-button>
				<el-button type="primary" @click="saveNote">保存</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="showContactPicker" title="选择联系人" width="400px">
			<div class="contact-picker">
				<div class="picker-search">
					<el-input v-model="contactSearch" placeholder="搜索联系人..." prefix-icon="el-icon-search" size="small"
						clearable />
				</div>
				<div class="picker-list">
					<div v-for="contact in filteredContacts" :key="contact.id" class="picker-item"
						@click="pickContact(contact)">
						<div class="app-avatar small" :style="{ backgroundColor: contact.color || '#409eff' }">
							{{ contact.name.charAt(0) }}
						</div>
						<div class="picker-info">
							<span class="name">{{ contact.name }}</span>
							<span class="number">{{ contact.phones && contact.phones[0] ? contact.phones[0].number : '' }}</span>
						</div>
					</div>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import { getCurrentTime, getRandomColor } from './utils.js';

export default {
	name: 'CallLog',
	components: {
		scIcon,
	},
	data() {
		return {
			searchQuery: '',
			filterType: 'all',
			selectedCall: null,
			showNewCall: false,
			showEditNote: false,
			showContactPicker: false,
			callNote: '',
			contactSearch: '',
			newCall: this.def_data(),
			calls: [],
			contacts: [],
		};
	},
	computed: {
		filteredCalls() {
			let filtered = this.calls;

			if (this.filterType !== 'all') {
				filtered = filtered.filter((c) => c.type === this.filterType);
			}
 
			if (this.searchQuery) {
				const query = this.searchQuery.toLowerCase();
				filtered = filtered.filter(
					(c) =>
						c.name.toLowerCase().includes(query) ||
						c.number.toLowerCase().includes(query) ||
						(c.note && c.note.toLowerCase().includes(query))
				);
			}

			return filtered;
		},
		groupedCalls() {
			const groups = {};
			this.filteredCalls.forEach((call) => {
				if (!groups[call.date]) {
					groups[call.date] = [];
				}
				groups[call.date].push(call);
			});

			return Object.keys(groups)
				.sort((a, b) => new Date(b) - new Date(a))
				.map((date) => ({
					date: this.formatDateHeader(date),
					calls: groups[date],
				}));
		},
		filteredContacts() {
			if (!this.contactSearch) return this.contacts;
			const query = this.contactSearch.toLowerCase();
			return this.contacts.filter((c) => {
				const nameMatch = c.name.toLowerCase().includes(query);
				const phoneMatch = c.phones && c.phones.some((p) => p.number.includes(query));
				return nameMatch || phoneMatch;
			});
		},
	},
	mounted() {
		this.listCalls();
		this.listContacts();
	},
	methods: {
		def_data() {
			return {
				number: '',
				type: 'outgoing',
				duration: 0,
				note: '',
			};
		},
		listCalls() {
			this.$API.scmsyscalllog.list.get().then((res) => {
				if (res.code === 200) {
					this.calls = res.data || [];
				}
			});
		},
		listContacts() {
			this.$API.scmsyscontact.list.get().then((res) => {
				if (res.code === 200) {
					this.contacts = res.data || [];
				}
			});
		},
		selectCall(call) {
			this.selectedCall = call;
			this.callNote = call.note || '';
		},
		getCallIcon(type) {
			const icons = {
				outgoing: 'ms-call_made',
				incoming: 'ms-call_received',
				missed: 'ms-call_missed',
			};
			return icons[type] || 'ms-call';
		},
		getCallStatusText(type) {
			const texts = {
				outgoing: '已拨出',
				incoming: '已接听',
				missed: '未接听',
			};
			return texts[type] || '未知';
		},
		formatDateHeader(dateStr) {
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);

			const date = new Date(dateStr);
			if (date.toDateString() === today.toDateString()) {
				return '今天';
			} else if (date.toDateString() === yesterday.toDateString()) {
				return '昨天';
			} else {
				return `${date.getMonth() + 1}月${date.getDate()}日`;
			}
		},
		formatDuration(seconds) {
			if (!seconds || seconds <= 0) return '';
			const mins = Math.floor(seconds / 60);
			const secs = seconds % 60;
			if (mins >= 60) {
				const hours = Math.floor(mins / 60);
				const remainingMins = mins % 60;
				return `${hours}小时${remainingMins}分`;
			}
			return `${mins}分${secs}秒`;
		},
		callNumber() {
			if (this.selectedCall) {
				this.$message.success(`正在拨打 ${this.selectedCall.number}...`);
			}
		},
		sendSMS() {
			if (this.selectedCall) {
				this.$message.info(`打开短信应用发送到 ${this.selectedCall.number}`);
			}
		},
		saveNote() {
			if (!this.selectedCall) return;
			this.$API.scmsyscalllog.update.put({ id: this.selectedCall.id, note: this.callNote }).then((res) => {
				if (res.code === 200) {
					this.selectedCall.note = this.callNote;
					this.showEditNote = false;
					this.$message.success('备注已保存');
				}
			});
		},
		deleteCall() {
			if (!this.selectedCall) return;
			this.$confirm('确定要删除该通话记录吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}).then(() => {
				this.$API.scmsyscalllog.delete.delete({ id: this.selectedCall.id }).then((res) => {
					if (res.code === 200) {
						const index = this.calls.findIndex((c) => c.id === this.selectedCall.id);
						if (index > -1) {
							this.calls.splice(index, 1);
						}
						this.selectedCall = null;
						this.$message.success('通话记录已删除');
					}
				});
			}).catch(() => { });
		},
		selectFromContacts() {
			this.showContactPicker = true;
		},
		pickContact(contact) {
			this.newCall.number = contact.phones && contact.phones[0] ? contact.phones[0].number : '';
			this.newCall.name = contact.name;
			this.showContactPicker = false;
		},
		addCall() {
			if (!this.newCall.number) {
				this.$message.warning('请填写电话号码');
				return;
			}

			const time = getCurrentTime();
			this.$API.scmsyscalllog.add.post({
				...this.newCall,
				datetime: time,
				date: new Date().toISOString().split('T')[0],
				time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
			}).then((res) => {
				if (res.code === 200) {
					this.showNewCall = false;
					this.newCall = this.def_data();
					this.$message.success('通话记录已添加');
					this.listCalls();
				}
			});
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.call-filters {
	padding: 8px 12px;
	border-bottom: 1px solid var(--color-border-light);
}

.call-filters :deep(.el-radio-group) {
	width: 100%;
	display: flex;
}

.call-filters :deep(.el-radio-button) {
	flex: 1;
}

.call-filters :deep(.el-radio-button__inner) {
	width: 100%;
	border: none;
	border-radius: 0;
	padding: 8px 4px;
	font-size: 12px;
}

.call-filters :deep(.el-radio-button:first-child .el-radio-button__inner) {
	border-radius: 4px 0 0 4px;
}

.call-filters :deep(.el-radio-button:last-child .el-radio-button__inner) {
	border-radius: 0 4px 4px 0;
}

.call-group {
	margin-bottom: 8px;
}

.group-header {
	padding: 8px 16px;
	background-color: var(--color-bg-hover);
	color: var(--color-text-tertiary);
	font-size: 12px;
	font-weight: 600;
	position: sticky;
	top: 0;
}

.call-icon {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.call-icon.outgoing {
	background-color: var(--color-success);
	color: #fff;
}

.call-icon.incoming {
	background-color: var(--color-primary);
	color: #fff;
}

.call-icon.missed {
	background-color: var(--color-danger);
	color: #fff;
}

.call-icon.large {
	width: 64px;
	height: 64px;
	font-size: 28px;
}

.call-detail {
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 24px;
	overflow-y: auto;
}

.app-empty {
	gap: 16px;
}

.detail-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-bottom: 24px;
	border-bottom: 1px solid var(--color-border);
	gap: 16px;
}

.header-info {
	text-align: center;
}

.header-info .app-name {
	font-size: 20px;
	font-weight: 600;
	display: block;
}

.header-info .call-number {
	font-size: 14px;
	color: var(--color-text-secondary);
	display: block;
}

.header-info .call-status {
	font-size: 12px;
	color: var(--color-primary);
	display: block;
	margin-top: 4px;
}

.detail-section {
	padding: 20px 0;
	border-bottom: 1px solid var(--color-border);
}

.section-title {
	font-size: 14px;
	font-weight: 600;
	color: var(--color-text-tertiary);
	margin-bottom: 12px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 0;
	color: var(--color-text);
	font-size: 14px;
}

.info-item .label {
	color: var(--color-text-tertiary);
	min-width: 60px;
}

.call-number {
	font-size: 12px;
	color: var(--color-text-tertiary);
}

.call-duration {
	font-size: 12px;
	color: var(--color-text-tertiary);
	margin-left: auto;
}

.detail-actions {
	display: flex;
	gap: 12px;
	padding-top: 24px;
	flex-wrap: wrap;
}

.detail-actions .el-button {
	flex: 1;
	min-width: 80px;
}

.contact-picker {
	height: 400px;
	display: flex;
	flex-direction: column;
}

.picker-search {
	padding-bottom: 12px;
}

.picker-list {
	flex: 1;
	overflow-y: auto;
}

.picker-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	cursor: pointer;
	border-radius: 8px;
	transition: background-color 0.2s;
}

.picker-item:hover {
	background-color: var(--color-bg-hover);
}

.picker-info {
	display: flex;
	flex-direction: column;
}

.picker-info .name {
	font-size: 14px;
	font-weight: 500;
}

.picker-info .number {
	font-size: 12px;
	color: var(--color-text-tertiary);
}
</style>
