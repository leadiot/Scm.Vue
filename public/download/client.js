window.downloads = {
	"platforms": [
		{ "id": 1, "code": "server", "name": "桌面端应用", "visible": false },
		{ "id": 2, "code": "desktop", "name": "桌面端应用", "visible": false },
		{ "id": 3, "code": "mobile", "name": "移动端应用", "visible": false },
		{ "id": 4, "code": "browser", "name": "网页端应用", "visible": false },
		{ "id": 5, "code": "quickapp", "name": "小程序应用", "visible": false }
	],
	"downloads": [
		{ "id": "server", "client": 10, "platform": "server", "method": "file", "available": true, "visible": true, "name": "Server", "badge": "推荐", "version": "1.0.0", "desc": "适用于多平台", "url": "/download/scm.net.zip", "size": "100MB" },
		{ "id": "window", "client": 20, "platform": "desktop", "method": "file", "available": true, "visible": true, "name": "Windows", "badge": "推荐", "version": "1.0.0", "desc": "适用于Windows 10及以上版本", "url": "/download/app_v1.0.0.zip", "size": "100MB" },
		{ "id": "macos", "client": 30, "platform": "desktop", "method": "appstore", "available": false, "visible": true, "name": "MacOS", "badge": "推荐", "version": "1.0.0", "desc": "适用于macOS 10.15及以上版本", "url": "/download/app_v1.0.0.zip", "size": "100MB" },
		{ "id": "linux", "client": 40, "platform": "desktop", "method": "qrcode", "available": false, "visible": true, "name": "Linux", "badge": "推荐", "version": "1.0.0", "desc": "适用于大多数Linux发行版", "url": "/download/app_v1.0.0.zip", "size": "100MB" },
		{ "id": "android", "client": 50, "platform": "mobile", "method": "file", "available": true, "visible": true, "name": "Android", "version": "1.3.5", "desc": "适用于Android 5.0及以上版本", "url": "/download/app_v1.0.0.zip" },
		{ "id": "ios", "client": 60, "platform": "mobile", "method": "appstore", "available": false, "visible": true, "name": "iOS", "desc": "适用于iOS 11及以上版本", "url": "/download/app_v1.0.0.zip" },
		{ "id": "harmony", "client": 70, "platform": "mobile", "method": "file", "available": false, "visible": true, "name": "鸿蒙", "desc": "适用于鸿蒙系统", "url": "/download/app_v1.0.0.zip" },
		{ "id": "chrome", "client": 11, "name": "Google Chrome", "desc": "适用于Google Chrome 80及以上版本", "url": "/download/app_v1.0.0.zip" },
		{ "id": "edge", "client": 12, "name": "Microsoft Edge", "desc": "适用于Microsoft Edge 80及以上版本", "url": "/download/app_v1.0.0.zip" },
		{ "id": "firefox", "client": 13, "name": "Mozilla Firefox", "desc": "适用于Mozilla Firefox 78及以上版本", "url": "/download/app_v1.0.0.zip" },
		{ "id": "wechat", "client": 81, "name": "微信小程序", "desc": "适用于微信小程序", "url": "/download/app_v1.0.0.zip" },
		{ "id": "alipay", "client": 82, "name": "支付宝小程序", "desc": "适用于支付宝小程序", "url": "/download/app_v1.0.0.zip" }
	]
};
