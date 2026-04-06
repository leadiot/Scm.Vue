<template>
	<div class="calendar-app">
		<div class="calendar-header">
			<button @click="prevMonth" class="nav-btn">‹</button>
			<h3>{{ currentYear }}年 {{ currentMonth + 1 }}月</h3>
			<button @click="nextMonth" class="nav-btn">›</button>
		</div>
		<div class="calendar-grid">
			<div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
			<div
				v-for="date in calendarDays"
				:key="date.key"
				class="day"
				:class="{ today: date.isToday, otherMonth: date.otherMonth }"
			>
				{{ date.day }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Calendar',
	data() {
		const today = new Date();
		return {
			today: today,
			currentYear: today.getFullYear(),
			currentMonth: today.getMonth(),
			weekdays: ['日', '一', '二', '三', '四', '五', '六'],
		};
	},
	computed: {
		calendarDays() {
			const firstDay = new Date(this.currentYear, this.currentMonth, 1);
			const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
			const days = [];

			const firstDayOfWeek = firstDay.getDay();
			for (let i = firstDayOfWeek - 1; i >= 0; i--) {
				const date = new Date(this.currentYear, this.currentMonth, -i);
				days.push({
					key: `prev-${i}`,
					day: date.getDate(),
					otherMonth: true,
					isToday: false,
				});
			}

			for (let i = 1; i <= lastDay.getDate(); i++) {
				const isToday =
					i === this.today.getDate() &&
					this.currentMonth === this.today.getMonth() &&
					this.currentYear === this.today.getFullYear();
				days.push({
					key: `current-${i}`,
					day: i,
					otherMonth: false,
					isToday,
				});
			}

			const remainingDays = 42 - days.length;
			for (let i = 1; i <= remainingDays; i++) {
				days.push({
					key: `next-${i}`,
					day: i,
					otherMonth: true,
					isToday: false,
				});
			}

			return days;
		},
	},
	methods: {
		prevMonth() {
			if (this.currentMonth === 0) {
				this.currentMonth = 11;
				this.currentYear--;
			} else {
				this.currentMonth--;
			}
		},
		nextMonth() {
			if (this.currentMonth === 11) {
				this.currentMonth = 0;
				this.currentYear++;
			} else {
				this.currentMonth++;
			}
		},
	},
};
</script>

<style scoped>
.calendar-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	padding: 20px;
}

.calendar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.calendar-header h3 {
	font-size: 18px;
	color: #333;
}

.nav-btn {
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 4px;
	background-color: #f5f5f5;
	cursor: pointer;
	font-size: 20px;
	transition: background-color 0.3s;
}

.nav-btn:hover {
	background-color: #e0e0e0;
}

.calendar-grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 1px;
	background-color: #e0e0e0;
	border: 1px solid #e0e0e0;
	border-radius: 4px;
	overflow: hidden;
}

.weekday {
	padding: 10px;
	text-align: center;
	background-color: #f5f5f5;
	font-weight: bold;
	color: #666;
}

.day {
	padding: 15px;
	text-align: center;
	background-color: #fff;
	cursor: pointer;
	transition: background-color 0.3s;
}

.day:hover {
	background-color: #f5f5f5;
}

.day.today {
	background-color: #409eff;
	color: #fff;
	font-weight: bold;
}

.day.otherMonth {
	color: #ccc;
}
</style>
