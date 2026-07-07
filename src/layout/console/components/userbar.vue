<template>
	<div class="user-bar">
		<div :title="$t('console.orgInfo')">
			<label>{{ unitName }}</label>
		</div>
		<el-divider direction="vertical"></el-divider>
		<div class="panel-item hidden-sm-and-down" @click="search" :title="$t('console.searchTitle')">
			<sc-icon name="sc-search" />
		</div>
		<div class="screen panel-item hidden-sm-and-down" @click="screen" :title="$t('console.fullscreen')">
			<sc-icon name="sc-fullscreen" />
		</div>
		<div class="tasks panel-item" @click="tasks" :title="$t('console.taskCenter')">
			<sc-icon name="sc-sorting-vertical" />
		</div>
		<div class="msg panel-item" @click="showMsg" :title="$t('console.newMessage')">
			<el-badge :hidden="msgList.length == 0" :value="msgList.length" class="badge" type="danger">
				<sc-icon name="sc-message-2-line" />
			</el-badge>
		</div>
		<div class="panel-item" @click="openSetting" :title="$t('console.themeSettings')">
			<sc-icon name="sc-settings-3-line" />
		</div>
		<el-divider direction="vertical"></el-divider>
		<el-dropdown class="user panel-item" trigger="click" @command="handleUser">
			<div class="user-avatar">
				<el-avatar :size="30" :src="avatar" :fit="fit" v-if="show_avatar"></el-avatar>
				<el-avatar :size="30" v-else>{{ userNameF }}</el-avatar>
				<label>{{ userName }}</label>
				<el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="uc">{{ $t('console.accountInfo') }}</el-dropdown-item>
					<el-dropdown-item command="clearCache">{{ $t('console.clearCache') }}</el-dropdown-item>
					<el-dropdown-item divided command="outLogin">{{ $t('console.logout') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>

	<el-dialog v-model="searchVisible" :width="700" :title="$t('console.searchTitle')" center append-to-body destroy-on-close>
		<search @success="searchVisible = false"></search>
	</el-dialog>

	<el-drawer v-model="tasksVisible" :size="450" :title="$t('console.taskCenter')" append-to-body destroy-on-close>
		<tasks></tasks>
	</el-drawer>

	<el-drawer :title="$t('console.newMessage')" v-model="msgVisible" :size="400" append-to-body destroy-on-close>
		<el-container>
			<el-main class="nopadding">
				<el-scrollbar>
					<ul class="msg-list">
						<li v-for="item in msgList" v-bind:key="item.id">
							<a :href="item.link" target="_blank">
								<div class="msg-list__icon">
									<el-badge is-dot type="danger">
										<el-avatar :size="40" :src="item.avatar"></el-avatar>
									</el-badge>
								</div>
								<div class="msg-list__main">
									<h2>{{ item.title }}</h2>
									<p>{{ item.remark }}</p>
								</div>
								<div class="msg-list__time">
									<p>{{ getTime(item.create_time) }}</p>
								</div>
							</a>
						</li>
						<el-empty v-if="msgList.length == 0" :description="$t('console.noNewMessage')" :image-size="100"></el-empty>
					</ul>
				</el-scrollbar>
			</el-main>
			<el-footer>
				<el-button type="primary" @click="goMessage">{{ $t('console.messageCenter') }}</el-button>
				<el-button @click="markRead">{{ $t('console.markAllRead') }}</el-button>
			</el-footer>
		</el-container>
	</el-drawer>

	<el-drawer v-model="settingVisible" :size="400" :title="$t('console.themeSettings')" append-to-body destroy-on-close>
		<setting></setting>
	</el-drawer>
</template>

<script>
import socket from "@/utils/socket"
import search from "./search.vue";
import tasks from "./tasks.vue";
import setting from "./setting.vue";

export default {
	components: {
		search,
		tasks,
		setting,
	},
	data() {
		return {
			userName: '',
			userNameF: '',
			unitName: '',
			avatar: '',
			fit: 'cover',
			show_avatar: true,
			searchVisible: false,
			tasksVisible: false,
			settingVisible: false,
			msgQty: 0,
			msgVisible: false,
			msgList: [],
		};
	},
	created() {
		var userInfo = this.$TOOL.session.get("USER_INFO");
		if (!userInfo || !userInfo.userName) {
			this.$router.replace({ path: "/login" });
			return;
		}

		this.userName = userInfo.userName;
		this.userNameF = this.userName.substring(0, 1);
		this.unitName = userInfo.unitName;
		this.avatar = this.$SCM.get_avatar(userInfo.avatar);
		this.show_avatar = this.avatar != null && this.avatar != '';
		this.init();
		this.listMsg();
	},
	methods: {
		async init() {
			socket.open_wss("ReceiveMessage", (res) => {
				if (!res || !res.success) {
					return;
				}

				this.listMsg();
			});
		},
		async listMsg() {
			const res = await this.$API.scmmsgmessage.page.get({
				page: 1,
				limit: 10,
				cat: 'msg12'
			});
			if (!res || res.code != 200) {
				return;
			}

			this.msgList = res.data.items;
			this.msgQty = this.msgList.length;
		},
		//个人信息
		handleUser(command) {
			if (command == "uc") {
				this.$router.push({ path: "/profiles/usercenter" });
			}
			if (command == "cmd") {
				this.$router.push({ path: "/cmd" });
			}
			if (command == "clearCache") {
				this.$confirm(
					this.$t('console.clearCacheConfirm'),
					this.$t('common.info'),
					{ type: "info", })
					.then(() => {
						const loading = this.$loading();
						this.$TOOL.data.clear();
						this.$router.replace({ path: "/login" });
						setTimeout(() => {
							loading.close();
							location.reload();
						}, 1000);
					})
					.catch(() => {
						//取消
					});
			}
			if (command == "outLogin") {
				this.$confirm(this.$t('console.logoutConfirm'), this.$t('common.info'), {
					type: "warning",
					confirmButtonText: this.$t('console.logoutButton'),
					confirmButtonClass: "el-button--danger",
				})
					.then(() => {
						this.$router.replace({ path: "/login" });
					})
					.catch(() => {
						//取消退出
					});
			}
		},
		//全屏
		screen() {
			var element = document.documentElement;
			this.$TOOL.screen(element);
		},
		//显示短消息
		showMsg() {
			this.listMsg();
			this.msgVisible = true;
		},
		getTime(time) {
			return this.$TOOL.dateTimeFormat(time);
		},
		//标记已读
		async markRead() {
			let ids = [];
			this.msgList.forEach((item) => {
				ids.push(item.id);
			});
			const res = await this.$API.scmmsgmessage.read.put(ids);
			if (res.code == 200) {
				this.$message.success(this.$t('console.operationSuccess'));
				this.msgList = [];
			} else {
				this.$message.warning(res.message);
			}
		},
		goMessage() {
			this.$router.push({ path: "/msg/message" });
		},
		//搜索
		search() {
			this.searchVisible = true;
		},
		//任务
		tasks() {
			this.tasksVisible = true;
		},
		//主题设置
		openSetting() {
			this.settingVisible = true;
		},
	},
};
</script>

<style scoped>
.user-bar {
	display: flex;
	align-items: center;
	height: 100%;
}

.user-bar .panel-item {
	padding: 0 10px;
	cursor: pointer;
	height: 100%;
	display: flex;
	align-items: center;
}

.user-bar .panel-item i {
	font-size: 16px;
}

.user-bar .panel-item:hover {
	background: rgba(0, 0, 0, 0.1);
}

.user-bar .user-avatar {
	height: 49px;
	display: flex;
	align-items: center;
}

.user-bar .user-avatar label {
	display: inline-block;
	margin-left: 5px;
	font-size: 12px;
	cursor: pointer;
}

.msg-list li {
	border-top: 1px solid #eee;
}

.msg-list li a {
	display: flex;
	padding: 20px;
}

.msg-list li a:hover {
	background: var(--el-color-primary-light-9);
}

.msg-list__icon {
	width: 40px;
	margin-right: 15px;
}

.msg-list__main {
	flex: 1;
}

.msg-list__main h2 {
	font-size: 15px;
	font-weight: normal;
	color: var(--el-text-color-primary);
}

.msg-list__main p {
	font-size: 12px;
	color: var(--el-text-color-secondary);
	line-height: 1.8;
	margin-top: 5px;
}

.msg-list__time {
	width: 100px;
	text-align: right;
	color: var(--el-text-color-secondary);
}

.dark .msg-list__main h2 {
	color: var(--el-text-color-regular);
}

.dark .msg-list li {
	border-top: 1px solid var(--el-border-color);
}

.dark .msg-list li a:hover {
	background: var(--el-bg-color-base);
}

.ver-alert {
	color: red;
}
</style>
