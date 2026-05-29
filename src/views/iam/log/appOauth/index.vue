<template>
	<el-container>
		<el-header>
			<div class="left-panel">
				<sc-select v-model="param.app_id" placeholder="请选择" :data="app_list" @change="search()"
					style="width: 200px;" />
			</div>
		</el-header>
		<el-main class="nopadding">
			<sc-table ref="table" :table-name="tableName" :api-obj="apiObj" :column="column" row-key="id"
				@menu-handle="menuHandle" @selection-change="selectionChange">
				<el-table-column align="center" fixed type="selection" width="60" />
				<el-table-column label="#" type="index" width="50"></el-table-column>
				<el-table-column label="操作" align="center" fixed="right" width="80">
					<template #default="scope">
						<el-button text type="primary" size="small" @click="open_dialog(scope.row)">
							详情
						</el-button>
					</template>
				</el-table-column>
			</sc-table>
		</el-main>
		<el-drawer v-model="infoDrawer" title="日志详情" :size="600" destroy-on-close>
			<info ref="info"></info>
		</el-drawer>
		<edit ref="edit" @complete="complete" />
	</el-container>
</template>
<script>
import { defineAsyncComponent } from "vue";
export default {
	components: {
		edit: defineAsyncComponent(() => import("./edit")),
	},
	data() {
		return {
			tableName: "iam_log_oauth",
			apiObj: this.$API.iamlogappoauth.page,
			param: {
				app_id: this.$SCM.ID_ALL,
				row_status: this.$SCM.DEF_STATUS,
				create_time: '',
				key: ''
			},
			selection: [],
			column: [
				{ label: "id", prop: "id", hide: true },
				{ prop: 'oidc_code', label: '联合代码', width: 100 },
				{ prop: 'app_name', label: '应用名称', width: 100 },
				{ prop: 'osp_name', label: '登录网站', width: 100 },
				{ prop: 'oauth_id', label: 'OauthID', width: 100 },
				{ prop: 'user', label: '用户', width: 100 },
				{ prop: 'name', label: '昵称', width: 100 },
				{ prop: 'err_code', label: '错误代码', width: 100, align: 'left' },
				{ prop: 'err_msg', label: '错误描述', minWidth: 100, align: 'left' },
				{ prop: 'qty', label: '登录次数', width: 100 },
				// { prop: "update_names", label: "更新人员", width: "100", },
				{ prop: "update_times", label: "更新时间", width: "160" },
				// { prop: "create_names", label: "创建人员", width: "100", },
				{ prop: "create_times", label: "创建时间", width: "160" },
			],
			row_status_list: [this.$SCM.OPTION_ALL_INT],
			app_list: [this.$SCM.OPTION_ALL],
		};
	},
	mounted() {
		this.$SCM.list_option(this.app_list, this.$API.iamresappheader.option, {}, true);
	},
	methods: {
		complete() {
			this.$refs.table.refresh();
		},
		search() {
			this.$refs.table.upData(this.param);
		},
		async status_item(e, row) {
			this.$SCM.status_item(this, this.$API.iamlogappoauth.status, row, row.row_status);
		},
		status_list(status) {
			this.$SCM.status_list(this, this.$API.iamlogappoauth.status, this.selection, status);
		},
		async delete_item(row) {
			this.$SCM.delete_item(this, this.$API.iamlogappoauth.delete, row);
		},
		delete_list() {
			this.$SCM.delete_list(this, this.$API.iamlogappoauth.delete, this.selection);
		},
		open_dialog(row) {
			this.$refs.edit.open(row);
		},
		selectionChange(selection) {
			this.selection = selection;
		},
		menuHandle(obj) {
			if (obj.command == "add") {
				this.open_dialog();
				return;
			}
			if (obj.command == "edit") {
				this.open_dialog(obj.row);
				return;
			}
			if (obj.command == "delete") {
				this.delete_item(obj.row);
				return;
			}
		}
	},
};
</script>
