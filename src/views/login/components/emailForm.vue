<template>
	<el-form ref="loginForm" :model="form" :rules="rules" label-width="0" size="large">
		<el-form-item prop="email">
			<el-input v-model="form.email" prefix-icon="el-icon-message" clearable
				:placeholder="$t('login.emailPlaceholder')">
			</el-input>
		</el-form-item>
		<el-form-item prop="code" style="margin-bottom: 35px;">
			<div class="login-msg-yzm">
				<el-input v-model="form.code" prefix-icon="el-icon-unlock" clearable
					:placeholder="$t('login.msgPlaceholder')"></el-input>
				<el-button @click="getYzm" :disabled="disabled">
					{{ $t('login.msgGet') }}<span v-if="disabled">({{ time }})</span>
				</el-button>
			</div>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" style="width: 100%;" :loading="islogin" round @click="login">
				{{ $t('login.signIn') }}
			</el-button>
		</el-form-item>
		<div class="login-reg" v-if="userRegister">
			{{ $t('login.noAccount') }} <router-link to="/user_register">{{ $t('login.createAccount') }}</router-link>
		</div>
	</el-form>
</template>

<script>
import i18n from "@/locales";

export default {
	emits: ['complete'],
	data() {
		return {
			form: {
				mode: 22,
				unit: this.$CONFIG.DEF_LOGIN_UNIT,
				email: '',
				code: '',
				key: '',
				req: '',
				auto: true
			},
			rules: {
				email: [{ required: true, message: i18n.global.t('login.emailError') }],
				code: [{ required: true, message: i18n.global.t('login.msgError') }]
			},
			disabled: false,
			time: 0,
			islogin: false,
			userRegister: this.$CONFIG.USER_REGISTER_ENABLED,
		}
	},
	mounted() {
		this.init();
	},
	methods: {
		init() {
			var req = this.$SCM.read_cache('scm_login_email', '');
			if (!req) {
				req = this.$TOOL.uuid();
			}
			this.form.req = req;
		},
		async getYzm() {
			this.form.key = '';

			var validate = await this.$refs.loginForm.validateField("email").catch(() => { })
			if (!validate) { return false }

			this.$message.success(i18n.global.t('login.msgSent'))
			this.disabled = true
			this.time = 60
			var t = setInterval(() => {
				this.time -= 1
				if (this.time < 1) {
					clearInterval(t)
					this.disabled = false
					this.time = 0
				}
			}, 1000);

			var data = {
				mode: this.form.mode,
				code: this.form.email,
				req: this.form.req,
			};
			var userRes = await this.$API.operator.sendOtp.post(data);
			if (userRes.code != 200) {
				this.$message.warning(userRes.message);
				return false;
			}
			data = userRes.data;
			if (!data.success) {
				{
					this.$message.warning(data.message);
					return false;
				}
			}
			this.form.key = data.key;
		},
		async login() {
			var validate = await this.$refs.loginForm.validate().catch(() => { })
			if (!validate) { return false }

			if (!this.form.key || this.form.key.length != 32) {
				this.$message.warning('请先获取验证码！');
				return false;
			}

			this.islogin = true;
			this.checkAuth();
			this.islogin = false;
		},
		async checkAuth() {
			var userRes = await this.$API.operator.signIn.post(this.form);
			if (userRes.code != 200) {
				this.$message.warning(userRes.message);
				return false;
			}
			var data = userRes.data;
			if (!data.success) {
				this.$message.warning(data.message);
				return false;
			}

			this.$SCM.save_cache('scm_login_pone', '');
			this.$TOOL.session.set("TOKEN", userRes.data.accessToken);
			this.$TOOL.session.set("USER_INFO", userRes.data.userInfo);
			this.$TOOL.session.set("USER_THEME", userRes.data.userTheme);

			this.$emit('complete');
		}
	}
}
</script>
