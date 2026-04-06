<template>
	<div class="calculator-app">
		<div class="display">
			<div class="expression">{{ expression || '0' }}</div>
			<div class="result">{{ result }}</div>
		</div>
		<div class="buttons">
			<button @click="clear" class="btn function">C</button>
			<button @click="backspace" class="btn function">⌫</button>
			<button @click="inputOperator('%')" class="btn function">%</button>
			<button @click="inputOperator('/')" class="btn operator">÷</button>

			<button @click="inputNumber('7')" class="btn">7</button>
			<button @click="inputNumber('8')" class="btn">8</button>
			<button @click="inputNumber('9')" class="btn">9</button>
			<button @click="inputOperator('*')" class="btn operator">×</button>

			<button @click="inputNumber('4')" class="btn">4</button>
			<button @click="inputNumber('5')" class="btn">5</button>
			<button @click="inputNumber('6')" class="btn">6</button>
			<button @click="inputOperator('-')" class="btn operator">−</button>

			<button @click="inputNumber('1')" class="btn">1</button>
			<button @click="inputNumber('2')" class="btn">2</button>
			<button @click="inputNumber('3')" class="btn">3</button>
			<button @click="inputOperator('+')" class="btn operator">+</button>

			<button @click="toggleSign" class="btn">±</button>
			<button @click="inputNumber('0')" class="btn">0</button>
			<button @click="inputDecimal" class="btn">.</button>
			<button @click="calculate" class="btn equals">=</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Calculator',
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
	background-color: #f5f5f5;
}

.display {
	padding: 20px;
	background-color: #fff;
	border-bottom: 1px solid #e0e0e0;
}

.expression {
	font-size: 18px;
	color: #666;
	min-height: 24px;
	text-align: right;
	word-break: break-all;
}

.result {
	font-size: 36px;
	font-weight: bold;
	color: #333;
	text-align: right;
	margin-top: 10px;
	word-break: break-all;
}

.buttons {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 1px;
	background-color: #e0e0e0;
	padding: 1px;
}

.btn {
	border: none;
	background-color: #fff;
	font-size: 24px;
	cursor: pointer;
	transition: background-color 0.2s;
	padding: 20px;
}

.btn:hover {
	background-color: #f0f0f0;
}

.btn:active {
	background-color: #e0e0e0;
}

.btn.function {
	background-color: #f5f5f5;
	color: #ff9500;
}

.btn.operator {
	background-color: #ff9500;
	color: #fff;
}

.btn.operator:hover {
	background-color: #ff8000;
}

.btn.equals {
	background-color: #4cd964;
	color: #fff;
}

.btn.equals:hover {
	background-color: #3cb054;
}
</style>
