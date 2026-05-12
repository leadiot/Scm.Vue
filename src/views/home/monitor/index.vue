<template>
	<div class="monitor">
		<div class="screen-header">
			<div class="header-left">
				<span class="date">{{ currentDate }}</span>
				<span class="time">{{ currentTime }}</span>
			</div>
			<div class="header-center">
				<sc-icon name="ms-monitor" :size="28" />
				<span class="title">智慧数据大屏</span>
			</div>
			<div class="header-right">
				<span class="status online">系统运行正常</span>
			</div>
		</div>

		<div class="screen-body">
			<div class="side-panel left-panel">
				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-trending_up" :size="20" />
						<span class="card-title">实时数据概览</span>
					</div>
					<div class="card-content">
						<div class="stat-item">
							<div class="stat-value">{{ animatedTotalUsers }}</div>
							<div class="stat-label">总用户数</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{{ animatedActiveUsers }}</div>
							<div class="stat-label">活跃用户</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{{ animatedOrders }}</div>
							<div class="stat-label">今日订单</div>
						</div>
						<div class="stat-item">
							<div class="stat-value">{{ animatedRevenue }}</div>
							<div class="stat-label">今日营收</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-bar_chart" :size="20" />
						<span class="card-title">业务趋势</span>
					</div>
					<div class="card-content">
						<div class="chart-container" ref="trendChart"></div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-users" :size="20" />
						<span class="card-title">用户分布</span>
					</div>
					<div class="card-content">
						<div class="distribution-list">
							<div v-for="item in userDistribution" :key="item.name" class="distribution-item">
								<span class="dist-name">{{ item.name }}</span>
								<div class="dist-bar">
									<div class="dist-fill" :style="{ width: item.percent + '%' }"></div>
								</div>
								<span class="dist-percent">{{ item.percent }}%</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="center-panel">
				<div class="map-card">
					<div class="card-header">
						<sc-icon name="ms-map" :size="20" />
						<span class="card-title">全国业务分布</span>
						<div class="map-legend">
							<span class="legend-item"><span class="legend-dot high"></span> 高活跃</span>
							<span class="legend-item"><span class="legend-dot medium"></span> 中活跃</span>
							<span class="legend-item"><span class="legend-dot low"></span> 低活跃</span>
						</div>
					</div>
					<div class="map-container" ref="mapChart"></div>
					<div class="map-stats">
						<div class="map-stat">
							<span class="stat-num">{{ mapStats.total }}</span>
							<span class="stat-desc">覆盖城市</span>
						</div>
						<div class="map-stat">
							<span class="stat-num">{{ mapStats.active }}</span>
							<span class="stat-desc">活跃城市</span>
						</div>
						<div class="map-stat">
							<span class="stat-num">{{ mapStats.growth }}%</span>
							<span class="stat-desc">环比增长</span>
						</div>
					</div>
				</div>
			</div>

			<div class="side-panel right-panel">
				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-notifications" :size="20" />
						<span class="card-title">实时告警</span>
					</div>
					<div class="card-content">
						<div class="alarm-list">
							<div v-for="alarm in realtimeAlarms" :key="alarm.id" class="alarm-item"
								:class="alarm.level">
								<sc-icon :name="alarm.icon" :size="16" />
								<div class="alarm-content">
									<div class="alarm-title">{{ alarm.title }}</div>
									<div class="alarm-time">{{ alarm.time }}</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-shopping_cart" :size="20" />
						<span class="card-title">最新订单</span>
					</div>
					<div class="card-content">
						<div class="order-list">
							<div v-for="order in latestOrders" :key="order.id" class="order-item">
								<div class="order-info">
									<div class="order-id">{{ order.id }}</div>
									<div class="order-location">{{ order.location }}</div>
								</div>
								<div class="order-amount" :class="order.status">{{ order.amount }}</div>
							</div>
						</div>
					</div>
				</div>

				<div class="panel-card">
					<div class="card-header">
						<sc-icon name="ms-award" :size="20" />
						<span class="card-title">Top 5 城市</span>
					</div>
					<div class="card-content">
						<div class="ranking-list">
							<div v-for="(city, index) in topCities" :key="city.name" class="ranking-item">
								<span class="rank-num" :class="{ top: index < 3 }">{{ index + 1 }}</span>
								<span class="rank-name">{{ city.name }}</span>
								<span class="rank-value">{{ city.value }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="screen-footer">
			<div class="footer-info">
				<span>数据更新时间: {{ lastUpdateTime }}</span>
				<span>|</span>
				<span>数据延迟: {{ dataDelay }}ms</span>
				<span>|</span>
				<span>API状态: <span class="status ok">正常</span></span>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import * as echarts from 'echarts';

export default {
	name: 'BigScreen',
	components: { scIcon },
	data() {
		return {
			currentDate: '',
			currentTime: '',
			lastUpdateTime: '',
			dataDelay: 0,
			totalUsers: 125800,
			activeUsers: 15680,
			orders: 3256,
			revenue: 865000,
			animatedTotalUsers: 0,
			animatedActiveUsers: 0,
			animatedOrders: 0,
			animatedRevenue: 0,
			mapStats: {
				total: 34,
				active: 28,
				growth: 12.5,
			},
			userDistribution: [
				{ name: '华东', percent: 35 },
				{ name: '华北', percent: 25 },
				{ name: '华南', percent: 20 },
				{ name: '西南', percent: 12 },
				{ name: '其他', percent: 8 },
			],
			realtimeAlarms: [
				{ id: 1, title: '服务器负载过高', level: 'warning', icon: 'ms-warning', time: '刚刚' },
				{ id: 2, title: '订单处理延迟', level: 'info', icon: 'ms-info', time: '2分钟前' },
				{ id: 3, title: '数据库连接异常', level: 'error', icon: 'ms-error', time: '5分钟前' },
				{ id: 4, title: 'API调用超限', level: 'warning', icon: 'ms-alert', time: '8分钟前' },
				{ id: 5, title: '缓存同步完成', level: 'success', icon: 'ms-check_circle', time: '10分钟前' },
			],
			latestOrders: [
				{ id: 'ORD20260512001', location: '北京', amount: '¥2,580', status: 'success' },
				{ id: 'ORD20260512002', location: '上海', amount: '¥1,320', status: 'success' },
				{ id: 'ORD20260512003', location: '广州', amount: '¥890', status: 'pending' },
				{ id: 'ORD20260512004', location: '深圳', amount: '¥3,650', status: 'success' },
				{ id: 'ORD20260512005', location: '杭州', amount: '¥1,180', status: 'success' },
			],
			topCities: [
				{ name: '北京', value: '25,800' },
				{ name: '上海', value: '23,500' },
				{ name: '广州', value: '18,600' },
				{ name: '深圳', value: '17,200' },
				{ name: '杭州', value: '15,800' },
			],
			trendData: [65, 78, 89, 95, 88, 92, 105, 110, 98, 102, 115, 120],
			mapChartInstance: null,
			trendChartInstance: null,
			timer: null,
		};
	},
	mounted() {
		this.updateTime();
		this.timer = setInterval(() => {
			this.updateTime();
			this.updateData();
		}, 1000);

		this.animateNumbers();
		this.initCharts();
		this.simulateDataUpdate();
	},
	beforeUnmount() {
		if (this.timer) {
			clearInterval(this.timer);
		}
		if (this.mapChartInstance) {
			this.mapChartInstance.dispose();
		}
		if (this.trendChartInstance) {
			this.trendChartInstance.dispose();
		}
	},
	methods: {
		updateTime() {
			const now = new Date();
			this.currentDate = now.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				weekday: 'short',
			});
			this.currentTime = now.toLocaleTimeString('zh-CN', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			});
			this.lastUpdateTime = now.toLocaleString('zh-CN');
		},
		animateNumbers() {
			this.animateNumber('animatedTotalUsers', this.totalUsers, 2000);
			this.animateNumber('animatedActiveUsers', this.activeUsers, 2000);
			this.animateNumber('animatedOrders', this.orders, 1500);
			this.animateNumber('animatedRevenue', this.revenue, 2500, true);
		},
		animateNumber(target, end, duration, isMoney = false) {
			const start = 0;
			const startTime = performance.now();
			const animate = (currentTime) => {
				const elapsed = currentTime - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easeOut = 1 - Math.pow(1 - progress, 3);
				const current = Math.floor(start + (end - start) * easeOut);
				this[target] = isMoney ? this.formatMoney(current) : current.toLocaleString();
				if (progress < 1) {
					requestAnimationFrame(animate);
				}
			};
			requestAnimationFrame(animate);
		},
		formatMoney(value) {
			return '¥' + value.toLocaleString();
		},
		initCharts() {
			this.$nextTick(() => {
				this.initMapChart();
				this.initTrendChart();
			});
		},
		async initMapChart() {
			const container = this.$refs.mapChart;
			if (!container) return;

			if (!echarts.getMap('china')) {
				try {
					const response = await fetch('/map/json/china.json');
					const mapData = await response.json();
					echarts.registerMap('china', mapData);
				} catch (error) {
					console.error('加载中国地图数据失败:', error);
					return;
				}
			}

			this.mapChartInstance = echarts.init(container);
			const option = {
				backgroundColor: 'transparent',
				tooltip: {
					trigger: 'item',
					formatter: (params) => {
						return `<div style="padding: 8px;">
							<div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>
							<div>活跃用户: ${params.value}人</div>
						</div>`;
					},
				},
				visualMap: {
					min: 0,
					max: 30000,
					left: 'left',
					top: 'bottom',
					text: ['高', '低'],
					inRange: {
						color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'],
					},
					textStyle: {
						color: '#999',
					},
				},
				series: [
					{
						name: '用户分布',
						type: 'map',
						map: 'china',
						roam: false,
						label: {
							show: true,
							fontSize: 10,
							color: '#ccc',
						},
						emphasis: {
							label: {
								color: '#fff',
							},
							itemStyle: {
								areaColor: '#31a354',
							},
						},
						data: [
							{ name: '北京', value: 25800 },
							{ name: '天津', value: 8500 },
							{ name: '河北', value: 12000 },
							{ name: '山西', value: 6500 },
							{ name: '内蒙古', value: 4200 },
							{ name: '辽宁', value: 15000 },
							{ name: '吉林', value: 7800 },
							{ name: '黑龙江', value: 9200 },
							{ name: '上海', value: 23500 },
							{ name: '江苏', value: 28000 },
							{ name: '浙江', value: 22000 },
							{ name: '安徽', value: 11000 },
							{ name: '福建', value: 15600 },
							{ name: '江西', value: 8200 },
							{ name: '山东', value: 21000 },
							{ name: '河南', value: 14500 },
							{ name: '湖北', value: 16800 },
							{ name: '湖南', value: 13200 },
							{ name: '广东', value: 35000 },
							{ name: '广西', value: 9500 },
							{ name: '海南', value: 4800 },
							{ name: '重庆', value: 12500 },
							{ name: '四川', value: 18000 },
							{ name: '贵州', value: 5800 },
							{ name: '云南', value: 7200 },
							{ name: '西藏', value: 800 },
							{ name: '陕西', value: 10500 },
							{ name: '甘肃', value: 4500 },
							{ name: '青海', value: 1200 },
							{ name: '宁夏', value: 2800 },
							{ name: '新疆', value: 5200 },
							{ name: '香港', value: 6500 },
							{ name: '澳门', value: 1200 },
							{ name: '台湾', value: 3800 },
						],
					},
				],
			};
			this.mapChartInstance.setOption(option);

			window.addEventListener('resize', () => {
				this.mapChartInstance?.resize();
			});
		},
		initTrendChart() {
			const container = this.$refs.trendChart;
			if (!container) return;

			this.trendChartInstance = echarts.init(container);
			const option = {
				backgroundColor: 'transparent',
				grid: {
					left: '3%',
					right: '4%',
					bottom: '3%',
					top: '10%',
					containLabel: true,
				},
				xAxis: {
					type: 'category',
					data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
					axisLine: {
						lineStyle: { color: '#444' },
					},
					axisLabel: {
						color: '#999',
					},
				},
				yAxis: {
					type: 'value',
					axisLine: {
						lineStyle: { color: '#444' },
					},
					axisLabel: {
						color: '#999',
					},
					splitLine: {
						lineStyle: { color: '#333', type: 'dashed' },
					},
				},
				series: [
					{
						data: this.trendData,
						type: 'line',
						smooth: true,
						symbol: 'circle',
						symbolSize: 6,
						lineStyle: {
							width: 2,
							color: '#409eff',
						},
						itemStyle: {
							color: '#409eff',
						},
						areaStyle: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
								{ offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
								{ offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
							]),
						},
					},
				],
			};
			this.trendChartInstance.setOption(option);

			window.addEventListener('resize', () => {
				this.trendChartInstance?.resize();
			});
		},
		updateData() {
			this.dataDelay = Math.floor(Math.random() * 50) + 100;
		},
		simulateDataUpdate() {
			setInterval(() => {
				this.activeUsers = Math.floor(this.activeUsers * (0.995 + Math.random() * 0.01));
				this.orders += Math.floor(Math.random() * 5);
				this.revenue += Math.floor(Math.random() * 500);

				this.animateNumber('animatedActiveUsers', this.activeUsers, 500);
				this.animateNumber('animatedOrders', this.orders, 500);
				this.animateNumber('animatedRevenue', this.revenue, 800, true);

				this.realtimeAlarms[0].time = '刚刚';
				this.realtimeAlarms = [...this.realtimeAlarms.slice(0, 1), ...this.realtimeAlarms.slice(1).map((item, index) => ({
					...item,
					time: `${(index + 1) * 2 + Math.floor(Math.random() * 3)}分钟前`,
				}))];

				if (this.trendChartInstance) {
					this.trendData = this.trendData.map((v) => {
						return Math.floor(v * (0.98 + Math.random() * 0.04));
					});
					this.trendChartInstance.setOption({
						series: [{ data: this.trendData }],
					});
				}
			}, 5000);
		},
	},
};
</script>

<style>
@import 'common.css';
</style>