//业务配置
//会合并至this.$CONFIG
//生产模式 public/config.js 同名key会覆盖这里的配置从而实现打包后的热更新
//为避免和SCUI框架配置混淆建议添加前缀 MY_
//全局可使用 this.$CONFIG.MY_KEY 访问

export default {
	//是否显示第三方授权登录
	MY_SHOW_LOGIN_OAUTH: false,

	//AI模型配置
	MY_AI_MODELS: [
		{
			name: "Kimi-K3",
			model: "moonshot-v1-k3",
			apiKey: "sk-EYrdk4NTlxqoGDCPpTRTdCDYZwBNCmZ4KTM06OXloDq3WHay",
			baseUrl: "https://api.moonshot.cn/v1",
			description: "Kimi大模型K3版本，支持长文本处理",
			maxTokens: 2048,
			temperature: 0.7
		}
	]
};
