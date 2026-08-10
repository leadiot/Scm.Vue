
/* 常用加解密 */
import CryptoJS from "crypto-js";

/*
 * ⚠️ 技术债说明（2026-08）
 * - MD5 用于 request.js 请求签名（appkey+timestamp+signature），与后端协议绑定，无法单方面更换。
 * - AES 使用 ECB 模式（相同明文产生相同密文，安全性低于 GCM），因后端解密逻辑约束暂无法迁移。
 * - 如未来后端协议升级，建议一并迁移到 Web Crypto API（SHA-256 + AES-GCM），并移除 crypto-js 依赖。
 * - Web Crypto API 不直接支持 MD5 和 ECB，故当前无法替换。
 */

export default {
	//MD5加密
	MD5(data) {
		return CryptoJS.MD5(data).toString();
	},
	SHA(data) {
		return CryptoJS.SHA256(data).toString();
	},
	//BASE64加解密
	BASE64: {
		encrypt(data) {
			return btoa(unescape(encodeURIComponent(data)));
		},
		decrypt(cipher) {
			return decodeURIComponent(escape(atob(cipher)));
		},
	},
	AES_SECRETKEY: "dd0308a654ea42eab695bf060241b5aa",
	//AES加解密
	AES: {
		encrypt(data, secretKey) {
			const result = CryptoJS.AES.encrypt(
				data,
				CryptoJS.enc.Utf8.parse(secretKey),
				{
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7,
				}
			);
			return result.toString();
		},
		decrypt(cipher, secretKey) {
			const result = CryptoJS.AES.decrypt(
				cipher,
				CryptoJS.enc.Utf8.parse(secretKey),
				{
					mode: CryptoJS.mode.ECB,
					padding: CryptoJS.pad.Pkcs7,
				}
			);
			return CryptoJS.enc.Utf8.stringify(result);
		},
	},
};
