<template>
	<div class="calculator-app">
		<div class="app-header">
			<span class="app-title">计算器</span>
		</div>
		<div class="display">
			<div class="expression">{{ expression || '0' }}</div>
			<div class="result">{{ result }}</div>
		</div>
		<div class="buttons">
			<button @click="clear" class="btn function" tooltip="清除">
				<sc-icon name="ms-clear_all" :size="22" />
			</button>
			<button @click="backspace" class="btn function" tooltip="删除">
				<sc-icon name="ms-backspace" :size="22" />
			</button>
			<button @click="inputOperator('%')" class="btn function" tooltip="百分比">%</button>
			<button @click="inputOperator('/')" class="btn operator" tooltip="除法">/</button>

			<button @click="inputNumber('7')" class="btn">7</button>
			<button @click="inputNumber('8')" class="btn">8</button>
			<button @click="inputNumber('9')" class="btn">9</button>
			<button @click="inputOperator('*')" class="btn operator" tooltip="乘法">*</button>

			<button @click="inputNumber('4')" class="btn">4</button>
			<button @click="inputNumber('5')" class="btn">5</button>
			<button @click="inputNumber('6')" class="btn">6</button>
			<button @click="inputOperator('-')" class="btn operator" tooltip="减法">-</button>

			<button @click="inputNumber('1')" class="btn">1</button>
			<button @click="inputNumber('2')" class="btn">2</button>
			<button @click="inputNumber('3')" class="btn">3</button>
			<button @click="inputOperator('+')" class="btn operator" tooltip="加法">+</button>

			<button @click="inputDecimal" class="btn" tooltip="小数点">.</button>
			<button @click="inputNumber('0')" class="btn">0</button>
			<button @click="toggleSign" class="btn" tooltip="切换符号">±</button>
			<button @click="calculate" class="btn equals" tooltip="等于">=</button>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Calculator',
	components: {
		scIcon,
	},
	data() {
		return {
			expression: '',
			result: '0',
		};
	},
	methods: {
		inputNumber(num) {
			this.expression += num;
		},
		inputOperator(op) {
			const lastChar = this.expression.slice(-1);
			if (['+', '-', '*', '/', '%'].includes(lastChar)) {
				this.expression = this.expression.slice(0, -1) + op;
			} else {
				this.expression += op;
			}
		},
		inputDecimal() {
			const parts = this.expression.split(/[\+\-\*\/\%]/);
			const lastPart = parts[parts.length - 1];
			if (!lastPart.includes('.')) {
				this.expression += '.';
			}
		},
		clear() {
			this.expression = '';
			this.result = '0';
		},
		backspace() {
			this.expression = this.expression.slice(0, -1);
		},
		toggleSign() {
			if (this.expression) {
				if (this.expression.startsWith('-')) {
					this.expression = this.expression.slice(1);
				} else {
					this.expression = '-' + this.expression;
				}
			}
		},
		calculate() {
			try {
				if (this.expression) {
					const calculateExpr = new Function('return ' + this.expression);
					const evalResult = calculateExpr();
					this.result = Number.isInteger(evalResult)
						? evalResult.toString()
						: evalResult.toFixed(8).replace(/\.?0+$/, '');
					this.expression = this.result;
				}
			} catch (error) {
				this.result = '错误';
			}
		},
	},
};
</script>

<style scoped>
.calculator-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #1a1a1a;
	color: #fff;
}

.app-header {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	background-color: #252525;
	border-bottom: 1px solid #333;
}

.app-title {
	font-size: 14px;
	font-weight: 500;
}

.display {
	padding: 20px;
	background-color: #1a1a1a;
	border-bottom: 1px solid #333;
}

.expression {
	font-size: 16px;
	color: #888;
	min-height: 22px;
	text-align: right;
	word-break: break-all;
}

.result {
	font-size: 40px;
	font-weight: 300;
	color: #fff;
	text-align: right;
	margin-top: 8px;
	word-break: break-all;
}

.buttons {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 2px;
	background-color: #252525;
	padding: 2px;
}

.btn {
	border: none;
	background-color: #333;
	color: #fff;
	font-size: 24px;
	cursor: pointer;
	transition: all 0.2s;
	padding: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn:hover {
	background-color: #444;
}

.btn:active {
	background-color: #555;
}

.btn.function {
	background-color: #3a3a3a;
	color: #409eff;
}

.btn.function:hover {
	background-color: #4a4a4a;
}

.btn.operator {
	background-color: #409eff;
	color: #fff;
}

.btn.operator:hover {
	background-color: #66b1ff;
}

.btn.equals {
	background-color: #67c23a;
	color: #fff;
}

.btn.equals:hover {
	background-color: #85ce61;
}
</style>
