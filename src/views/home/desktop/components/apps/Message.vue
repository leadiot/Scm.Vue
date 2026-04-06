<template>
	<div class="message-app">
		<div class="contact-list">
			<div
				v-for="contact in contacts"
				:key="contact.id"
				class="contact-item"
				:class="{ active: selectedContact === contact.id }"
				@click="selectContact(contact.id)"
			>
				<div class="avatar">{{ contact.name.charAt(0) }}</div>
				<div class="contact-info">
					<span class="name">{{ contact.name }}</span>
					<span class="last-message">{{ contact.lastMessage }}</span>
				</div>
			</div>
		</div>
		<div class="chat-area">
			<div class="chat-header">
				<span>{{ currentContact?.name || '选择联系人' }}</span>
			</div>
			<div class="messages">
				<div
					v-for="msg in messages"
					:key="msg.id"
					class="message"
					:class="{ sent: msg.sent }"
				>
					{{ msg.text }}
				</div>
			</div>
			<div class="input-area">
				<el-input
					v-model="newMessage"
					placeholder="输入消息..."
					@keyup.enter="sendMessage"
				/>
				<el-button type="primary" @click="sendMessage">发送</el-button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Message',
	data() {
		return {
			selectedContact: 1,
			newMessage: '',
			contacts: [
				{ id: 1, name: '张三', lastMessage: '你好！' },
				{ id: 2, name: '李四', lastMessage: '明天见' },
				{ id: 3, name: '王五', lastMessage: '收到' },
			],
			messages: [
				{ id: 1, text: '你好！', sent: false },
				{ id: 2, text: '你好，有什么事吗？', sent: true },
				{ id: 3, text: '想约你明天一起吃饭', sent: false },
			],
		};
	},
	computed: {
		currentContact() {
			return this.contacts.find((c) => c.id === this.selectedContact);
		},
	},
	methods: {
		selectContact(id) {
			this.selectedContact = id;
		},
		sendMessage() {
			if (this.newMessage.trim()) {
				this.messages.push({
					id: this.messages.length + 1,
					text: this.newMessage,
					sent: true,
				});
				this.newMessage = '';
			}
		},
	},
};
</script>

<style scoped>
.message-app {
	height: 100%;
	display: flex;
}

.contact-list {
	width: 250px;
	border-right: 1px solid #e0e0e0;
	overflow-y: auto;
}

.contact-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 15px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.contact-item:hover {
	background-color: #f5f5f5;
}

.contact-item.active {
	background-color: #e8f4ff;
}

.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #409eff;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: bold;
}

.contact-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.name {
	font-size: 14px;
	font-weight: 500;
	color: #333;
}

.last-message {
	font-size: 12px;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 150px;
}

.chat-area {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.chat-header {
	padding: 15px;
	border-bottom: 1px solid #e0e0e0;
	font-weight: 500;
	color: #333;
}

.messages {
	flex: 1;
	padding: 15px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.message {
	max-width: 70%;
	padding: 10px 15px;
	border-radius: 8px;
	background-color: #f5f5f5;
	color: #333;
}

.message.sent {
	align-self: flex-end;
	background-color: #409eff;
	color: #fff;
}

.input-area {
	display: flex;
	gap: 10px;
	padding: 15px;
	border-top: 1px solid #e0e0e0;
}
</style>
