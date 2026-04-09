<template>
    <div class="contacts-app">
        <div class="sidebar">
            <div class="sidebar-header">
                <span class="app-title">联系人</span>
                <el-button text class="add-btn" @click="showAddDialog = true">
                    <sc-icon name="ms-person_add" :size="20" />
                </el-button>
            </div>
            <div class="search-box">
                <el-input v-model="searchQuery" placeholder="搜索联系人..." prefix-icon="el-icon-search" size="small"
                    clearable />
            </div>
            <div class="contact-groups">
                <div v-for="group in groupedContacts" :key="group.letter" class="contact-group">
                    <div class="group-header">{{ group.letter }}</div>
                    <div v-for="contact in group.contacts" :key="contact.id" class="contact-item"
                        :class="{ active: selectedContact?.id === contact.id }" @click="selectContact(contact)">
                        <div class="avatar" :style="{ backgroundColor: contact.color }">
                            {{ contact.name.charAt(0) }}
                        </div>
                        <div class="contact-info">
                            <span class="name">{{ contact.name }}</span>
                            <span class="phone">{{ contact.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="contact-detail">
            <div v-if="!selectedContact" class="empty-detail">
                <sc-icon name="ms-contacts" :size="64" />
                <p>选择一个联系人查看详情</p>
            </div>
            <template v-else>
                <div class="detail-header">
                    <div class="avatar large" :style="{ backgroundColor: selectedContact.color }">
                        {{ selectedContact.name.charAt(0) }}
                    </div>
                    <div class="header-info">
                        <span class="name">{{ selectedContact.name }}</span>
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

<style scoped>
.contacts-app {
    height: 100%;
    display: flex;
    background-color: #1a1a1a;
    color: #fff;
}

.sidebar {
    width: 300px;
    background-color: #252525;
    border-right: 1px solid #333;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #333;
}

.app-title {
    font-size: 18px;
    font-weight: 600;
}

.add-btn {
    color: #409eff !important;
}

.search-box {
    padding: 8px 12px;
    border-bottom: 1px solid #333;
}

.contact-groups {
    flex: 1;
    overflow-y: auto;
}

.group-header {
    padding: 8px 16px;
    background-color: #1a1a1a;
    color: #909399;
    font-size: 12px;
    font-weight: 600;
    position: sticky;
    top: 0;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.contact-item:hover {
    background-color: #2a2a2a;
}

.contact-item.active {
    background-color: #333;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
}

.avatar.large {
    width: 80px;
    height: 80px;
    font-size: 32px;
}

.contact-info {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.name {
    font-size: 14px;
    font-weight: 500;
}

.phone {
    font-size: 12px;
    color: #909399;
}

.contact-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow-y: auto;
}

.empty-detail {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #606266;
    gap: 16px;
}

.detail-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 24px;
    border-bottom: 1px solid #333;
    gap: 16px;
}

.header-info {
    text-align: center;
}

.header-info .name {
    font-size: 20px;
    font-weight: 600;
    display: block;
}

.header-info .company {
    font-size: 14px;
    color: #909399;
}

.detail-section {
    padding: 20px 0;
    border-bottom: 1px solid #333;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #909399;
    margin-bottom: 12px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    color: #e0e0e0;
}

.info-item span {
    flex: 1;
}

.notes {
    color: #b0b0b0;
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
