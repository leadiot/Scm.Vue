<template>
	<div class="terminal-app">
		<div class="app-header">
			<div class="header-left">
				<sc-icon name="ms-terminal" :size="18" />
				<span class="app-title">终端</span>
			</div>
			<div class="header-actions">
				<el-button text class="action-btn" @click="clearTerminal" title="清空">
					<sc-icon name="ms-delete_sweep" :size="18" />
				</el-button>
			</div>
		</div>
		<div class="terminal-output" ref="output">
			<div v-for="(line, index) in output" :key="index" class="output-line"
				:class="{ 'is-command': line.startsWith('C:\\') }">
				{{ line }}
			</div>
		</div>
		<div class="terminal-input">
			<span class="prompt">
				<sc-icon name="ms-chevron_right" :size="16" />
			</span>
			<input v-model="command" @keyup.enter="executeCommand" @keyup.up="historyUp" @keyup.down="historyDown"
				placeholder="输入命令..." ref="input" />
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Terminal',
	components: {
		scIcon,
	},
	data() {
		return {
			command: '',
			output: [
				'Microsoft Windows [版本 10.0.19045]',
				'(c) Microsoft Corporation。保留所有权利。',
				'',
			],
			history: [],
			historyIndex: -1,
		};
	},
	methods: {
		executeCommand() {
			if (this.command.trim()) {
				this.history.push(this.command);
				this.historyIndex = this.history.length;

				this.output.push(`C:\\Users\\User> ${this.command}`);

				const cmd = this.command.toLowerCase().trim();
				const args = cmd.split(' ');
				const mainCmd = args[0];

				switch (mainCmd) {
					case 'cls':
					case 'clear':
						this.output = [];
						break;
					case 'help':
						this.showHelp();
						break;
					case 'date':
						this.output.push(new Date().toLocaleDateString('zh-CN'));
						break;
					case 'time':
						this.output.push(new Date().toLocaleTimeString('zh-CN'));
						break;
					case 'echo':
						this.output.push(this.command.substring(5));
						break;
					case 'whoami':
						this.output.push('User');
						break;
					case 'hostname':
						this.output.push('DESKTOP-WIN11');
						break;
					case 'dir':
					case 'ls':
						this.showDirectory();
						break;
					case 'ver':
						this.output.push('Microsoft Windows [版本 10.0.19045]');
						break;
					case 'color':
						this.output.push('设置终端颜色功能暂未实现');
						break;
					case 'ipconfig':
						this.showIpConfig();
						break;
					default:
						this.output.push(`'${this.command}' 不是内部或外部命令，也不是可运行的程序或批处理文件。`);
				}

				this.output.push('');
				this.command = '';

				this.$nextTick(() => {
					if (this.$refs.output) {
						this.$refs.output.scrollTop = this.$refs.output.scrollHeight;
					}
				});
			}
		},
		showHelp() {
			this.output.push('可用命令:');
			this.output.push('  help      - 显示帮助信息');
			this.output.push('  cls/clear - 清空屏幕');
			this.output.push('  date      - 显示当前日期');
			this.output.push('  time      - 显示当前时间');
			this.output.push('  echo      - 显示消息');
			this.output.push('  whoami    - 显示当前用户');
			this.output.push('  hostname  - 显示主机名');
			this.output.push('  dir/ls    - 显示目录内容');
			this.output.push('  ver       - 显示系统版本');
			this.output.push('  ipconfig  - 显示网络配置');
		},
		showDirectory() {
			this.output.push(' 驱动器 C 中的卷没有标签。');
			this.output.push(' 卷的序列号是 XXXX-XXXX');
			this.output.push('');
			this.output.push(' C:\\Users\\User 的目录');
			this.output.push('');
			this.output.push('2024/01/15  10:30    <DIR>          Desktop');
			this.output.push('2024/01/15  10:30    <DIR>          Documents');
			this.output.push('2024/01/15  10:30    <DIR>          Downloads');
			this.output.push('2024/01/15  10:30    <DIR>          Pictures');
			this.output.push('               0 个文件              0 字节');
			this.output.push('               4 个目录');
		},
		showIpConfig() {
			this.output.push('Windows IP 配置');
			this.output.push('');
			this.output.push('以太网适配器 以太网:');
			this.output.push('   连接特定的 DNS 后缀 . . . . . . . :');
			this.output.push('   本地链接 IPv6 地址. . . . . . . . : fe80::xxxx:xxxx:xxxx:xxxx');
			this.output.push('   IPv4 地址 . . . . . . . . . . . . : 192.168.1.100');
			this.output.push('   子网掩码  . . . . . . . . . . . . : 255.255.255.0');
			this.output.push('   默认网关. . . . . . . . . . . . . : 192.168.1.1');
		},
		clearTerminal() {
			this.output = [];
		},
		historyUp() {
			if (this.historyIndex > 0) {
				this.historyIndex--;
				this.command = this.history[this.historyIndex];
			}
		},
		historyDown() {
			if (this.historyIndex < this.history.length - 1) {
				this.historyIndex++;
				this.command = this.history[this.historyIndex];
			} else {
				this.historyIndex = this.history.length;
				this.command = '';
			}
		},
	},
	mounted() {
		this.$refs.input?.focus();
	},
};
</script>

<style scoped>
.terminal-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #0c0c0c;
	color: #cccccc;
	font-family: 'Consolas', 'Courier New', monospace;
	font-size: 14px;
}

.app-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 16px;
	background-color: #1a1a1a;
	border-bottom: 1px solid #333;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
}

.app-title {
	font-size: 13px;
	font-weight: 500;
}

.action-btn {
	color: #888 !important;
	padding: 4px !important;
}

.action-btn:hover {
	color: #fff !important;
	background-color: #333 !important;
}

.terminal-output {
	flex: 1;
	padding: 12px;
	overflow-y: auto;
}

.output-line {
	white-space: pre-wrap;
	word-break: break-all;
	line-height: 1.5;
}

.output-line.is-command {
	color: #ffff00;
}

.terminal-input {
	display: flex;
	align-items: center;
	padding: 12px;
	border-top: 1px solid #333;
	background-color: #0a0a0a;
}

.prompt {
	color: #00ff00;
	margin-right: 8px;
	display: flex;
	align-items: center;
}

.terminal-input input {
	flex: 1;
	background: transparent;
	border: none;
	color: #cccccc;
	font-family: inherit;
	font-size: inherit;
	outline: none;
}

.terminal-input input::placeholder {
	color: #555;
}

.terminal-output::-webkit-scrollbar {
	width: 8px;
}

.terminal-output::-webkit-scrollbar-track {
	background: #1a1a1a;
}

.terminal-output::-webkit-scrollbar-thumb {
	background: #333;
	border-radius: 4px;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
	background: #444;
}
</style>
