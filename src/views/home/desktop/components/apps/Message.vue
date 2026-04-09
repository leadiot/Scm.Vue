<template>
	<div class="message-app">
		<div class="contact-list">
			<div class="list-header">
				<span class="app-title">消息</span>
				<el-button text class="add-btn">
					<sc-icon name="ms-add" :size="20" />
				</el-button>
			</div>
			<div class="search-box">
				<el-input v-model="searchQuery" placeholder="搜索联系人..." prefix-icon="el-icon-search" size="small"
					clearable />
			</div>
			<div v-for="contact in filteredContacts" :key="contact.id" class="contact-item"
				:class="{ active: selectedContact === contact.id }" @click="selectContact(contact.id)">
				<div class="avatar" :style="{ backgroundColor: getAvatarColor(contact.id) }">
					{{ contact.name.charAt(0) }}
				</div>
				<div class="contact-info">
					<div class="contact-top">
						<span class="name">{{ contact.name }}</span>
						<span class="time">{{ contact.time }}</span>
					</div>
					<span class="last-message">{{ contact.lastMessage }}</span>
				</div>
				<div v-if="contact.unread > 0" class="unread-badge">{{ contact.unread }}</div>
			</div>
		</div>

		<div class="chat-area">
			<div v-if="!currentContact" class="empty-chat">
				<sc-icon name="ms-chat_bubble_outline" :size="64" />
				<p>选择一个联系人开始聊天</p>
			</div>
			<template v-else>
				<div class="chat-header">
					<div class="header-left">
						<div class="avatar small" :style="{ backgroundColor: getAvatarColor(currentContact.id) }">
							{{ currentContact.name.charAt(0) }}
						</div>
						<div class="header-info">
							<span class="name">{{ currentContact.name }}</span>
							<span class="status">
								<sc-icon name="ms-circle" :size="8" class="online-icon" />
								在线
							</span>
						</div>
					</div>
					<div class="header-actions">
						<el-button text class="action-btn">
							<sc-icon name="ms-call" :size="18" />
						</el-button>
						<el-button text class="action-btn">
							<sc-icon name="ms-videocam" :size="18" />
						</el-button>
						<el-button text class="action-btn">
							<sc-icon name="ms-more_vert" :size="18" />
						</el-button>
					</div>
				</div>

				<div class="messages" ref="messagesRef">
					<div v-for="msg in messages" :key="msg.id" class="message" :class="{ sent: msg.sent }">
						<div class="message-content">
							<span class="text">{{ msg.text }}</span>
							<span class="msg-time">{{ msg.time }}</span>
						</div>
					</div>
				</div>

				<div class="input-area">
					<el-button text class="attach-btn">
						<sc-icon name="ms-attach_file" :size="20" />
					</el-button>
					<el-button text class="attach-btn">
						<sc-icon name="ms-emoji_emotions" :size="20" />
					</el-button>
					<el-input v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" class="msg-input" />
					<el-button type="primary" @click="sendMessage" circle>
						<sc-icon name="ms-send" :size="18" />
					</el-button>
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import { getAvatarColor } from './utils.js';

export default {
	name: 'Message',
	components: {
		scIcon,
	},
	data() {
		return {
			selectedContact: 1,
			newMessage: '',
			searchQuery: '',
			contacts: [
				{ id: 1, name: '张三', lastMessage: '好的，明天见！', time: '10:30', unread: 2 },
				{ id: 2, name: '李四', lastMessage: '项目文档已发送', time: '昨天', unread: 0 },
				{ id: 3, name: '王五', lastMessage: '收到，谢谢', time: '周一', unread: 0 },
				{ id: 4, name: '赵六', lastMessage: '会议时间确定了吗？', time: '周日', unread: 1 },
			],
			messages: [
				{ id: 1, text: '你好！最近怎么样？', sent: false, time: '10:25' },
				{ id: 2, text: '挺好的，你呢？', sent: true, time: '10:26' },
				{ id: 3, text: '我也不错，明天有空吗？想约你一起吃饭', sent: false, time: '10:28' },
				{ id: 4, text: '可以啊，什么时间？', sent: true, time: '10:29' },
				{ id: 5, text: '好的，明天见！', sent: false, time: '10:30' },
			],
		};
	},
	computed: {
		currentContact() {
			return this.contacts.find((c) => c.id === this.selectedContact);
		},
		filteredContacts() {
			if (!this.searchQuery) return this.contacts;
			return this.contacts.filter((c) =>
				c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
			);
		},
	},
	methods: {
		selectContact(id) {
			this.selectedContact = id;
			const contact = this.contacts.find((c) => c.id === id);
			if (contact) contact.unread = 0;
		},
		sendMessage() {
			if (this.newMessage.trim()) {
				const now = new Date();
				const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
				this.messages.push({
					id: this.messages.length + 1,
					text: this.newMessage,
					sent: true,
					time,
				});
				this.newMessage = '';
				this.$nextTick(() => {
					if (this.$refs.messagesRef) {
						this.$refs.messagesRef.scrollTop = this.$refs.messagesRef.scrollHeight;
					}
				});
			}
		},
	},
};
</script>

<style scoped>
.message-app {
	height: 100%;
	display: flex;
	background-color: #1a1a1a;
	color: #fff;
}

.contact-list {
	width: 280px;
	background-color: #252525;
	border-right: 1px solid #333;
	display: flex;
	flex-direction: column;
}

.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px;
	border-bottom: 1px solid #333;
}

.app-title {
	font-size: 18px;
	font-weight: 600;
}

.add-btn {
	color: #409eff !important;
}

.search-box {
	padding: 8px 12px;
	border-bottom: 1px solid #333;
}

.contact-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	cursor: pointer;
	transition: background-color 0.2s;
	position: relative;
}

.contact-item:hover {
	background-color: #2a2a2a;
}

.contact-item.active {
	background-color: #333;
}

.avatar {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	font-size: 16px;
	flex-shrink: 0;
}

.avatar.small {
	width: 36px;
	height: 36px;
	font-size: 14px;
}

.contact-info {
	flex: 1;
	overflow: hidden;
}

.contact-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.name {
	font-size: 14px;
	font-weight: 500;
}

.time {
	font-size: 11px;
	color: #666;
}

.last-message {
	font-size: 12px;
	color: #888;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-top: 4px;
}

.unread-badge {
	position: absolute;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	background-color: #409eff;
	color: #fff;
	font-size: 11px;
	padding: 2px 6px;
	border-radius: 10px;
	min-width: 18px;
	text-align: center;
}

.chat-area {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.empty-chat {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #555;
}

.empty-chat p {
	margin-top: 16px;
	font-size: 14px;
}

.chat-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	background-color: #252525;
	border-bottom: 1px solid #333;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.header-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.header-info .name {
	font-size: 15px;
}

.status {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	color: #67c23a;
}

.online-icon {
	color: #67c23a;
}

.header-actions {
	display: flex;
	gap: 4px;
}

.action-btn {
	color: #888 !important;
}

.action-btn:hover {
	color: #fff !important;
	background-color: #333 !important;
}

.messages {
	flex: 1;
	padding: 16px;
	overflow-y: auto;
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

.message-content {
	max-width: 70%;
	padding: 10px 14px;
	border-radius: 12px;
	background-color: #333;
}

.message.sent .message-content {
	background-color: #409eff;
}

.text {
	font-size: 14px;
	line-height: 1.4;
	word-break: break-word;
}

.msg-time {
	display: block;
	font-size: 10px;
	color: rgba(255, 255, 255, 0.6);
	margin-top: 4px;
	text-align: right;
}

.input-area {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 16px;
	background-color: #252525;
	border-top: 1px solid #333;
}

.attach-btn {
	color: #888 !important;
}

.attach-btn:hover {
	color: #fff !important;
	background-color: #333 !important;
}

.msg-input {
	flex: 1;
}

:deep(.el-input__wrapper) {
	background-color: #333;
	box-shadow: none;
}

:deep(.el-input__inner) {
	color: #fff;
}

:deep(.el-input__inner::placeholder) {
	color: #666;
}
</style>
