<template>
	<div class="app-container app-light game2048-app" @contextmenu.prevent.stop tabindex="0" @keydown="handleKeyDown"
		ref="gameContainer">
		<div class="app-toolbar">
			<span class="app-header-title">2048</span>
			<div class="header-spacer"></div>
			<div class="game-stats">
				<div class="stat-item">
					<span class="stat-label">分数</span>
					<span class="stat-value">{{ score }}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">最高</span>
					<span class="stat-value">{{ bestScore }}</span>
				</div>
			</div>
		</div>
		<div class="game-controls">
			<el-button size="small" @click="initGame">
				<sc-icon name="ms-refresh" :size="16" />
				新游戏
			</el-button>
		</div>
		<div class="game-board-container">
			<div class="game-board">
				<div v-for="(row, rowIndex) in grid" :key="rowIndex" class="board-row">
					<div v-for="(cell, colIndex) in row" :key="colIndex" class="cell"
						:class="'tile-' + (cell || 0)">
						<span v-if="cell">{{ cell }}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="game-instructions">
			<div class="instructions-title">操作说明</div>
			<div class="instructions-content">
				<div class="instruction-item">
					<span class="key-group">
						<span class="key">↑</span>
						<span class="key">↓</span>
						<span class="key">←</span>
						<span class="key">→</span>
					</span>
					<span class="instruction-text">方向键移动方块</span>
				</div>
				<div class="instruction-item">
					<span class="key-group">
						<span class="key">W</span>
						<span class="key">A</span>
						<span class="key">S</span>
						<span class="key">D</span>
					</span>
					<span class="instruction-text">WASD移动方块</span>
				</div>
			</div>
			<div class="game-tips">
				<p>相同数字的方块碰撞会合并，目标是合成2048！</p>
			</div>
		</div>
		<div v-if="gameOver" class="game-overlay">
			<div class="game-result">
				<div class="result-icon">
					<sc-icon :name="isWin ? 'ms-emoji_events' : 'ms-sentiment_dissatisfied'" :size="48" />
				</div>
				<div class="result-text">{{ isWin ? '恭喜达成2048！' : '游戏结束' }}</div>
				<div class="result-score">得分: {{ score }}</div>
				<el-button type="primary" @click="initGame">再来一局</el-button>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Game2048',
	components: {
		scIcon,
	},
	data() {
		return {
			grid: [],
			score: 0,
			bestScore: 0,
			gameOver: false,
			isWin: false,
			touchStartX: 0,
			touchStartY: 0,
		};
	},
	mounted() {
		this.bestScore = parseInt(localStorage.getItem('game2048_best') || '0');
		this.initGame();
		this.$refs.gameContainer.focus();
	},
	methods: {
		initGame() {
			this.grid = this.createEmptyGrid();
			this.score = 0;
			this.gameOver = false;
			this.isWin = false;
			this.addRandomTile();
			this.addRandomTile();
			this.$refs.gameContainer.focus();
		},
		createEmptyGrid() {
			return Array(4).fill(null).map(() => Array(4).fill(0));
		},
		addRandomTile() {
			const emptyCells = [];
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					if (this.grid[i][j] === 0) {
						emptyCells.push({ row: i, col: j });
					}
				}
			}
			if (emptyCells.length > 0) {
				const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
				this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
			}
		},
		handleKeyDown(event) {
			if (this.gameOver) return;
			const keyMap = {
				ArrowUp: 'up',
				ArrowDown: 'down',
				ArrowLeft: 'left',
				ArrowRight: 'right',
				w: 'up',
				W: 'up',
				s: 'down',
				S: 'down',
				a: 'left',
				A: 'left',
				d: 'right',
				D: 'right',
			};
			const direction = keyMap[event.key];
			if (direction) {
				event.preventDefault();
				this.move(direction);
			}
		},
		handleTouchStart(event) {
			this.touchStartX = event.touches[0].clientX;
			this.touchStartY = event.touches[0].clientY;
		},
		handleTouchEnd(event) {
			if (this.gameOver) return;
			const touchEndX = event.changedTouches[0].clientX;
			const touchEndY = event.changedTouches[0].clientY;
			const deltaX = touchEndX - this.touchStartX;
			const deltaY = touchEndY - this.touchStartY;
			const minSwipeDistance = 50;
			if (Math.abs(deltaX) > Math.abs(deltaY)) {
				if (Math.abs(deltaX) > minSwipeDistance) {
					this.move(deltaX > 0 ? 'right' : 'left');
				}
			} else {
				if (Math.abs(deltaY) > minSwipeDistance) {
					this.move(deltaY > 0 ? 'down' : 'up');
				}
			}
		},
		move(direction) {
			const oldGrid = JSON.stringify(this.grid);
			let moved = false;
			switch (direction) {
				case 'up':
					moved = this.moveUp();
					break;
				case 'down':
					moved = this.moveDown();
					break;
				case 'left':
					moved = this.moveLeft();
					break;
				case 'right':
					moved = this.moveRight();
					break;
			}
			if (moved) {
				this.addRandomTile();
				this.checkGameState();
				if (this.score > this.bestScore) {
					this.bestScore = this.score;
					localStorage.setItem('game2048_best', this.bestScore.toString());
				}
			}
		},
		moveLeft() {
			let moved = false;
			for (let i = 0; i < 4; i++) {
				const row = this.grid[i].filter(val => val !== 0);
				const newRow = [];
				for (let j = 0; j < row.length; j++) {
					if (j < row.length - 1 && row[j] === row[j + 1]) {
						newRow.push(row[j] * 2);
						this.score += row[j] * 2;
						j++;
					} else {
						newRow.push(row[j]);
					}
				}
				while (newRow.length < 4) {
					newRow.push(0);
				}
				if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
					moved = true;
				}
				this.grid[i] = newRow;
			}
			return moved;
		},
		moveRight() {
			let moved = false;
			for (let i = 0; i < 4; i++) {
				const row = this.grid[i].filter(val => val !== 0);
				const newRow = [];
				for (let j = row.length - 1; j >= 0; j--) {
					if (j > 0 && row[j] === row[j - 1]) {
						newRow.unshift(row[j] * 2);
						this.score += row[j] * 2;
						j--;
					} else {
						newRow.unshift(row[j]);
					}
				}
				while (newRow.length < 4) {
					newRow.unshift(0);
				}
				if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
					moved = true;
				}
				this.grid[i] = newRow;
			}
			return moved;
		},
		moveUp() {
			let moved = false;
			for (let j = 0; j < 4; j++) {
				const col = [];
				for (let i = 0; i < 4; i++) {
					if (this.grid[i][j] !== 0) {
						col.push(this.grid[i][j]);
					}
				}
				const newCol = [];
				for (let i = 0; i < col.length; i++) {
					if (i < col.length - 1 && col[i] === col[i + 1]) {
						newCol.push(col[i] * 2);
						this.score += col[i] * 2;
						i++;
					} else {
						newCol.push(col[i]);
					}
				}
				while (newCol.length < 4) {
					newCol.push(0);
				}
				for (let i = 0; i < 4; i++) {
					if (this.grid[i][j] !== newCol[i]) {
						moved = true;
					}
					this.grid[i][j] = newCol[i];
				}
			}
			return moved;
		},
		moveDown() {
			let moved = false;
			for (let j = 0; j < 4; j++) {
				const col = [];
				for (let i = 0; i < 4; i++) {
					if (this.grid[i][j] !== 0) {
						col.push(this.grid[i][j]);
					}
				}
				const newCol = [];
				for (let i = col.length - 1; i >= 0; i--) {
					if (i > 0 && col[i] === col[i - 1]) {
						newCol.unshift(col[i] * 2);
						this.score += col[i] * 2;
						i--;
					} else {
						newCol.unshift(col[i]);
					}
				}
				while (newCol.length < 4) {
					newCol.unshift(0);
				}
				for (let i = 0; i < 4; i++) {
					if (this.grid[i][j] !== newCol[i]) {
						moved = true;
					}
					this.grid[i][j] = newCol[i];
				}
			}
			return moved;
		},
		checkGameState() {
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					if (this.grid[i][j] === 2048) {
						this.isWin = true;
						this.gameOver = true;
						return;
					}
				}
			}
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					if (this.grid[i][j] === 0) {
						return;
					}
					if (i < 3 && this.grid[i][j] === this.grid[i + 1][j]) {
						return;
					}
					if (j < 3 && this.grid[i][j] === this.grid[i][j + 1]) {
						return;
					}
				}
			}
			this.gameOver = true;
		},
	},
};
</script>

<style src="./common.css"></style>

<style scoped>
.game2048-app {
	background-color: #faf8ef;
}

.app-toolbar {
	display: flex;
	align-items: center;
	padding: 12px 16px;
	border-bottom: 1px solid var(--color-border);
}

.header-spacer {
	flex: 1;
}

.game-stats {
	display: flex;
	gap: 16px;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: #bbada0;
	padding: 6px 16px;
	border-radius: 6px;
}

.stat-label {
	font-size: 11px;
	color: #eee4da;
	text-transform: uppercase;
}

.stat-value {
	font-size: 20px;
	font-weight: bold;
	color: #fff;
}

.game-controls {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 12px 16px;
}

.game-board-container {
	display: flex;
	justify-content: center;
	padding: 16px;
}

.game-board {
	background-color: #bbada0;
	border-radius: 8px;
	padding: 8px;
}

.board-row {
	display: flex;
}

.cell {
	width: 70px;
	height: 70px;
	background-color: rgba(238, 228, 218, 0.35);
	border-radius: 6px;
	margin: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28px;
	font-weight: bold;
	color: #776e65;
	transition: all 0.15s;
}

.cell span {
	animation: pop 0.2s;
}

@keyframes pop {
	0% {
		transform: scale(0);
	}

	50% {
		transform: scale(1.1);
	}

	100% {
		transform: scale(1);
	}
}

.tile-2 {
	background-color: #eee4da;
	color: #776e65;
}

.tile-4 {
	background-color: #ede0c8;
	color: #776e65;
}

.tile-8 {
	background-color: #f2b179;
	color: #f9f6f2;
}

.tile-16 {
	background-color: #f59563;
	color: #f9f6f2;
}

.tile-32 {
	background-color: #f67c5f;
	color: #f9f6f2;
}

.tile-64 {
	background-color: #f65e3b;
	color: #f9f6f2;
}

.tile-128 {
	background-color: #edcf72;
	color: #f9f6f2;
	font-size: 26px;
}

.tile-256 {
	background-color: #edcc61;
	color: #f9f6f2;
	font-size: 26px;
}

.tile-512 {
	background-color: #edc850;
	color: #f9f6f2;
	font-size: 26px;
}

.tile-1024 {
	background-color: #edc53f;
	color: #f9f6f2;
	font-size: 22px;
}

.tile-2048 {
	background-color: #edc22e;
	color: #f9f6f2;
	font-size: 22px;
}

.tile-super {
	background-color: #3c3a32;
	color: #f9f6f2;
	font-size: 18px;
}

.game-instructions {
	text-align: center;
	padding: 12px 16px;
	color: #776e65;
}

.instructions-title {
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 10px;
	color: #5d534a;
}

.instructions-content {
	display: flex;
	justify-content: center;
	gap: 24px;
	margin-bottom: 10px;
}

.instruction-item {
	display: flex;
	align-items: center;
	gap: 8px;
}

.key-group {
	display: flex;
	gap: 4px;
}

.key {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 26px;
	height: 26px;
	padding: 0 6px;
	background-color: #bbada0;
	color: #f9f6f2;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 600;
	box-shadow: 0 2px 0 #8f7a66;
}

.instruction-text {
	font-size: 12px;
	color: #776e65;
}

.game-tips {
	font-size: 12px;
	color: #8f7a66;
	padding-top: 8px;
	border-top: 1px solid #e0d6c8;
}

.game-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(238, 228, 218, 0.73);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
}

.game-result {
	background-color: #faf8ef;
	padding: 32px 48px;
	border-radius: 12px;
	text-align: center;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.result-icon {
	margin-bottom: 16px;
	color: #edc22e;
}

.result-text {
	font-size: 24px;
	font-weight: 600;
	color: #776e65;
	margin-bottom: 8px;
}

.result-score {
	font-size: 16px;
	color: #776e65;
	margin-bottom: 20px;
}
</style>
