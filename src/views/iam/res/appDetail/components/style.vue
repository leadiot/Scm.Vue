<template>
	<el-row :gutter="12">
		<el-col :span="12">
			<el-card shadow="never" header="语言主题">
				<el-form ref="form" label-width="120px" style="margin-top:20px;">
					<el-form-item label="显示宽度">
						<el-input-number v-model="formData.width" :min="200" :max="1024"></el-input-number>
					</el-form-item>
					<el-form-item label="框架布局">
						<el-select v-model="formData.layout" placeholder="请选择">
							<el-option label="默认" value="0"></el-option>
							<el-option label="登录-授权" value="1"></el-option>
							<el-option label="授权-登录" value="2"></el-option>
						</el-select>
					</el-form-item>
					<el-divider></el-divider>
					<el-form-item label="显示徽标">
						<el-switch v-model="formData.logo_visible"></el-switch>
					</el-form-item>
					<el-form-item label="显示标题">
						<el-switch v-model="formData.title_visible"></el-switch>
					</el-form-item>
					<el-form-item label="显示登录">
						<el-switch v-model="formData.login_visible"></el-switch>
					</el-form-item>
					<el-form-item label="显示授权">
						<el-switch v-model="formData.oauth_visible"></el-switch>
					</el-form-item>
					<el-divider></el-divider>
					<el-form-item label="背景颜色">
						<el-color-picker v-model="formData.back_color" :predefine="color_list">></el-color-picker>
					</el-form-item>
					<el-form-item label="背景图片">
						<el-input v-model="formData.back_image" :predefine="color_list">></el-input>
					</el-form-item>
					<el-form-item label="文本颜色">
						<el-color-picker v-model="formData.fore_color" :predefine="color_list">></el-color-picker>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="save()">保存</el-button>
					</el-form-item>
				</el-form>
			</el-card>
		</el-col>
		<el-col :span="12">
			<el-card shadow="never" header="效果预览">
				<div class="center"
					:style="{ 'backgroundColor': formData.back_color, 'backgroundImage': formData.back_image }">
					<el-card :style="{ 'width': formData.width + 'px', 'height': formData.height }">
						<div style="display: flex;flex-direction: column;align-items: center;">
							<div style="width: 100%;" v-if="formData.logo_visible">
								<el-skeleton style="--el-skeleton-circle-size: 48px">
									<template #template>
										<div class="center">
											<el-skeleton-item variant="circle" />
										</div>
									</template>
								</el-skeleton>
							</div>
							<div style="width: 100%;" v-if="formData.title_visible">
								<el-skeleton style="margin-top: 1rem;">
									<template #template>
										<div class="center">
											<el-skeleton-item variant="text" style="width: 50%;height: 1.5rem;" />
										</div>
									</template>
								</el-skeleton>
							</div>
							<div style="width: 100%;" v-if="formData.login_visible">
								<el-divider>用户登录</el-divider>
								<el-skeleton></el-skeleton>
							</div>
							<div style="width: 100%;" v-if="formData.oauth_visible">
								<el-divider>三方授权</el-divider>
								<el-skeleton></el-skeleton>
							</div>
						</div>
					</el-card>
				</div>
			</el-card>
		</el-col>
	</el-row>
</template>

<script>
export default {
	props: {
		app: { type: Object, default: () => ({}) }
	},
	data() {
		return {
			formData: this.def_data(),
			layout_list: [],
			color_list: this.$CONFIG.PREDEFINE_COLORS,
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		def_data() {
			return {
				id: this.$SCM.DEF_ID,
				width: 320,
				height: 120,
				layout: '0',
				logo_visible: true,
				title_visible: true,
				login_title: '用户登录',
				login_visible: true,
				oauth_title: '三方授权',
				oauth_visible: true,
				back_color: '',
				back_image: '',
				fore_color: '#000000'
			};
		},
		async init() {
			var styleRes = await this.$API.iamresappstyle.edit.get(this.app.id);
			if (!styleRes || styleRes.code != 200) {
				return;
			}

			this.formData = styleRes.data;
			if (!this.formData) {
				this.formData = this.def_data();
				this.formData.id = this.app.id;
			}
		},
		async save() {
			var res = await this.$API.iamresappstyle.save.post(this.formData);
			if (res.code == 200) {
				this.$message.success("保存成功");
				this.visible = false;
			} else {
				this.$alert(res.message, "提示", { type: "error" });
			}
		},
	},
}
</script>
<style>
.center {
	display: flex;
	align-items: center;
	flex-direction: column;
}
</style>