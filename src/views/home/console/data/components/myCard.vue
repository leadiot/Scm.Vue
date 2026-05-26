<template>
    <div class="my-card-container">
        <div class="my-card" :class="cardClass">
            <div class="card-header">
                <div class="card-icon">
                    <el-icon :size="24">
                        <component :is="cardIcon" />
                    </el-icon>
                </div>
                <div class="card-title">
                    <span>{{ title }}</span>
                    <el-tooltip effect="dark" :content="tooltip" placement="top">
                        <el-icon :size="12" style="opacity: 0.6; margin-left: 4px">
                            <Warning />
                        </el-icon>
                    </el-tooltip>
                </div>
            </div>
            <div class="card-number">{{ formatNumber(number) }}</div>
            <div class="card-footer" v-if="!!rate">
                <span class="footer-label">{{ rate.title }}</span>
                <span class="footer-value" :class="rateClass">
                    <el-icon>
                        <component :is="rateIcon" />
                    </el-icon>
                    <span>{{ Math.abs(rate.value) }} {{ rate.units || '%' }}</span>
                </span>
            </div>
            <div class="card-decoration"></div>
        </div>
    </div>
</template>

<script>
import {
    ArrowRight,
    CaretBottom,
    CaretTop,
    Warning,
    TrendCharts,
    Box,
    User,
    UserFilled
} from '@element-plus/icons-vue'

export default {
    components: {
        ArrowRight,
        CaretBottom,
        CaretTop,
        Warning,
        TrendCharts,
        Box,
        User,
        UserFilled
    },
    props: {
        title: { type: String, default: "我的卡片" },
        tooltip: { type: String, default: "我的卡片11" },
        number: { type: Number, default: 0 },
        rate: { type: Object, default: () => { } },
        index: { type: Number, default: 0 }
    },
    data() {
        return {
        }
    },
    computed: {
        cardClass() {
            const classes = ['data-card']
            if (this.index === 1) classes.push('data-card-success')
            else if (this.index === 2) classes.push('data-card-warning')
            return classes
        },
        cardIcon() {
            const icons = ['TrendCharts', 'Box', 'User', 'UserFilled']
            return icons[this.index] || 'TrendCharts'
        },
        rateClass() {
            return this.rate.value < 0 ? 'rate-down' : 'rate-up'
        },
        rateIcon() {
            return this.rate.value < 0 ? 'CaretBottom' : 'CaretTop'
        }
    },
    methods: {
        formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
    }
}
</script>

<style scoped>
.my-card-container {
    height: 100%;
}

.my-card {
    height: 100%;
    padding: 24px;
    border-radius: var(--radius-xl);
    background: var(--gradient-primary);
    color: white;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-base);
    cursor: pointer;
}

.my-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px -8px rgba(102, 126, 234, 0.5);
}

.my-card.data-card-success {
    background: var(--gradient-success);
}

.my-card.data-card-success:hover {
    box-shadow: 0 12px 28px -8px rgba(17, 153, 142, 0.5);
}

.my-card.data-card-warning {
    background: var(--gradient-warning);
}

.my-card.data-card-warning:hover {
    box-shadow: 0 12px 28px -8px rgba(245, 87, 108, 0.5);
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}

.card-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    backdrop-filter: blur(4px);
}

.card-title {
    font-size: 15px;
    opacity: 0.9;
    display: flex;
    align-items: center;
}

.card-number {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: 1px;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    opacity: 0.9;
}

.footer-label {
    opacity: 0.8;
}

.footer-value {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
}

.footer-value.rate-up {
    color: rgba(255, 255, 255, 0.95);
}

.footer-value.rate-down {
    color: rgba(255, 255, 255, 0.95);
}

.card-decoration {
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
}
</style>