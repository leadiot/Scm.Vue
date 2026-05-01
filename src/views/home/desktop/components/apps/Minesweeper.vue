<template>
    <div class="app-container app-light minesweeper-app">
        <div class="app-toolbar">
            <span class="app-header-title">扫雷</span>
            <div class="header-spacer"></div>
            <div class="game-stats">
                <div class="stat-item">
                    <sc-icon name="ms-warning" :size="18" />
                    <span>{{ mineCount - flagCount }}</span>
                </div>
                <div class="stat-item">
                    <sc-icon name="ms-schedule" :size="18" />
                    <span>{{ formatTime(timer) }}</span>
                </div>
            </div>
        </div>
        <div class="game-controls">
            <el-select v-model="difficulty" size="small" @change="initGame">
                <el-option label="初级 (9×9, 10雷)" value="easy" />
                <el-option label="中级 (16×16, 40雷)" value="medium" />
                <el-option label="高级 (25×25, 99雷)" value="hard" />
            </el-select>
            <el-button size="small" @click="initGame">
                <sc-icon name="ms-refresh" :size="16" />
                重新开始
            </el-button>
        </div>
        <div class="game-board" :style="boardStyle">
            <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
                <div v-for="(cell, colIndex) in row" :key="colIndex" class="cell" :class="getCellClass(cell)"
                    @click="handleClick(cell)" @contextmenu.prevent.stop="handleRightClick(cell)">
                    <span v-if="cell.isFlagged && !cell.isRevealed">
                        <sc-icon name="ms-flag" :size="16" />
                    </span>
                    <span v-else-if="cell.isRevealed && cell.isMine">
                        <sc-icon name="ms-warning" :size="16" />
                    </span>
                    <span v-else-if="cell.isRevealed && cell.adjacentMines > 0" class="mine-number"
                        :class="'num-' + cell.adjacentMines">
                        {{ cell.adjacentMines }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="gameOver" class="game-overlay">
            <div class="game-result">
                <div class="result-icon">
                    <sc-icon :name="isWin ? 'ms-emoji_events' : 'ms-sentiment_dissatisfied'" :size="48" />
                </div>
                <div class="result-text">{{ isWin ? '恭喜通关！' : '游戏结束' }}</div>
                <div class="result-time" v-if="isWin">用时: {{ formatTime(timer) }}</div>
                <el-button type="primary" @click="initGame">再来一局</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
    name: 'Minesweeper',
    components: {
        scIcon,
    },
    data() {
        return {
            difficulty: 'easy',
            board: [],
            rows: 9,
            cols: 9,
            mineCount: 10,
            flagCount: 0,
            timer: 0,
            timerInterval: null,
            gameOver: false,
            isWin: false,
            gameStarted: false,
        };
    },
    computed: {
        boardStyle() {
            var cellSize = 48;
            if (this.difficulty === 'hard') {
                cellSize = 24;
            } else if (this.difficulty === 'medium') {
                cellSize = 37.5;
            } else {
                cellSize = 66.7;
            }
            return {
                width: `${this.cols * cellSize}px`,
                gridTemplateColumns: `repeat(${this.cols}, ${cellSize}px)`,
            };
        },
    },
    mounted() {
        this.initGame();
    },
    beforeUnmount() {
        this.clearTimer();
    },
    methods: {
        initGame() {
            this.clearTimer();
            this.setDifficulty();
            this.board = this.createBoard();
            this.flagCount = 0;
            this.timer = 0;
            this.gameOver = false;
            this.isWin = false;
            this.gameStarted = false;
        },
        setDifficulty() {
            const settings = {
                easy: { rows: 9, cols: 9, mines: 10 },
                medium: { rows: 16, cols: 16, mines: 40 },
                hard: { rows: 25, cols: 25, mines: 99 },
            };
            const setting = settings[this.difficulty];
            this.rows = setting.rows;
            this.cols = setting.cols;
            this.mineCount = setting.mines;
        },
        createBoard() {
            const board = [];
            for (let i = 0; i < this.rows; i++) {
                const row = [];
                for (let j = 0; j < this.cols; j++) {
                    row.push({
                        row: i,
                        col: j,
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        adjacentMines: 0,
                    });
                }
                board.push(row);
            }
            return board;
        },
        placeMines(excludeRow, excludeCol) {
            let minesPlaced = 0;
            while (minesPlaced < this.mineCount) {
                const row = Math.floor(Math.random() * this.rows);
                const col = Math.floor(Math.random() * this.cols);
                if (!this.board[row][col].isMine) {
                    const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
                    if (!isExcluded) {
                        this.board[row][col].isMine = true;
                        minesPlaced++;
                    }
                }
            }
            this.calculateAdjacentMines();
        },
        calculateAdjacentMines() {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (!this.board[i][j].isMine) {
                        this.board[i][j].adjacentMines = this.countAdjacentMines(i, j);
                    }
                }
            }
        },
        countAdjacentMines(row, col) {
            let count = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                        if (this.board[newRow][newCol].isMine) {
                            count++;
                        }
                    }
                }
            }
            return count;
        },
        handleClick(cell) {
            if (this.gameOver || cell.isFlagged || cell.isRevealed) return;
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.placeMines(cell.row, cell.col);
                this.startTimer();
            }
            this.revealCell(cell);
        },
        handleRightClick(cell) {
            if (this.gameOver || cell.isRevealed) return;
            cell.isFlagged = !cell.isFlagged;
            this.flagCount += cell.isFlagged ? 1 : -1;
        },
        revealCell(cell) {
            if (cell.isRevealed || cell.isFlagged) return;
            cell.isRevealed = true;
            if (cell.isMine) {
                this.endGame(false);
                return;
            }
            if (cell.adjacentMines === 0) {
                this.revealAdjacentCells(cell.row, cell.col);
            }
            this.checkWin();
        },
        revealAdjacentCells(row, col) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                        const cell = this.board[newRow][newCol];
                        if (!cell.isRevealed && !cell.isFlagged) {
                            this.revealCell(cell);
                        }
                    }
                }
            }
        },
        checkWin() {
            let unrevealedCount = 0;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (!this.board[i][j].isRevealed) {
                        unrevealedCount++;
                    }
                }
            }
            if (unrevealedCount === this.mineCount) {
                this.endGame(true);
            }
        },
        endGame(isWin) {
            this.gameOver = true;
            this.isWin = isWin;
            this.clearTimer();
            if (!isWin) {
                this.revealAllMines();
            }
        },
        revealAllMines() {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.board[i][j].isMine) {
                        this.board[i][j].isRevealed = true;
                    }
                }
            }
        },
        startTimer() {
            this.clearTimer();
            this.timerInterval = setInterval(() => {
                this.timer++;
            }, 1000);
        },
        clearTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        },
        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
        getCellClass(cell) {
            return {
                'cell-hidden': !cell.isRevealed,
                'cell-revealed': cell.isRevealed,
                'cell-mine': cell.isRevealed && cell.isMine,
                'cell-flagged': cell.isFlagged && !cell.isRevealed,
            };
        },
    },
};
</script>

<style src="./common.css"></style>

<style scoped>
.minesweeper-app {
    background-color: var(--color-bg);
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
    gap: 20px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text);
}

.game-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-bg-secondary);
}

.game-board {
    display: grid;
    margin: 16px auto;
    border: 2px solid var(--color-border-dark);
    background-color: var(--color-bg-secondary);
}

.board-row {
    display: contents;
}

.cell {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.1s;
}

.cell-hidden {
    background-color: #c0c0c0;
    border: 2px outset #fff;
}

.cell-hidden:hover {
    background-color: #d0d0d0;
}

.cell-hidden:active {
    border: 2px inset #808080;
}

.cell-revealed {
    background-color: #e0e0e0;
    border: 1px solid #c0c0c0;
}

.cell-mine {
    background-color: #ff6b6b;
}

.cell-flagged {
    background-color: #ffd93d;
}

.mine-number {
    font-size: 14px;
    font-weight: bold;
}

.num-1 {
    color: #0000ff;
}

.num-2 {
    color: #008000;
}

.num-3 {
    color: #ff0000;
}

.num-4 {
    color: #000080;
}

.num-5 {
    color: #800000;
}

.num-6 {
    color: #008080;
}

.num-7 {
    color: #000000;
}

.num-8 {
    color: #808080;
}

.game-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.game-result {
    background-color: var(--color-bg);
    padding: 32px 48px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.result-icon {
    margin-bottom: 16px;
    color: var(--color-primary);
}

.result-text {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 8px;
}

.result-time {
    font-size: 16px;
    color: var(--color-text-secondary);
    margin-bottom: 20px;
}
</style>
