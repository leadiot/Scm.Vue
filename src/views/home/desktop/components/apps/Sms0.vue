<template>
	<div class="app-container-row app-light">
		<div class="app-sidebar">
			<div class="app-header">
				<span class="app-header-title">短信</span>
				<el-button text class="app-toolbar-btn" @click="showNewSMS = true">
					<sc-icon name="ms-edit" :size="20" />
				</el-button>
			</div>
			<div class="app-search-box">
				<el-input v-model="searchQuery" placeholder="搜索短信..." prefix-icon="el-icon-search" size="small"
					clearable />
			</div>
			<div class="app-list">
				<div v-for="conv in filteredConversations" :key="conv.id" class="app-list-item"
					:class="{ active: selectedConversation?.id === conv.id }" @click="selectConversation(conv)">
					<div class="app-avatar" :style="{ backgroundColor: conv.colors }">
						{{ conv.name.charAt(0) }}
					</div>
					<div class="app-info">
						<div class="app-info-row">
							<span class="app-name">{{ conv.name }}</span>
							<span class="app-time">{{ conv.time }}</span>
						</div>
						<span class="app-preview">{{ conv.lastMessage }}</span>
					</div>
					<div v-if="conv.unread > 0" class="app-badge">{{ conv.unread }}</div>
				</div>
			</div>
		</div>

		<div class="message-area">
			<div v-if="!selectedConversation" class="app-empty">
				<sc-icon name="ms-sms" :size="64" />
				<p>选择一个会话查看短信</p>
			</div>
			<template v-else>
				<div class="message-header">
					<div class="header-left">
						<div class="app-avatar small" :style="{ backgroundColor: selectedConversation.colors }">
							{{ selectedConversation.name.charAt(0) }}
						</div>
						<div class="header-info">
							<span class="app-name">{{ selectedConversation.name }}</span>
							<span class="phone">{{ selectedConversation.phone }}</span>
						</div>
					</div>
					<div class="header-actions">
						<el-button text class="action-btn" @click="callNumber">
							<sc-icon name="ms-call" :size="18" />
						</el-button>
						<el-button text class="action-btn">
							<sc-icon name="ms-more_vert" :size="18" />
						</el-button>
					</div>
				</div>

				<div class="messages" ref="messagesRef">
					<div v-for="msg in messages" :key="msg.id" class="message"
						:class="{ sent: msg.type == 2, received: msg.type == 1 }">
						<div class="message-bubble">
							<span class="text">{{ msg.body }}</span>
							<span class="msg-time">{{ msg.time }}</span>
						</div>
					</div>
				</div>

				<div class="input-area">
					<el-button text class="attach-btn">
						<sc-icon name="ms-add" :size="20" />
					</el-button>
					<el-input v-model="newMessage" placeholder="输入短信内容..." @keyup.enter="sendMessage" class="msg-input"
						type="textarea" :rows="1" resize="none" />
					<el-button type="primary" @click="sendMessage" circle>
						<sc-icon name="ms-send" :size="18" />
					</el-button>
				</div>
			</template>
		</div>

		<el-dialog v-model="showNewSMS" title="新建短信" width="450px">
			<el-form :model="newSMS" label-width="80px">
				<el-form-item label="收件人">
					<el-input v-model="newSMS.phone" placeholder="请输入手机号或选择联系人">
						<template #append>
							<el-button @click="selectFromContacts">
								<sc-icon name="ms-contacts" :size="16" />
							</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="内容">
					<el-input v-model="newSMS.body" type="textarea" :rows="4" placeholder="请输入短信内容" maxlength="500"
						show-word-limit />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showNewSMS = false">取消</el-button>
				<el-button type="primary" @click="sendNewSMS">发送</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="showContactPicker" title="选择联系人" width="400px">
			<div class="contact-picker">
				<div v-for="contact in contacts" :key="contact.id" class="picker-item" @click="pickContact(contact)">
					<div class="avatar small" :style="{ backgroundColor: contact.colors }">
						{{ contact.name.charAt(0) }}
					</div>
					<div class="picker-info">
						<span class="name">{{ contact.name }}</span>
						<span class="phone">{{ contact.phone }}</span>
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
	name: 'SMS',
	components: {
		scIcon,
	},
	data() {
		return {
			searchQuery: '',
			selectedConversation: null,
			showNewSMS: false,
			showContactPicker: false,
			newMessage: '',
			newSMS: this.def_data(),
			conversations: [],
			messages: [],
			contacts: [],
		};
	},
	computed: {
		filteredConversations() {
			if (!this.searchQuery) return this.conversations;
			return this.conversations.filter(
				(c) => c.name.includes(this.searchQuery) || c.phone.includes(this.searchQuery) || c.lastMessage.includes(this.searchQuery)
			);
		},
	},
	mounted() {
		this.listConversations();
		this.listContats();
	},
	methods: {
		def_data() {
			return {
				phone: '',
				body: '',
				time: '',
				type: 1,
			}
		},
		listConversations() {
			this.$API.scmsyssms.conversations.get().then((res) => {
				if (res.code === 200) {
					this.conversations = res.data || [];
				}
			});
		},
		listContats() {
			this.$API.scmsyscontact.list.get().then((res) => {
				if (res.code === 200) {
					this.contacts = res.data || [];
				}
			});
		},
		selectConversation(conv) {
			this.selectedConversation = conv;
			conv.unread = 0;
			this.$API.scmsyssms.list.get({ id: conv.id }).then((res) => {
				if (res.code === 200) {
					this.messages = res.data || [];
				}
			});
		},
		sendMessage() {
			if (!this.newMessage.trim()) return;
			const time = getCurrentTime();
			const convId = this.selectedConversation.id;
			if (!this.messages) {
				this.messages = [];
			}

			var sms = {
				phone: this.selectedConversation.phone,
				body: this.newMessage,
				time: time,
				type: 1
			};
			this.$API.scmsyssms.add.post(sms).then((res) => {
				if (res.code === 200) {
					this.$message.success('短信发送成功');
					this.selectedConversation.lastMessage = this.newMessage;
					this.selectedConversation.time = time;
					this.newMessage = '';
					this.messages.push(res.data || {});
					this.scrollToBottom();
				}
			});
		},
		scrollToBottom() {
			this.$nextTick(() => {
				if (this.$refs.messagesRef) {
					this.$refs.messagesRef.scrollTop = this.$refs.messagesRef.scrollHeight;
				}
			});
		},
		callNumber() {
			this.$message.success(`正在拨打 ${this.selectedConversation.phone}...`);
		},
		selectFromContacts() {
			this.showContactPicker = true;
		},
		pickContact(contact) {
			this.newSMS.phone = contact.phone;
			this.newSMS.name = contact.name;
			this.showContactPicker = false;
		},
		sendNewSMS() {
			if (!this.newSMS.phone || !this.newSMS.body) {
				this.$message.warning('请填写手机号和内容');
				return;
			}
			this.newSMS.colors = getRandomColor();

			this.$API.scmsyssms.add.post(this.newSMS).then((res) => {
				if (res.code === 200) {
					this.showNewSMS = false;
					this.$message.success('短信发送成功');
					this.listConversations();
				}
			});
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.message-area {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.app-empty {
	gap: 16px;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid var(--color-border);
	background-color: var(--color-bg-secondary);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-info {
	display: flex;
	flex-direction: column;
}

.header-info .app-name {
	font-size: 14px;
	font-weight: 500;
}

.header-info .phone {
	font-size: 12px;
	color: var(--color-text-tertiary);
}

.header-actions {
	display: flex;
	gap: 4px;
}

.action-btn {
	color: var(--color-text-tertiary) !important;
}

.action-btn:hover {
	color: var(--color-primary) !important;
}

.messages {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.message {
	display: flex;
}

.message.sent {
	justify-content: flex-end;
}

.message.received {
	justify-content: flex-start;
}

.message-bubble {
	max-width: 70%;
	padding: 10px 14px;
	border-radius: 16px;
	position: relative;
}

.message.sent .message-bubble {
	background-color: var(--color-primary);
	border-bottom-right-radius: 4px;
}

.message.received .message-bubble {
	background-color: var(--color-bg-hover);
	border-bottom-left-radius: 4px;
}

.message-bubble .text {
	font-size: 14px;
	line-height: 1.4;
	display: block;
}

.message.received .message-bubble .text {
	color: var(--color-text);
}

.message-bubble .msg-time {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.8);
	display: block;
	text-align: right;
	margin-top: 4px;
}

.message.received .message-bubble .msg-time {
	color: rgba(0, 0, 0, 0.45);
}

.input-area {
	display: flex;
	align-items: flex-end;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid var(--color-border);
	background-color: var(--color-bg-secondary);
}

.attach-btn {
	color: var(--color-text-tertiary) !important;
}

.msg-input {
	flex: 1;
}

.msg-input :deep(.el-textarea__inner) {
	background-color: var(--color-bg);
	border-color: var(--color-border-dark);
	color: var(--color-text);
	resize: none !important;
}

.contact-picker {
	max-height: 300px;
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
	background-color: #f5f7fa;
}

.picker-info {
	display: flex;
	flex-direction: column;
}

.picker-info .name {
	font-size: 14px;
	font-weight: 500;
	color: #303133;
}

.picker-info .phone {
	font-size: 12px;
	color: #909399;
}
</style>
