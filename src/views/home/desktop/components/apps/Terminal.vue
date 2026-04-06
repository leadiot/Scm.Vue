<template>
	<div class="terminal-app">
		<div class="terminal-output" ref="output">
			<div v-for="(line, index) in output" :key="index" class="output-line">
				{{ line }}
			</div>
		</div>
		<div class="terminal-input">
			<span class="prompt">C:\Users\User&gt;</span>
			<input
				v-model="command"
				@keyup.enter="executeCommand"
				placeholder="输入命令..."
				ref="input"
			/>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Terminal',
	data() {
		return {
			command: '',
			output: [
				'Microsoft Windows [版本 10.0.19045]',
				'(c) Microsoft Corporation。保留所有权利。',
				'',
			],
		};
	},
	methods: {
		executeCommand() {
			if (this.command.trim()) {
				this.output.push(`C:\\Users\\User> ${this.command}`);

				const cmd = this.command.toLowerCase().trim();
				if (cmd === 'cls' || cmd === 'clear') {
					this.output = [];
				} else if (cmd === 'help') {
					this.output.push('可用命令:');
					this.output.push('  help - 显示帮助信息');
					this.output.push('  cls  - 清空屏幕');
					this.output.push('  date - 显示当前日期');
					this.output.push('  time - 显示当前时间');
					this.output.push('  echo - 显示消息');
				} else if (cmd === 'date') {
					this.output.push(new Date().toLocaleDateString('zh-CN'));
				} else if (cmd === 'time') {
					this.output.push(new Date().toLocaleTimeString('zh-CN'));
				} else if (cmd.startsWith('echo ')) {
					this.output.push(this.command.substring(5));
				} else {
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

.terminal-output {
	flex: 1;
	padding: 10px;
	overflow-y: auto;
}

.output-line {
	white-space: pre-wrap;
	word-break: break-all;
	line-height: 1.4;
}

.terminal-input {
	display: flex;
	align-items: center;
	padding: 10px;
	border-top: 1px solid #333;
}

.prompt {
	color: #00ff00;
	margin-right: 8px;
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
	color: #666;
}
</style>
