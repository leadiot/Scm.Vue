<template>
	<div class="app-container app-light">
		<div class="app-toolbar">
			<span class="app-header-title">设备</span>
			<span class="device-count">{{ devices.length }} 台设备</span>
			<div class="header-spacer"></div>
			<el-button type="primary" size="small" @click="editVisible = true">
				<sc-icon name="ms-add" style="margin-right: 4px;" />
				添加设备
			</el-button>
		</div>

		<div v-if="devices.length === 0" class="app-empty">
			<sc-icon name="ms-devices" :size="64" />
			<p>暂无设备</p>
			<p class="hint">点击上方按钮添加设备</p>
		</div>

		<div v-else class="device-list">
			<div v-for="device in devices" :key="device.id" class="device-item">
				<div class="device-icon" :style="{ backgroundColor: getDeviceColor(device.types) }">
					<sc-icon :name="device.icon" :size="24" />
				</div>
				<div class="device-info" @click="showDevice(device)">
					<div class="device-name">{{ device.names }}</div>
					<div class="device-meta">
						<span class="device-type">{{ getDeviceTypeName(device.types) }}</span>
						<span class="device-model">{{ device.model }}</span>
					</div>
				</div>
				<div class="device-binded" :class="{ binded: device.binded }">
					<span class="status-dot"></span>
					<span class="status-text">{{ device.binded === 2 ? '已绑定' : '未绑定' }}</span>
				</div>
				<div class="device-actions">
					<el-button text size="small" @click="editDevice(device)">
						<sc-icon name="ms-edit" :size="16" />
					</el-button>
					<el-button text size="small" @click="deleteDevice(device)">
						<sc-icon name="ms-delete" :size="16" />
					</el-button>
				</div>
			</div>
		</div>

		<sc-dialog v-model="editVisible" :title="deviceForm ? '编辑设备' : '添加设备'" width="400px" destroy-on-close
			@closed="resetForm">
			<el-form ref="formRef" :model="deviceForm" :rules="rules" label-width="80px" label-position="right">
				<el-form-item label="设备名称" prop="namec">
					<el-input v-model="deviceForm.namec" placeholder="请输入设备名称" maxlength="32" show-word-limit
						clearable />
				</el-form-item>

				<el-form-item label="设备类型" prop="types">
					<el-select v-model="deviceForm.types" placeholder="请选择设备类型" style="width: 100%;">
						<el-option v-for="type in types_list" :key="type.value" :label="type.label" :value="type.value">
							<div class="type-option">
								<sc-icon :name="type.icon" :size="18" />
								<span>{{ type.label }}</span>
							</div>
						</el-option>
					</el-select>
				</el-form-item>

				<el-form-item label="备注" prop="remark">
					<el-input v-model="deviceForm.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="256"
						show-word-limit clearable />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button @click="editVisible = false">取消</el-button>
				<el-button type="primary" @click="saveDevice">确定</el-button>
			</template>
		</sc-dialog>

		<sc-dialog v-model="infoVisible" title="设备详情" width="670px" destroy-on-close @close="resetForm">
			<el-row>
				<el-col :span="12">
					<div style="text-align: center;">
						<scQrcode ref="qrcode" :text="qrCode" :size="200"></scQrcode>
					</div>
				</el-col>
				<el-col :span="12">
					<el-form ref="formRef" label-width="100px" :model="deviceForm">
						<el-form-item label="终端名称" prop="names">
							<el-input v-model="deviceForm.names" readonly />
						</el-form-item>
						<el-form-item label="服务地址" prop="url">
							<el-input v-model="deviceForm.url" readonly />
						</el-form-item>
						<el-form-item label="终端代码" prop="codes">
							<el-input v-model="deviceForm.codes" readonly />
						</el-form-item>
						<el-form-item label="终端口令" prop="pass">
							<el-input v-model="deviceForm.pass" readonly />
						</el-form-item>
					</el-form>
				</el-col>
			</el-row>

			<template #footer>
				<el-button type="primary" @click="infoVisible = false">确 定</el-button>
			</template>
		</sc-dialog>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import scQrcode from '@/components/scQrcode';

const DEVICE_COLORS = {
	'10': '#409eff',
	'20': '#67c23a',
	'30': '#e6a23c',
	'40': '#f56c6c',
	'50': '#909399',
	'other': '#00bcd4',
};

export default {
	name: 'Device',
	components: {
		scIcon,
		scQrcode,
	},
	data() {
		return {
			devices: [],
			editVisible: false,
			infoVisible: false,
			deviceForm: this.def_data(),
			rules: {
				types: [
					{ required: true, trigger: "change", message: "请选择终端类型", pattern: this.$SCM.REGEX_INT },
				],
				namec: [
					{ required: true, trigger: "blur", message: "终端名称不能为空" },
					{ required: true, trigger: "blur", message: "终端名称应4至64个字符", pattern: this.$SCM.REGEX_NAMEC },
				],
			},
			types_list: [this.$SCM.OPTION_ALL],
			// types_list: [
			// 	{ value: 'phone', label: '手机', icon: 'ms-smartphone' },
			// 	{ value: 'tablet', label: '平板', icon: 'ms-tablet' },
			// 	{ value: 'laptop', label: '笔记本', icon: 'ms-laptop' },
			// 	{ value: 'desktop', label: '台式机', icon: 'ms-computer' },
			// 	{ value: 'watch', label: '智能手表', icon: 'ms-watch' },
			// 	{ value: 'other', label: '其他', icon: 'ms-devices' },
			// ],
		};
	},
	mounted() {
		this.$SCM.list_dic(this.types_list, 'client_type', false);
		this.loadDevices();
	},
	methods: {
		def_data() {
			return {
				id: this.$SCM.DEF_ID,
				types: this.$SCM.ID_ONE_INT,
				namec: '',
				remark: '',
			}
		},
		async loadDevices() {
			var res = await this.$API.scmurterminal.list.get();
			if (res.code === 200) {
				this.devices = res.data || [];
			}
		},
		getDeviceColor(types) {
			return DEVICE_COLORS[types] || DEVICE_COLORS.other;
		},
		getDeviceTypeName(types) {
			return this.$SCM.get_dic_names(this.types_list, types, '其它');
		},
		showDevice(device) {
			this.infoVisible = true;
			this.title = '设备详情';
			this.deviceForm = device;
			this.deviceForm.url = this.$CONFIG.SERVER_URL;
			if (!this.deviceForm.url) {
				this.deviceForm.url = window.location.host;
			}
			this.visible = true;
			this.qrCode = this.deviceForm.url + ';' + this.deviceForm.codes + ';' + this.deviceForm.pass;
		},
		async editDevice(device) {
			this.deviceForm = device;
			var res = await this.$API.scmurterminal.edit.get(device.id);
			if (res && res.code === 200) {
				this.deviceForm = res.data || {};
			} else {
				this.deviceForm = this.def_data();
			}
			this.editVisible = true;
		},
		deleteDevice(row) {
			this.$confirm('确定要删除此设备吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}).then(async () => {
				await this.$API.scmurterminal.delete.delete(row.id);
				this.loadDevices();
				this.$message.success('删除成功');
			}).catch(() => { });
		},
		saveDevice() {
			this.$refs.formRef.validate(async (valid) => {
				if (!valid) {
					return;
				}

				this.isSaveing = true;
				let res = null;
				if (this.$SCM.is_valid_id(this.deviceForm.id)) {
					res = await this.$API.scmurterminal.update.put(this.deviceForm);
				} else {
					res = await this.$API.scmurterminal.add.post(this.deviceForm);
				}
				this.isSaveing = false;

				if (res.code == 200) {
					this.loadDevices();
					this.editVisible = false;
					this.$message.success("保存成功");
				} else {
					this.$alert(res.message, "提示", { type: "error" });
				}
			});

			this.editVisible = false;
			// this.deviceForm = null;
		},
		resetForm() {
			this.deviceForm = this.def_data();
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.header-spacer {
	flex: 1;
}

.device-count {
	font-size: 13px;
	color: var(--color-text-tertiary);
}

.device-list {
	flex: 1;
	overflow-y: auto;
	padding: 12px;
}

.device-item {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 16px;
	background-color: var(--color-bg);
	border-radius: 8px;
	margin-bottom: 12px;
	border: 1px solid var(--color-border);
	transition: all 0.2s;
}

.device-item:hover {
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.device-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	flex-shrink: 0;
}

.device-info {
	flex: 1;
	overflow: hidden;
	cursor: pointer;
}

.device-name {
	font-size: 15px;
	font-weight: 500;
	color: var(--color-text);
	margin-bottom: 4px;
}

.device-meta {
	display: flex;
	gap: 12px;
	font-size: 13px;
	color: var(--color-text-tertiary);
}

.device-type {
	color: var(--color-primary);
}

.device-binded {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 12px;
	background-color: var(--color-bg-hover);
	color: var(--color-text-tertiary);
}

.device-binded.binded {
	background-color: rgba(103, 194, 58, 0.1);
	color: var(--color-success);
}

.status-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: currentColor;
}

.device-actions {
	display: flex;
	gap: 4px;
	opacity: 0;
	transition: opacity 0.2s;
}

.device-item:hover .device-actions {
	opacity: 1;
}

.type-option {
	display: flex;
	align-items: center;
	gap: 8px;
}

.app-empty {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: var(--color-empty);
}

.app-empty p {
	margin-top: 16px;
	font-size: 14px;
}

.app-empty .hint {
	font-size: 12px;
	color: var(--color-empty-hint);
}
</style>
