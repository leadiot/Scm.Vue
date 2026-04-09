<template>
	<div class="sms-app">
		<div class="conversation-list">
			<div class="list-header">
				<span class="app-title">短信</span>
				<el-button text class="add-btn" @click="showNewSMS = true">
					<sc-icon name="ms-edit" :size="20" />
				</el-button>
			</div>
			<div class="search-box">
				<el-input v-model="searchQuery" placeholder="搜索短信..." prefix-icon="el-icon-search" size="small" clearable />
			</div>
			<div class="conversations">
				<div v-for="conv in filteredConversations" :key="conv.id" class="conversation-item" :class="{ active: selectedConversation?.id === conv.id }" @click="selectConversation(conv)">
					<div class="avatar" :style="{ backgroundColor: conv.color }">
						{{ conv.name.charAt(0) }}
					</div>
					<div class="conv-info">
						<div class="conv-top">
							<span class="name">{{ conv.name }}</span>
							<span class="time">{{ conv.time }}</span>
						</div>
						<span class="preview">{{ conv.lastMessage }}</span>
					</div>
					<div v-if="conv.unread > 0" class="unread-badge">{{ conv.unread }}</div>
				</div>
			</div>
		</div>

		<div class="message-area">
			<div v-if="!selectedConversation" class="empty-message">
				<sc-icon name="ms-sms" :size="64" />
				<p>选择一个会话查看短信</p>
			</div>
			<template v-else>
				<div class="message-header">
					<div class="header-left">
						<div class="avatar small" :style="{ backgroundColor: selectedConversation.color }">
							{{ selectedConversation.name.charAt(0) }}
						</div>
						<div class="header-info">
							<span class="name">{{ selectedConversation.name }}</span>
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
					<div v-for="msg in currentMessages" :key="msg.id" class="message" :class="{ sent: msg.sent, received: !msg.sent }">
						<div class="message-bubble">
							<span class="text">{{ msg.text }}</span>
							<span class="msg-time">{{ msg.time }}</span>
						</div>
					</div>
				</div>

				<div class="input-area">
					<el-button text class="attach-btn">
						<sc-icon name="ms-add" :size="20" />
					</el-button>
					<el-input v-model="newMessage" placeholder="输入短信内容..." @keyup.enter="sendMessage" class="msg-input" type="textarea" :rows="1" resize="none" />
					<el-button type="primary" @click="sendMessage" circle>
						<sc-icon name="ms-send" :size="18" />
					</el-button>
				</div>
			</template>
		</div>

		<el-dialog v-model="showNewSMS" title="新建短信" width="450px">
			<el-form :model="newSMS" label-width="80px">
				<el-form-item label="收件人">
					<el-input v-model="newSMS.recipient" placeholder="请输入手机号或选择联系人">
						<template #append>
							<el-button @click="selectFromContacts">
								<sc-icon name="ms-contacts" :size="16" />
							</el-button>
						</template>
					</el-input>
				</el-form-item>
				<el-form-item label="内容">
					<el-input v-model="newSMS.content" type="textarea" :rows="4" placeholder="请输入短信内容" maxlength="500" show-word-limit />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showNewSMS = false">取消</el-button>
				<el-button type="primary" @click="sendNewSMS">发送</el-button>
			</template>
		</el-dialog>

		<el-dialog v-model="showContactPicker" title="选择联系人" width="400px">
			<div class="contact-picker">
				<div v-for="contact in quickContacts" :key="contact.id" class="picker-item" @click="pickContact(contact)">
					<div class="avatar small" :style="{ backgroundColor: contact.color }">
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
			newSMS: {
				recipient: '',
				content: '',
			},
			conversations: [
				{
					id: 1,
					name: '张三',
					phone: '138-0000-0001',
					color: '#409eff',
					time: '10:30',
					lastMessage: '好的，明天见！',
					unread: 2,
				},
				{
					id: 2,
					name: '李四',
					phone: '138-0000-0002',
					color: '#67c23a',
					time: '昨天',
					lastMessage: '收到，谢谢',
					unread: 0,
				},
				{
					id: 3,
					name: '王五',
					phone: '138-0000-0003',
					color: '#e6a23c',
					time: '周一',
					lastMessage: '会议时间确定了吗？',
					unread: 1,
				},
				{
					id: 4,
					name: '10086',
					phone: '10086',
					color: '#909399',
					time: '周日',
					lastMessage: '尊敬的客户，您本月流量已使用80%...',
					unread: 0,
				},
				{
					id: 5,
					name: '银行通知',
					phone: '95588',
					color: '#f56c6c',
					time: '上周',
					lastMessage: '您的账户于12月15日消费￥128.00',
					unread: 0,
				},
			],
			messagesData: {
				1: [
					{ id: 1, text: '你好，明天有空吗？', sent: false, time: '10:25' },
					{ id: 2, text: '有空的，什么事？', sent: true, time: '10:26' },
					{ id: 3, text: '想约你一起吃饭，聊聊项目的事情', sent: false, time: '10:28' },
					{ id: 4, text: '可以啊，什么时间？', sent: true, time: '10:29' },
					{ id: 5, text: '好的，明天见！', sent: false, time: '10:30' },
				],
				2: [
					{ id: 1, text: '项目文档已发送到你邮箱', sent: true, time: '昨天 14:30' },
					{ id: 2, text: '收到，谢谢', sent: false, time: '昨天 14:35' },
				],
				3: [
					{ id: 1, text: '会议时间确定了吗？', sent: false, time: '周一 09:00' },
					{ id: 2, text: '还在协调中，稍后通知你', sent: true, time: '周一 09:15' },
				],
				4: [
					{ id: 1, text: '尊敬的客户，您本月流量已使用80%，剩余流量2GB，如需办理流量包请回复1。', sent: false, time: '周日 10:00' },
				],
				5: [
					{ id: 1, text: '您的账户于12月15日消费￥128.00，余额￥3,456.78。', sent: false, time: '上周五 18:30' },
				],
			},
			quickContacts: [
				{ id: 1, name: '张三', phone: '138-0000-0001', color: '#409eff' },
				{ id: 2, name: '李四', phone: '138-0000-0002', color: '#67c23a' },
				{ id: 3, name: '王五', phone: '138-0000-0003', color: '#e6a23c' },
				{ id: 4, name: '赵六', phone: '138-0000-0004', color: '#f56c6c' },
			],
		};
	},
	computed: {
		filteredConversations() {
			if (!this.searchQuery) return this.conversations;
			return this.conversations.filter(
				(c) => c.name.includes(this.searchQuery) || c.phone.includes(this.searchQuery) || c.lastMessage.includes(this.searchQuery)
			);
		},
		currentMessages() {
			if (!this.selectedConversation) return [];
			return this.messagesData[this.selectedConversation.id] || [];
		},
	},
	methods: {
		selectConversation(conv) {
			this.selectedConversation = conv;
			conv.unread = 0;
			this.$nextTick(() => {
				if (this.$refs.messagesRef) {
					this.$refs.messagesRef.scrollTop = this.$refs.messagesRef.scrollHeight;
				}
			});
		},
		sendMessage() {
			if (!this.newMessage.trim()) return;
			const time = getCurrentTime();
			const convId = this.selectedConversation.id;
			if (!this.messagesData[convId]) {
				this.messagesData[convId] = [];
			}
			this.messagesData[convId].push({
				id: Date.now(),
				text: this.newMessage,
				sent: true,
				time,
			});
			this.selectedConversation.lastMessage = this.newMessage;
			this.selectedConversation.time = time;
			this.newMessage = '';
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
			this.newSMS.recipient = contact.phone;
			this.showContactPicker = false;
		},
		sendNewSMS() {
			if (!this.newSMS.recipient || !this.newSMS.content) {
				this.$message.warning('请填写收件人和内容');
				return;
			}
			const time = getCurrentTime();
			const newConv = {
				id: Date.now(),
				name: this.newSMS.recipient,
				phone: this.newSMS.recipient,
				color: getRandomColor(),
				time,
				lastMessage: this.newSMS.content,
				unread: 0,
			};
			this.conversations.unshift(newConv);
			this.messagesData[newConv.id] = [
				{
					id: Date.now(),
					text: this.newSMS.content,
					sent: true,
					time,
				},
			];
			this.newSMS = { recipient: '', content: '' };
			this.showNewSMS = false;
			this.$message.success('短信发送成功');
		},
	},
};
</script>

<style scoped>
.sms-app {
	height: 100%;
	display: flex;
	background-color: #1a1a1a;
	color: #fff;
}

.conversation-list {
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

.conversations {
	flex: 1;
	overflow-y: auto;
}

.conversation-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	cursor: pointer;
	transition: background-color 0.2s;
	position: relative;
}

.conversation-item:hover {
	background-color: #2a2a2a;
}

.conversation-item.active {
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

.conv-info {
	flex: 1;
	overflow: hidden;
}

.conv-top {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.name {
	font-size: 14px;
	font-weight: 500;
}

.time {
	font-size: 12px;
	color: #909399;
}

.preview {
	font-size: 12px;
	color: #909399;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}

.unread-badge {
	position: absolute;
	right: 12px;
	top: 50%;
	transform: translateY(-50%);
	background-color: #409eff;
	color: #fff;
	font-size: 10px;
	padding: 2px 6px;
	border-radius: 10px;
	min-width: 18px;
	text-align: center;
}

.message-area {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.empty-message {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #606266;
	gap: 16px;
}

.message-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid #333;
	background-color: #252525;
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

.header-info .name {
	font-size: 14px;
	font-weight: 500;
}

.header-info .phone {
	font-size: 12px;
	color: #909399;
}

.header-actions {
	display: flex;
	gap: 4px;
}

.action-btn {
	color: #909399 !important;
}

.action-btn:hover {
	color: #409eff !important;
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
	background-color: #409eff;
	border-bottom-right-radius: 4px;
}

.message.received .message-bubble {
	background-color: #333;
	border-bottom-left-radius: 4px;
}

.message-bubble .text {
	font-size: 14px;
	line-height: 1.4;
	display: block;
}

.message-bubble .msg-time {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.6);
	display: block;
	text-align: right;
	margin-top: 4px;
}

.input-area {
	display: flex;
	align-items: flex-end;
	gap: 8px;
	padding: 12px 16px;
	border-top: 1px solid #333;
	background-color: #252525;
}

.attach-btn {
	color: #909399 !important;
}

.msg-input {
	flex: 1;
}

.msg-input :deep(.el-textarea__inner) {
	background-color: #1a1a1a;
	border-color: #333;
	color: #fff;
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
