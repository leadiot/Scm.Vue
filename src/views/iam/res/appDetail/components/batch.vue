<template>
	<sc-dialog v-model="visible" show-fullscreen destroy-on-close :title="title" width="450px">
		<el-checkbox v-model="checkedAll" @change="selectAll">全选</el-checkbox>
		<sc-list :data="list" :showCheckbox="true" style="height: 400px;">
		</sc-list>

		<template #footer>
			<el-button @click="close">取 消</el-button>
			<el-button :loading="isSaveing" type="primary" @click="save">
				确 定
			</el-button>
		</template>
	</sc-dialog>
</template>
<script>
export default {
	data() {
		return {
			title: '服务列表',
			list: [],
			data: {
				id: this.$SCM.DEF_ID,
				ids: []
			},
			visible: false,
			checkedAll: false,
			isSaveing: false,
		};
	},
	mounted() {
	},
	methods: {
		async open(id) {
			this.data.id = id;
			var res = await this.$API.iamsysosp.list.get();
			if (!res || res.code != 200) {
				return;
			}

			this.list = res.data || [];
			res.data.forEach(item => {
				item.icon = this.getImage(item.icon);
				item.label = item.name;
				item.value = item.code;
			});
			this.visible = true;
		},
		async save() {
			this.data.ids = this.list.filter(item => item.checked).map(item => item.id);
			if (this.data.ids.length > 0) {
				this.isSaveing = true;
				let res = await this.$API.iamresappdetail.batch.post(this.data);
				this.isSaveing = false;
				if (res.code != 200) {
					this.$alert(res.message, "提示", { type: "error" });
					return;
				}
			}

			this.$emit("complete");
			this.visible = false;
			this.$message.success("保存成功");
		},
		close() {
			this.visible = false;
			this.data.ids = [];
		},
		openItem(row) {
			row.checked = !row.checked;
		},
		getImage(icon) {
			return this.$CONFIG.OIDC_LOGO + 'osp/' + icon;
		},
		selectAll() {
			this.list.forEach(item => {
				item.checked = this.checkedAll;
			});
		}
	},
};
</script>