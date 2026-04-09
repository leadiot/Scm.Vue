<template>
    <div class="app-container-row app-light">
        <div class="app-sidebar wide">
            <div class="app-header">
                <span class="app-header-title">联系人</span>
                <el-button text class="app-toolbar-btn" @click="showAddDialog = true">
                    <sc-icon name="ms-person_add" :size="20" />
                </el-button>
            </div>
            <div class="app-search-box">
                <el-input v-model="searchQuery" placeholder="搜索联系人..." prefix-icon="el-icon-search" size="small"
                    clearable />
            </div>
            <div class="app-list">
                <div v-for="group in groupedContacts" :key="group.letter" class="contact-group">
                    <div class="group-header">{{ group.letter }}</div>
                    <div v-for="contact in group.contacts" :key="contact.id" class="app-list-item"
                        :class="{ active: selectedContact?.id === contact.id }" @click="selectContact(contact)">
                        <div class="app-avatar" :style="{ backgroundColor: contact.color }">
                            {{ contact.name.charAt(0) }}
                        </div>
                        <div class="app-info">
                            <span class="app-name">{{ contact.name }}</span>
                            <span class="phone">{{ contact.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-detail">
            <div v-if="!selectedContact" class="app-empty">
                <sc-icon name="ms-contacts" :size="64" />
                <p>选择一个联系人查看详情</p>
            </div>
            <template v-else>
                <div class="detail-header">
                    <div class="app-avatar large" :style="{ backgroundColor: selectedContact.color }">
                        {{ selectedContact.name.charAt(0) }}
                    </div>
                    <div class="header-info">
                        <span class="app-name">{{ selectedContact.name }}</span>
                        <span class="company">{{ selectedContact.company || '未设置公司' }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">联系方式</div>
                    <div class="info-item">
                        <sc-icon name="ms-phone" :size="20" />
                        <span>{{ selectedContact.phone }}</span>
                        <el-button text size="small" @click="callContact">
                            <sc-icon name="ms-call" :size="16" />
                        </el-button>
                    </div>
                    <div class="info-item">
                        <sc-icon name="ms-email" :size="20" />
                        <span>{{ selectedContact.email || '未设置邮箱' }}</span>
                    </div>
                    <div class="info-item">
                        <sc-icon name="ms-location_on" :size="20" />
                        <span>{{ selectedContact.address || '未设置地址' }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">备注</div>
                    <div class="notes">{{ selectedContact.notes || '暂无备注' }}</div>
                </div>

                <div class="detail-actions">
                    <el-button type="primary" @click="sendSMS">
                        <sc-icon name="ms-message" :size="16" />
                        发送短信
                    </el-button>
                    <el-button @click="editContact">
                        <sc-icon name="ms-edit" :size="16" />
                        编辑
                    </el-button>
                    <el-button type="danger" text @click="deleteContact">
                        <sc-icon name="ms-delete" :size="16" />
                        删除
                    </el-button>
                </div>
            </template>
        </div>

        <el-dialog v-model="showAddDialog" title="添加联系人" width="400px" draggable>
            <el-form :model="newContact" label-width="80px">
                <el-form-item label="姓名">
                    <el-input v-model="newContact.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="newContact.phone" placeholder="请输入电话" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="newContact.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="公司">
                    <el-input v-model="newContact.company" placeholder="请输入公司" />
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="newContact.address" placeholder="请输入地址" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="newContact.notes" type="textarea" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addContact">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showEditDialog" title="编辑联系人" width="400px" draggable>
            <el-form :model="editContactData" label-width="80px">
                <el-form-item label="姓名">
                    <el-input v-model="editContactData.name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="电话">
                    <el-input v-model="editContactData.phone" placeholder="请输入电话" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="editContactData.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="公司">
                    <el-input v-model="editContactData.company" placeholder="请输入公司" />
                </el-form-item>
                <el-form-item label="地址">
                    <el-input v-model="editContactData.address" placeholder="请输入地址" />
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editContactData.notes" type="textarea" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="saveEditContact">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import { getRandomColor } from './utils.js';

export default {
    name: 'Contacts',
    components: {
        scIcon,
    },
    data() {
        return {
            searchQuery: '',
            selectedContact: null,
            showAddDialog: false,
            showEditDialog: false,
            newContact: {
                name: '',
                phone: '',
                email: '',
                company: '',
                address: '',
                notes: '',
            },
            editContactData: {
                id: null,
                name: '',
                phone: '',
                email: '',
                company: '',
                address: '',
                notes: '',
                color: '',
            },
            contacts: [
                { id: 1, name: '张三', phone: '138-0000-0001', email: 'zhangsan@example.com', company: '科技有限公司', address: '北京市朝阳区', notes: '技术部经理', color: '#409eff' },
                { id: 2, name: '李四', phone: '138-0000-0002', email: 'lisi@example.com', company: '网络科技公司', address: '上海市浦东新区', notes: '产品经理', color: '#67c23a' },
                { id: 3, name: '王五', phone: '138-0000-0003', email: 'wangwu@example.com', company: '互联网公司', address: '广州市天河区', notes: '设计师', color: '#e6a23c' },
                { id: 4, name: '赵六', phone: '138-0000-0004', email: 'zhaoliu@example.com', company: '软件公司', address: '深圳市南山区', notes: '开发工程师', color: '#f56c6c' },
                { id: 5, name: '陈七', phone: '138-0000-0005', email: 'chenqi@example.com', company: '数据公司', address: '杭州市西湖区', notes: '数据分析师', color: '#909399' },
                { id: 6, name: '刘八', phone: '138-0000-0006', email: 'liuba@example.com', company: '云计算公司', address: '成都市高新区', notes: '运维工程师', color: '#00bcd4' },
            ],
        };
    },
    computed: {
        groupedContacts() {
            const filtered = this.searchQuery
                ? this.contacts.filter((c) => c.name.includes(this.searchQuery) || c.phone.includes(this.searchQuery))
                : this.contacts;

            const groups = {};
            filtered.forEach((contact) => {
                const letter = contact.name.charAt(0).toUpperCase();
                if (!groups[letter]) {
                    groups[letter] = [];
                }
                groups[letter].push(contact);
            });

            return Object.keys(groups)
                .sort()
                .map((letter) => ({
                    letter,
                    contacts: groups[letter],
                }));
        },
    },
    methods: {
        selectContact(contact) {
            this.selectedContact = contact;
        },
        callContact() {
            this.$message.success(`正在拨打 ${this.selectedContact.phone}...`);
        },
        sendSMS() {
            this.$message.info('打开短信应用...');
        },
        editContact() {
            if (!this.selectedContact) return;
            this.editContactData = { ...this.selectedContact };
            this.showEditDialog = true;
        },
        saveEditContact() {
            if (!this.editContactData.name || !this.editContactData.phone) {
                this.$message.warning('请填写姓名和电话');
                return;
            }
            const index = this.contacts.findIndex((c) => c.id === this.editContactData.id);
            if (index > -1) {
                this.contacts.splice(index, 1, { ...this.editContactData });
                this.selectedContact = this.contacts[index];
                this.showEditDialog = false;
                this.$message.success('保存成功');
            }
        },
        deleteContact() {
            this.$confirm('确定要删除该联系人吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                const index = this.contacts.findIndex((c) => c.id === this.selectedContact.id);
                if (index > -1) {
                    this.contacts.splice(index, 1);
                    this.selectedContact = null;
                    this.$message.success('删除成功');
                }
            }).catch(() => { });
        },
        addContact() {
            if (!this.newContact.name || !this.newContact.phone) {
                this.$message.warning('请填写姓名和电话');
                return;
            }
            this.contacts.push({
                id: Date.now(),
                ...this.newContact,
                color: getRandomColor(),
            });
            this.newContact = { name: '', phone: '', email: '', company: '', address: '', notes: '' };
            this.showAddDialog = false;
            this.$message.success('添加成功');
        },
    },
};
</script>

<style src="./common.css"></style>

<style scoped>
.group-header {
    padding: 8px 16px;
    background-color: var(--color-bg-hover);
    color: var(--color-text-tertiary);
    font-size: 12px;
    font-weight: 600;
    position: sticky;
    top: 0;
}

.app-avatar {
    width: 40px;
    height: 40px;
}

.phone {
    font-size: 12px;
    color: var(--color-text-tertiary);
}

.contact-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow-y: auto;
}

.app-empty {
    gap: 16px;
}

.detail-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border);
    gap: 16px;
}

.header-info {
    text-align: center;
}

.header-info .app-name {
    font-size: 20px;
    font-weight: 600;
    display: block;
}

.header-info .company {
    font-size: 14px;
    color: var(--color-text-tertiary);
}

.detail-section {
    padding: 20px 0;
    border-bottom: 1px solid var(--color-border);
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-tertiary);
    margin-bottom: 12px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    color: var(--color-text);
}

.info-item span {
    flex: 1;
}

.notes {
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.detail-actions {
    display: flex;
    gap: 12px;
    padding-top: 24px;
    flex-wrap: wrap;
}

.detail-actions .el-button {
    flex: 1;
    min-width: 100px;
}
</style>
