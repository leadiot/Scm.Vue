<template>
	<sc-dialog v-model="visible" show-fullscreen :title="titleMap[mode]" width="520px" @close="close">
		<el-form ref="formRef" label-width="100px" :model="formData" :rules="rules">
			<el-form-item label="系统代码" prop="codes">
				<el-input v-model="formData.codes" clearable :maxlength="32" placeholder="请输入系统代码" show-word-limit />
			</el-form-item>
			<el-form-item label="编码" prop="codec">
				<el-input v-model="formData.codec" clearable :maxlength="32" placeholder="请输入编码" show-word-limit />
			</el-form-item>
			<el-form-item label="系统简称" prop="names">
				<el-input v-model="formData.names" clearable :maxlength="32" placeholder="请输入系统简称" show-word-limit />
			</el-form-item>
			<el-form-item label="系统全称" prop="namec">
				<el-input v-model="formData.namec" clearable :maxlength="128" placeholder="请输入系统全称" show-word-limit />
			</el-form-item>
			<el-form-item label="条码" prop="barcode">
				<el-input v-model="formData.barcode" clearable :maxlength="32" placeholder="请输入条码" show-word-limit />
			</el-form-item>
			<el-form-item label="备注" prop="remark">
				<el-input v-model="formData.remark" :autosize="{ minRows: 2, maxRows: 4 }" :maxlength="500"
					placeholder="请输入备注" show-word-limit type="textarea" />
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
	emits: ['complete'],
	data() {
		return {
			mode: "add",
			titleMap: { add: "新增", edit: "编辑" },
			visible: false,
			isSaveing: false,
			formData: {
				id: this.$SCM.DEF_ID,
				codes: '',
				codec: '',
				names: '',
				namec: '',
				barcode: '',
				remark: ''
			},
			rules: {
				codes: [
					{ required: true, trigger: "blur", message: "系统代码不能为空", },
				],
				names: [
					{ required: true, trigger: "blur", message: "系统简称不能为空", }
				],
			},
		};
	},
	methods: {
		async open(row) {
			if (!row || !row.id) {
				this.mode = "add";
			} else {
				this.mode = "edit";
				var res = await this.$API.samplestemperature.view.get(row.id);
				this.formData = res.data || {};
			}
			this.visible = true;
		},
		save() {
			this.$refs.formRef.validate(async (valid) => {
				if (valid) {
					this.isSaveing = true;
					let res = null;
					if (this.$SCM.is_valid_id(this.formData.id)) {
						res = await this.$API.samplestemperature.save.put(this.formData);
					} else {
						res = await this.$API.samplestemperature.add.post(this.formData);
					}
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
			this.formData = {
				id: this.$SCM.DEF_ID,
				codes: '',
				codec: '',
				names: '',
				namec: '',
				barcode: '',
				remark: ''
			};
			this.$refs.formRef.resetFields();
			this.visible = false;
		},
	},
};
</script>
