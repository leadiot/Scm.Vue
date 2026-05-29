<template>
	<el-container class="page-user">
		<el-aside style="width: 240px">
			<el-container>
				<el-header style="height: auto; display: block">
					<div class="user-info-top">
						<el-avatar :size="70" :src="$SCM.get_avatar(header.avatar)"></el-avatar>
						<h2>{{ header.app_name }}</h2>
						<el-link :href="preview" target="_blank">预览</el-link>
					</div>
				</el-header>
				<el-main class="nopadding">
					<el-menu class="menu" :default-active="page">
						<el-menu-item-group v-for="group in menu" :key="group.groupName" :title="group.groupName">
							<el-menu-item v-for="item in group.list" :key="item.component" :index="item.component"
								@click="openPage">
								<sc-icon v-if="item.icon" :name="item.icon" />
								<template #title>
									<span>{{ item.title }}</span>
								</template>
							</el-menu-item>
						</el-menu-item-group>
					</el-menu>
				</el-main>
			</el-container>
		</el-aside>
		<el-main>
			<Suspense>
				<template #default>
					<component :is="page" :app="header" />
				</template>
				<template #fallback>
					<el-skeleton :rows="3" />
				</template>
			</Suspense>
		</el-main>
	</el-container>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
	components: {
		ucHtml: defineAsyncComponent(() => import("./components/html")),
		ucJs: defineAsyncComponent(() => import("./components/js")),
		ucLib: defineAsyncComponent(() => import("./components/lib")),
		ucStyle: defineAsyncComponent(() => import("./components/style")),
		ucOsp: defineAsyncComponent(() => import("./components/osp")),
	},
	data() {
		return {
			menu: [
				{
					groupName: "代码",
					list: [
						{
							icon: "sc-settings-3-line",
							title: "Html代码",
							component: "ucHtml",
						},
						{
							icon: "sc-profile-line",
							title: "Javascript代码",
							component: "ucJs",
						},
						{
							icon: "sc-pass-pending-line",
							title: "三方类库",
							component: "ucLib",
						},
					],
				},
				{
					groupName: "配置",
					list: [
						{
							icon: "sc-alarm-clock-line",
							title: "样式配置",
							component: "ucStyle",
						},
						{
							icon: "sc-database-2-line",
							title: "服务列表",
							component: "ucOsp",
						},
					],
				},
			],
			header: {},
			page: "ucHtml",
			template: '',
			preview: '',
		};
	},
	//路由跳转进来 判断from是否有特殊标识做特殊处理
	beforeRouteEnter(to, from, next) {
		next((vm) => {
			if (from.is) {
				//删除特殊标识，防止标签刷新重复执行
				delete from.is;
				//执行特殊方法
				vm.$alert("路由跳转过来后含有特殊标识，做特殊处理", "提示", {
					type: "success",
					center: true,
				})
					.then(() => { })
					.catch(() => { });
			}
		});
	},
	mounted() {
		this.init();
	},
	methods: {
		async init() {
			var id = this.$route.query.id;
			if (!id) {
				return;
			}

			var res = await this.$API.iamresappheader.view.get(id);
			if (!res || !res.data) {
				return;
			}
			this.header = res.data;

			if (!this.template) {
				this.template = await this.$SCM.list_cfg('oidc_web_login', '', true);
			}

			var url = this.template || this.$CONFIG.OIDC_LOGIN;
			url = url.replaceAll('{key}', this.header.app_key);
			url = url.replaceAll('{state}', 'preview');
			this.preview = url;
		},
		openPage(item) {
			this.page = item.index;
		}
	},
};
</script>
