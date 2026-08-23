<template>
	<el-row :gutter="40">
		<el-col v-if="form.id == '0'">
			<el-empty description="请选择左侧菜单后操作" :image-size="100"></el-empty>
		</el-col>
		<template v-else>
			<el-col :lg="12">
				<h2>{{ form.namec || "新增菜单" }}</h2>
				<el-form ref="dialogForm" :model="form" :rules="rules" label-width="80px" label-position="left">
					<el-form-item label="终端类型" prop="client">
						<sc-select v-model="form.client" placeholder="请选择终端类型" :data="client_list" />
					</el-form-item>
					<el-form-item label="菜单类型" prop="types">
						<el-radio-group v-model="form.types">
							<el-radio-button :value="1">菜单</el-radio-button>
							<el-radio-button :value="2">Iframe</el-radio-button>
							<el-radio-button :value="3">外链</el-radio-button>
							<el-radio-button :value="4">按钮</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="显示名称" prop="namec">
						<el-input v-model="form.namec" clearable placeholder="菜单显示名字"></el-input>
					</el-form-item>
					<el-form-item label="菜单编码" prop="codec">
						<el-input v-model="form.codec" clearable placeholder="菜单编码"></el-input>
						<div class="el-form-item-msg">
							系统唯一且与内置组件名一致，否则导致缓存失效。如类型为Iframe的菜单，编码将代替源地址显示在地址栏
						</div>
					</el-form-item>
					<el-form-item label="路由地址" prop="uri">
						<el-input v-model="form.uri" clearable placeholder=""></el-input>
					</el-form-item>
					<el-form-item label="重定向" prop="redirect">
						<el-input v-model="form.redirect" clearable placeholder=""></el-input>
					</el-form-item>
					<el-form-item label="菜单高亮" prop="active">
						<el-input v-model="form.active" clearable placeholder=""></el-input>
						<div class="el-form-item-msg">
							子节点或详情页需要高亮的上级菜单路由地址
						</div>
					</el-form-item>
					<el-form-item label="视图地址" prop="view">
						<el-input v-model="form.view" clearable placeholder="">
							<template #prepend>views/</template>
						</el-input>
						<div class="el-form-item-msg">
							如父节点、链接或Iframe等没有视图的菜单不需要填写
						</div>
					</el-form-item>
					<el-form-item label="菜单图标">
						<sc-icon-select v-model="form.icon" clearable></sc-icon-select>
					</el-form-item>
					<el-form-item label="字体颜色" prop="color">
						<el-color-picker v-model="form.color" :predefine="predefineColors"></el-color-picker>
					</el-form-item>
					<el-form-item label="是否显示">
						<el-radio-group v-model="form.visible">
							<el-radio :value="true">显示</el-radio>
							<el-radio :value="false">隐藏</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							菜单不显示在导航中，但用户依然可以访问
						</div>
					</el-form-item>
					<el-form-item label="是否全屏">
						<el-radio-group v-model="form.fullpage">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							一般配合功能列表中详细使用，以及不在资源中显示
						</div>
					</el-form-item>
					<el-form-item label="是否缓存">
						<el-radio-group v-model="form.keep_alive">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							启用缓存后，在进行页签切换时，页面不会刷新
						</div>
					</el-form-item>
					<el-form-item label="应用类型" prop="layout">
						<el-radio-group v-model="form.layout">
							<el-radio-button :value="1">工作台</el-radio-button>
							<el-radio-button :value="2">云桌面</el-radio-button>
							<el-radio-button :value="3">大屏幕</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item label="窗口宽度" v-if="form.layout == 2">
						<el-input v-model="form.width" clearable placeholder="0">
							<template #append>px</template>
						</el-input>
						<div class="el-form-item-msg">
							窗口默认显示的宽度，单位px，为0表示不限制
						</div>
					</el-form-item>
					<el-form-item label="窗口高度" v-if="form.layout == 2">
						<el-input v-model="form.height" clearable placeholder="0">
							<template #append>px</template>
						</el-input>
						<div class="el-form-item-msg">
							窗口默认显示的高度，单位px，为0表示不限制
						</div>
					</el-form-item>
					<el-form-item label="调整大小" v-if="form.layout == 2">
						<el-radio-group v-model="form.resizable">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							是否可以调整窗口大小，默认是
						</div>
					</el-form-item>
					<el-form-item label="窗口居中" v-if="form.layout == 2">
						<el-radio-group v-model="form.center">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							是否窗口居中显示，默认是
						</div>
					</el-form-item>
					<el-form-item label="显示在桌面" v-if="form.layout == 2">
						<el-radio-group v-model="form.show_in_desktop">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							是否显示在桌面，默认是
						</div>
					</el-form-item>
					<el-form-item label="显示在任务栏" v-if="form.layout == 2">
						<el-radio-group v-model="form.show_in_taskbar">
							<el-radio :value="true">是</el-radio>
							<el-radio :value="false">否</el-radio>
						</el-radio-group>
						<div class="el-form-item-msg">
							是否显示在任务栏，默认是
						</div>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" :loading="loading" @click="save">
							保 存
						</el-button>
					</el-form-item>
				</el-form>
			</el-col>
			<el-col :lg="12" class="apilist">
				<h2>接口权限</h2>
				<sc-dynamic-table v-model="form.api" :addTemplate="apiListAddTemplate" placeholder="暂无匹配接口权限">
					<el-table-column prop="codec" label="标识" width="150">
						<template #default="scope">
							<el-input v-model="scope.row.codec" placeholder="请输入内容"></el-input>
						</template>
					</el-table-column>
					<el-table-column prop="method" label="请求类型" width="130">
						<template #default="scope">
							<el-select v-model="scope.row.method">
								<el-option v-for="item in methodType" :key="item" :label="item" :value="item" />
							</el-select>
						</template>
					</el-table-column>
					<el-table-column prop="url" label="Api url">
						<template #default="scope">
							<el-input v-model="scope.row.url" placeholder="请输入内容"></el-input>
						</template>
					</el-table-column>
				</sc-dynamic-table>
			</el-col>
		</template>
	</el-row>
</template>

<script>
import scIconSelect from "@/components/scIconSelect";
import scDynamicTable from "@/components/scDynamicTable";

export default {
	components: {
		scIconSelect,
		scDynamicTable,
	},
	props: {
		menu: { type: Array, default: () => [] },
	},
	data() {
		return {
			form: this.def_data(),
			client_list: [this.$SCM.OPTION_ONE_INT],
			rules: {
				client: [
					{ required: true, trigger: "change", message: "请选择终端类型", pattern: this.$SCM.REGEX_INT },
				],
				types: [
					{ required: true, trigger: "change", type: 'number', min: 1, message: "菜单类型不能为空" },
				],
				namec: [
					{ required: true, trigger: "blur", message: "请输入菜单名称" },
				],
				codec: [
					{ required: true, trigger: "blur", message: "请输入权限标识" },
				],
				uri: [
					{ required: true, trigger: "blur", message: "请输入路由地址" },
				],
			},
			predefineColors: this.$CONFIG.PREDEFINE_COLORS,
			apiListAddTemplate: {
				codec: "",
				method: "",
				url: "",
			},
			methodType: ["GET", "POST", "PUT", "DELETE"],
			loading: false,
		};
	},
	mounted() {
		this.$SCM.list_dic(this.client_list, 'client_type', false);
	},
	methods: {
		def_data() {
			return {
				id: "0",
				client: this.$SCM.ID_ONE_INT,
				types: 1,
				namec: "",
				codec: "",
				uri: "",
				view: "",
				redirect: "",
				icon: "",
				active: "",
				color: "",
				visible: true,
				fullpage: false,
				keep_alive: true,
				layout: 1,
				width: 0,
				height: 0,
				resizable: true,
				center: false,
				show_in_desktop: true,
				show_in_taskbar: true,
				api: [],
			}
		},
		//保存
		async save() {
			this.loading = true;
			var res = await this.$API.scmdevmenu.update.put(this.form);
			this.loading = false;
			if (res.code == 200) {
				this.$emit("complete");
				this.$message.success("保存成功");
			} else {
				this.$message.warning(res.message);
			}
		},
		handleIcon(item) {
			this.form.icon = item;
		},
		//表单注入数据
		async setData(data) {
			const res = await this.$API.scmdevmenu.model.get(data.id);
			if (res.data) {
				if (!res.data.icon) {
					res.data.icon = "";
				}
				this.form = res.data;
			} else {
				this.form.id = 0;
			}
		},
	},
};
</script>

<style scoped>
h2 {
	font-size: 17px;
	color: #3c4a54;
	padding: 0 0 30px 0;
}

.apilist {
	border-left: 1px solid #eee;
}

[data-theme="dark"] h2 {
	color: #fff;
}

[data-theme="dark"] .apilist {
	border-color: #434343;
}
</style>
