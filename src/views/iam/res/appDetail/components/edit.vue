<template>
	<sc-dialog v-model="visible" show-fullscreen destroy-on-close :title="title" width="450px" @close="close">
		<el-form ref="formRef" label-width="100px" :model="formData" :rules="rules">
			<el-form-item label="服务名称" prop="osp_name">
				<el-input v-model="formData.osp_name" placeholder="请输入服务名称" :maxlength="64" show-word-limit
					clearable></el-input>
			</el-form-item>
			<el-form-item label="排序依据" prop="od">
				<el-input-number v-model="formData.od" :min="0"></el-input-number>
			</el-form-item>
		</el-form>

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
			title: "编辑",
			visible: false,
			isSaveing: false,
			formData: this.def_data(),
			rules: {
				osp_name: [
					{ required: true, trigger: "blur", message: "服务名称不能为空" },
				]
			}
		};
	},
	mounted() {
	},
	methods: {
		def_data() {
			return {
				id: 0,
				osp_name: '',
				od: 0
			}
		},
		async open(row) {
			if (!row || !row.id) {
				return;
			}

			var res = await this.$API.iamresappdetail.edit.get(row.id);
			this.formData = res.data;
			this.visible = true;
		},
		save() {
			this.$refs.formRef.validate(async (valid) => {
				if (valid) {
					this.isSaveing = true;
					let res = await this.$API.iamresappdetail.update.put(this.formData);

					this.isSaveing = false;
					if (res.code == 200) {
						this.$emit("complete");
						this.visible = false;
						this.$message.success("保存成功");
					} else {
						this.$alert(res.message, "提示", { type: "error" });
					}
				}
			});
		},
		close() {
			this.formData = this.def_data();
			this.$refs.formRef.resetFields();
			this.visible = false;
		},
	},
};
</script>