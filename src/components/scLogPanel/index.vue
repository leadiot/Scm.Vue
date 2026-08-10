<template>
    <el-drawer v-model="visible" title="日志面板" direction="rtl" size="600px" :before-close="handleClose"
        :append-to-body="true" class="sc-log-panel">
        <!-- 工具栏 -->
        <template #header>
            <div class="log-panel-header">
                <span class="log-panel-title">
                    <sc-icon name="sc-info" />
                    日志面板
                    <el-tag size="small" type="info">{{ filteredEntries.length }}</el-tag>
                </span>
            </div>
        </template>

        <div class="log-panel-toolbar">
            <!-- 级别过滤 -->
            <el-radio-group v-model="filterLevel" size="small">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="debug">Debug</el-radio-button>
                <el-radio-button label="info">Info</el-radio-button>
                <el-radio-button label="warn">Warn</el-radio-button>
                <el-radio-button label="error">Error</el-radio-button>
            </el-radio-group>

            <!-- 分类过滤 -->
            <el-select v-model="filterCategory" placeholder="分类" size="small" clearable style="width: 100px">
                <el-option label="全部" value="" />
                <el-option label="app" value="app" />
                <el-option label="code" value="code" />
                <el-option label="http" value="http" />
                <el-option label="biz" value="biz" />
                <el-option label="global" value="global" />
            </el-select>

            <!-- 搜索 -->
            <el-input v-model="searchText" placeholder="搜索日志..." size="small" clearable style="flex: 1" />

            <!-- 操作按钮 -->
            <el-button size="small" @click="handleClear" title="清空">
                <sc-icon name="sc-delete-line" />
            </el-button>
            <el-button size="small" @click="handleExport" title="导出">
                <sc-icon name="sc-file-download-line" />
            </el-button>
            <el-button size="small" @click="handleReport" title="上报" :loading="reportLoading">
                <sc-icon name="sc-file-upload-line" />
            </el-button>
        </div>

        <!-- 配置区 -->
        <div class="log-panel-config">
            <el-select v-model="currentLevel" size="small" style="width: 110px" @change="handleLevelChange">
                <el-option label="Debug" value="debug" />
                <el-option label="Info" value="info" />
                <el-option label="Warn" value="warn" />
                <el-option label="Error" value="error" />
                <el-option label="Silent" value="silent" />
            </el-select>
            <el-tooltip content="弹窗通知" placement="top">
                <el-switch v-model="notifyOn" inline-prompt active-text="通知" inactive-text="通知" size="small" />
            </el-tooltip>
            <el-tooltip content="自动上报 Error 日志" placement="top">
                <el-switch v-model="reportOn" inline-prompt active-text="上报" inactive-text="上报" size="small" />
            </el-tooltip>
            <el-tooltip content="自动滚动到最新" placement="top">
                <el-switch v-model="autoScroll" inline-prompt active-text="滚动" inactive-text="滚动" size="small" />
            </el-tooltip>
        </div>

        <!-- 日志列表 -->
        <div ref="logListRef" class="log-panel-list" @scroll="handleScroll">
            <div v-if="filteredEntries.length === 0" class="log-panel-empty">
                <p>暂无日志记录</p>
            </div>
            <div v-for="entry in filteredEntries" :key="entry.id"
                class="log-entry" :class="`log-entry-${entry.level}`"
                @click="toggleExpand(entry.id)">
                <div class="log-entry-header">
                    <span class="log-entry-time">{{ formatTime(entry.time) }}</span>
                    <el-tag size="small" :type="levelTagType(entry.level)" effect="plain">
                        {{ entry.level.toUpperCase() }}
                    </el-tag>
                    <el-tag v-if="entry.category" size="small" type="info" effect="plain">
                        {{ entry.category }}
                    </el-tag>
                </div>
                <div class="log-entry-message">{{ entry.message }}</div>
                <div v-if="expandedIds.includes(entry.id) && entry.stack" class="log-entry-stack">
                    <pre>{{ entry.stack }}</pre>
                </div>
                <div v-if="expandedIds.includes(entry.id) && entry.data && entry.data.length"
                    class="log-entry-data">
                    <pre>{{ entry.data.join('\n') }}</pre>
                </div>
            </div>
        </div>

        <!-- 底部状态栏 -->
        <template #footer>
            <div class="log-panel-footer">
                <span class="log-panel-stats">
                    缓冲区: {{ entries.length }}/500
                    <template v-if="errorCount > 0">
                        | <span class="text-danger">Error: {{ errorCount }}</span>
                    </template>
                    <template v-if="warnCount > 0">
                        | <span class="text-warning">Warn: {{ warnCount }}</span>
                    </template>
                </span>
                <el-button size="small" text @click="visible = false">关闭</el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script>
import logger from '@/utils/logger'
import { useGlobalStore } from '@/stores/global'

export default {
    name: 'scLogPanel',
    data() {
        return {
            visible: false,
            entries: [],
            unsubscribe: null,
            filterLevel: 'all',
            filterCategory: '',
            searchText: '',
            expandedIds: [],
            autoScroll: true,
            // 配置
            currentLevel: 'debug',
            notifyOn: false,
            reportOn: false,
            reportLoading: false,
        }
    },
    computed: {
        filteredEntries() {
            let list = this.entries
            if (this.filterLevel !== 'all') {
                list = list.filter(e => e.level === this.filterLevel)
            }
            if (this.filterCategory) {
                list = list.filter(e => e.category === this.filterCategory)
            }
            if (this.searchText.trim()) {
                const kw = this.searchText.toLowerCase()
                list = list.filter(e =>
                    e.message.toLowerCase().includes(kw) ||
                    (e.stack && e.stack.toLowerCase().includes(kw))
                )
            }
            return list
        },
        errorCount() {
            return this.entries.filter(e => e.level === 'error').length
        },
        warnCount() {
            return this.entries.filter(e => e.level === 'warn').length
        },
    },
    watch: {
        visible(val) {
            if (val) {
                this.$nextTick(() => this.scrollToBottom())
            }
        },
        notifyOn(val) {
            logger.setNotify(val)
            this.syncConfigToStore()
        },
        reportOn(val) {
            logger.setReport(val)
            this.syncConfigToStore()
        },
    },
    mounted() {
        // 同步当前配置
        const cfg = logger.getConfig()
        this.currentLevel = cfg.level
        this.notifyOn = cfg.notify
        this.reportOn = cfg.report
        // 加载缓冲区已有日志
        this.entries = logger.getEntries()
        // 订阅新日志
        this.unsubscribe = logger.subscribe((entry) => {
            this.entries.push(entry)
            if (this.entries.length > 500) this.entries.shift()
            if (this.autoScroll && this.visible) {
                this.$nextTick(() => this.scrollToBottom())
            }
        })
    },
    beforeUnmount() {
        if (this.unsubscribe) this.unsubscribe()
    },
    methods: {
        open() {
            this.visible = true
            this.$nextTick(() => this.scrollToBottom())
        },
        close() {
            this.visible = false
        },
        handleClose(done) {
            this.visible = false
            done()
        },
        scrollToBottom() {
            const el = this.$refs.logListRef
            if (el) el.scrollTop = el.scrollHeight
        },
        handleScroll() {
            const el = this.$refs.logListRef
            if (!el) return
            // 用户手动滚动时关闭自动滚动（除非滚到底部）
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30
            if (!atBottom && this.autoScroll) {
                this.autoScroll = false
            } else if (atBottom && !this.autoScroll) {
                this.autoScroll = true
            }
        },
        toggleExpand(id) {
            const idx = this.expandedIds.indexOf(id)
            if (idx >= 0) {
                this.expandedIds.splice(idx, 1)
            } else {
                this.expandedIds.push(id)
            }
        },
        handleLevelChange(val) {
            logger.setLevel(val)
            this.syncConfigToStore()
        },
        syncConfigToStore() {
            try {
                const gs = useGlobalStore()
                gs.SET_logLevel(this.currentLevel)
                gs.SET_logNotify(this.notifyOn)
                gs.SET_logReport(this.reportOn)
            } catch { /* store 未就绪保护 */ }
        },
        handleClear() {
            logger.clearEntries()
            this.entries = []
            this.expandedIds = []
        },
        handleExport() {
            logger.exportLogs()
        },
        async handleReport() {
            this.reportLoading = true
            try {
                logger.reportAll()
                this.$message.success('日志已上报')
            } catch {
                this.$message.error('上报失败')
            } finally {
                this.reportLoading = false
            }
        },
        formatTime(iso) {
            const d = new Date(iso)
            const pad = n => String(n).padStart(2, '0')
            return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`
        },
        levelTagType(level) {
            return { debug: 'info', info: '', warn: 'warning', error: 'danger' }[level] || ''
        },
    },
}
</script>

<style scoped>
.sc-log-panel :deep(.el-drawer__body) {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
}

.log-panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.log-panel-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    font-weight: 600;
}

.log-panel-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    flex-wrap: wrap;
}

.log-panel-config {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.log-panel-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 12px;
}

.log-panel-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-placeholder);
}

.log-panel-empty p {
    margin-top: 8px;
}

.log-entry {
    padding: 6px 10px;
    margin-bottom: 4px;
    border-radius: 4px;
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: background 0.15s;
}

.log-entry:hover {
    background: var(--el-fill-color-light);
}

.log-entry-debug {
    border-left-color: var(--el-color-info);
    opacity: 0.7;
}

.log-entry-info {
    border-left-color: var(--el-color-primary);
}

.log-entry-warn {
    border-left-color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
}

.log-entry-error {
    border-left-color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
}

.log-entry-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 2px;
}

.log-entry-time {
    color: var(--el-text-color-secondary);
    font-size: 11px;
}

.log-entry-message {
    color: var(--el-text-color-primary);
    word-break: break-all;
    white-space: pre-wrap;
}

.log-entry-stack,
.log-entry-data {
    margin-top: 6px;
    padding: 6px 8px;
    background: var(--el-fill-color-darker);
    border-radius: 3px;
    overflow-x: auto;
}

.log-entry-stack pre,
.log-entry-data pre {
    margin: 0;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    color: var(--el-text-color-regular);
}

.log-panel-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
}

.log-panel-stats {
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.text-danger {
    color: var(--el-color-danger);
    font-weight: 600;
}

.text-warning {
    color: var(--el-color-warning);
    font-weight: 600;
}
</style>
