<template>
	<el-drawer v-model="visible" :title="title" :size="600" destroy-on-close>
		<el-form ref="formRef" label-width="140px" :model="formData">
			<el-form-item label="代码" prop="code">
				<el-input v-model="formData.code" readonly></el-input>
			</el-form-item>
			<el-form-item label="OSP" prop="osp_id">
				<el-input v-model="formData.osp_id" readonly></el-input>
			</el-form-item>
			<el-form-item label="OAuth" prop="oauth_id">
				<el-input v-model="formData.oauth_id" readonly></el-input>
			</el-form-item>
			<el-form-item label="登录用户" prop="user">
				<el-input v-model="formData.user" readonly></el-input>
			</el-form-item>
			<el-form-item label="显示名称" prop="name">
				<el-input v-model="formData.name" readonly></el-input>
			</el-form-item>
			<el-form-item label="头像" prop="avatar">
				<el-input v-model="formData.avatar" readonly></el-input>
			</el-form-item>
			<el-form-item label="电话号码" prop="phone">
				<el-input v-model="formData.phone" readonly></el-input>
			</el-form-item>
			<el-form-item label="电子邮件" prop="email">
				<el-input v-model="formData.email" readonly></el-input>
			</el-form-item>
			<el-form-item label="登录频次" prop="qty">
				<el-input v-model="formData.qty" readonly></el-input>
			</el-form-item>
			<el-form-item label="Access Token" prop="access_token">
				<el-input v-model="formData.access_token" readonly></el-input>
			</el-form-item>
			<el-form-item label="Access Expires" prop="access_expires">
				<el-input v-model="formData.access_expires" readonly></el-input>
			</el-form-item>
			<el-form-item label="Refresh Token" prop="refresh_token">
				<el-input v-model="formData.refresh_token" readonly></el-input>
			</el-form-item>
			<el-form-item label="Refresh Expires" prop="refresh_expires">
				<el-input v-model="formData.refresh_expires" readonly></el-input>
			</el-form-item>

		</el-form>
	</el-drawer>
</template>
<script>
export default {
	data() {
		return {
			title: "详情",
			visible: false,
			isSaveing: false,
			formData: this.def_data()
		};
	},
	mounted() {
	},
	methods: {
		def_data() {
			return {
				id: 0,
				code: '',
				osp_id: '',
				oauth_id: '',
				user: '',
				name: '',
				avatar: '',
				phone: '',
				email: '',
				qty: '',
				access_token: '',
				access_expires: '',
				refresh_token: '',
				refresh_expires: '',
			}
		},
		async open(row) {
			var res = await this.$API.iamoidcdetail.edit.get(row.id);
			this.formData = res.data;
			this.visible = true;
		},
		save() {
			this.$refs.formRef.validate(async (valid) => {
				if (valid) {
					this.isSaveing = true;
					let res = null;
					if (this.formData.id === 0) {
						res = await this.$API.iamoidcdetail.add.post(this.formData);
					} else {
						res = await this.$API.iamoidcdetail.update.put(this.formData);
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
			this.formData = this.def_data();
			this.$refs.formRef.resetFields();
			this.visible = false;
		},
	},
};
</script>

<style scoped>
.el-select {
	width: 100%;
}
</style>