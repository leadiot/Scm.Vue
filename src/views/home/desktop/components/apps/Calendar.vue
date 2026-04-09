<template>
	<div class="app-container app-light">
		<div class="app-header">
			<button @click="prevMonth" class="nav-btn">
				<sc-icon name="ms-chevron_left" :size="20" />
			</button>
			<h3 class="app-header-title">{{ currentYear }}年 {{ currentMonth + 1 }}月</h3>
			<button @click="nextMonth" class="nav-btn">
				<sc-icon name="ms-chevron_right" :size="20" />
			</button>
		</div>
		<div class="calendar-grid">
			<div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
			<div v-for="date in calendarDays" :key="date.key" class="day"
				:class="{ today: date.isToday, otherMonth: date.otherMonth }">
				{{ date.day }}
			</div>
		</div>
		<div class="calendar-footer">
			<div class="today-info">
				<sc-icon name="ms-calendar_today" :size="16" />
				<span>今天：{{ today.getFullYear() }}年{{ today.getMonth() + 1 }}月{{ today.getDate() }}日</span>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Calendar',
	components: {
		scIcon,
	},
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

<style src="./common.css"></style>

<style scoped>
.nav-btn {
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 4px;
	background-color: #f0f0f0;
	color: #333;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.2s;
}

.nav-btn:hover {
	background-color: #e0e0e0;
}

.calendar-grid {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 1px;
	background-color: #e5e5e5;
	padding: 1px;
	margin: 10px;
	border-radius: 8px;
}

.weekday {
	padding: 12px;
	text-align: center;
	background-color: #f5f5f5;
	font-weight: 500;
	color: #666;
	font-size: 13px;
}

.day {
	padding: 12px;
	text-align: center;
	background-color: #fff;
	cursor: pointer;
	transition: all 0.2s;
	font-size: 14px;
	color: #333;
}

.day:hover {
	background-color: #f5f5f5;
}

.day.today {
	background-color: #409eff;
	color: #fff;
	font-weight: bold;
	border-radius: 4px;
}

.day.otherMonth {
	color: #bbb;
}

.calendar-footer {
	padding: 12px 16px;
	background-color: #f9f9f9;
	border-top: 1px solid #e5e5e5;
}

.today-info {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: #666;
}
</style>
