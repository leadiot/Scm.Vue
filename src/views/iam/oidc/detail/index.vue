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
				<template #row_status="scope">
					<el-tooltip :content="scope.row.row_status ? '正常' : '停用'" placement="right">
						<el-switch v-model="scope.row.row_status" :active-value="1" :inactive-value="2"
							@change="status_item($event, scope.row)">
						</el-switch>
					</el-tooltip>
				</template>
			</sc-table>
		</el-main>
		<info ref="info"></info>
	</el-container>
</template>
<script>
import { defineAsyncComponent } from "vue";
export default {
	components: {
		info: defineAsyncComponent(() => import("./info")),
	},
	data() {
		return {
			tableName: 'iam_oidc',
			apiObj: this.$API.iamoidcdetail.page,
			param: {
				app_id: this.$SCM.ID_ALL,
				row_status: this.$SCM.DEF_STATUS,
				create_time: '',
				key: ''
			},
			selection: [],
			column: [
				{ label: "id", prop: "id", hide: true },
				{ prop: 'code', label: 'OidcID', width: 100 },
				{ prop: 'osp_name', label: '服务名称', width: 100 },
				{ prop: 'oauth_id', label: 'OAuthID', width: 100 },
				{ prop: 'user', label: '登录用户', width: 100 },
				{ prop: 'name', label: '显示名称', width: 100 },
				{ prop: 'qty', label: '登录频次', width: 100 },
				{ prop: "row_status", label: "数据状态", width: "80", },
				{ prop: "update_names", label: "更新人员", width: "100", },
				{ prop: "update_times", label: "更新时间", width: "160" },
				{ prop: "create_names", label: "创建人员", width: "100", },
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
			this.$SCM.status_item(this, this.$API.iamoidcdetail.status, row, row.row_status);
		},
		status_list(status) {
			this.$SCM.status_list(this, this.$API.iamoidcdetail.status, this.selection, status);
		},
		async delete_item(row) {
			this.$SCM.delete_item(this, this.$API.iamoidcdetail.delete, row);
		},
		delete_list() {
			this.$SCM.delete_list(this, this.$API.iamoidcdetail.delete, this.selection);
		},
		open_dialog(row) {
			this.$refs.info.open(row);
		},
		selectionChange(selection) {
			this.selection = selection;
		},
	},
};
</script>
