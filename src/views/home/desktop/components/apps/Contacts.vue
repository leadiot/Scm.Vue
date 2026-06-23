<template>
    <div class="app-container-row app-light">
        <div class="app-sidebar wide">
            <div class="app-header">
                <span class="app-header-title">联系人</span>
                <el-button text class="app-toolbar-btn" @click="addContact">
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
                            <span class="phone">{{ contact.phones[0]?.number || '' }}</span>
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
                        <span class="title">{{ selectedContact.title || '' }}</span>
                        <span class="company">{{ selectedContact.company || '' }}</span>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">基本信息</div>
                    <div class="info-item" v-if="selectedContact.nickname">
                        <sc-icon name="ms-star" :size="18" />
                        <span class="label">昵称:</span>
                        <span class="value">{{ selectedContact.nickname }}</span>
                    </div>
                    <div class="info-item" v-if="selectedContact.department">
                        <sc-icon name="ms-badge" :size="18" />
                        <span class="label">部门:</span>
                        <span class="value">{{ selectedContact.department }}</span>
                    </div>
                    <div class="info-item" v-if="selectedContact.birthday">
                        <sc-icon name="ms-cake" :size="18" />
                        <span class="label">生日:</span>
                        <span class="value">{{ formatDate(selectedContact.birthday) }}</span>
                    </div>
                    <div class="info-item" v-if="selectedContact.website">
                        <sc-icon name="ms-language" :size="18" />
                        <span class="label">网站:</span>
                        <a :href="selectedContact.website" target="_blank" class="link">
                            {{ selectedContact.website }}
                        </a>
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">电话</div>
                    <div v-for="(phone, index) in selectedContact.phones" :key="index" class="info-item">
                        <sc-icon name="ms-phone" :size="18" />
                        <span class="label">{{ phone.type || '手机' }}:</span>
                        <span>{{ phone.number }}</span>
                        <el-button text size="small" @click="callContact(phone.number)">
                            <sc-icon name="ms-call" :size="14" />
                        </el-button>
                    </div>
                    <div v-if="selectedContact.phones.length === 0" class="empty-info">
                        暂无电话
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">邮箱</div>
                    <div v-for="(email, index) in selectedContact.emails" :key="index" class="info-item">
                        <sc-icon name="ms-email" :size="18" />
                        <span class="label">{{ email.type || '工作' }}:</span>
                        <a :href="'mailto:' + email.address" class="link">{{ email.address }}</a>
                    </div>
                    <div v-if="selectedContact.emails.length === 0" class="empty-info">
                        暂无邮箱
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">地址</div>
                    <div v-for="(address, index) in selectedContact.addresses" :key="index" class="info-item">
                        <sc-icon name="ms-location_on" :size="18" />
                        <span class="label">{{ address.type || '工作' }}:</span>
                        <span>{{ address.street }} {{ address.city }} {{ address.state }} {{ address.zip }}</span>
                    </div>
                    <div v-if="selectedContact.addresses.length === 0" class="empty-info">
                        暂无地址
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">即时通讯</div>
                    <div v-for="(im, index) in selectedContact.im_addresses" :key="index" class="info-item">
                        <sc-icon name="ms-message" :size="18" />
                        <span class="label">{{ im.type || '微信' }}:</span>
                        <span>{{ im.address }}</span>
                    </div>
                    <div v-if="selectedContact.im_addresses.length === 0" class="empty-info">
                        暂无即时通讯账号
                    </div>
                </div>

                <div class="detail-section">
                    <div class="section-title">备注</div>
                    <div class="notes">{{ selectedContact.note || '暂无备注' }}</div>
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

        <el-dialog v-model="showEditDialog" :title="dialogTitle" width="600px" draggable>
            <el-form :model="currData">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名">
                            <el-input v-model="currData.name" placeholder="请输入姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="昵称">
                            <el-input v-model="currData.nickname" placeholder="请输入昵称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="前缀">
                            <el-input v-model="currData.name_prefix" placeholder="先生/女士" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="后缀">
                            <el-input v-model="currData.name_suffix" placeholder="博士/教授" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="生日">
                            <el-date-picker v-model="currData.birthday" type="date" placeholder="选择生日" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="公司">
                            <el-input v-model="currData.company" placeholder="请输入公司" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="职位">
                            <el-input v-model="currData.title" placeholder="请输入职位" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="部门">
                            <el-input v-model="currData.department" placeholder="请输入部门" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="网站">
                            <el-input v-model="currData.website" placeholder="请输入网站" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider content-position="left">电话</el-divider>
                <div v-for="(phone, index) in currData.phones" :key="index" class="form-row">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-select v-model="phone.type" placeholder="类型" size="small">
                                <el-option label="手机" value="手机" />
                                <el-option label="工作" value="工作" />
                                <el-option label="家庭" value="家庭" />
                                <el-option label="传真" value="传真" />
                            </el-select>
                        </el-col>
                        <el-col :span="14">
                            <el-input v-model="phone.number" placeholder="电话号码" size="small" />
                        </el-col>
                        <el-col :span="4">
                            <el-button text size="small" @click="removePhone(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addPhone">
                    <sc-icon name="ms-add" :size="14" /> 添加电话
                </el-button>

                <el-divider content-position="left">邮箱</el-divider>
                <div v-for="(email, index) in currData.emails" :key="index" class="form-row">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-select v-model="email.type" placeholder="类型" size="small">
                                <el-option label="工作" value="工作" />
                                <el-option label="个人" value="个人" />
                            </el-select>
                        </el-col>
                        <el-col :span="14">
                            <el-input v-model="email.address" placeholder="邮箱地址" size="small" />
                        </el-col>
                        <el-col :span="4">
                            <el-button text size="small" @click="removeEmail(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addEmail">
                    <sc-icon name="ms-add" :size="14" /> 添加邮箱
                </el-button>

                <el-divider content-position="left">地址</el-divider>
                <div v-for="(address, index) in currData.addresses" :key="index" class="form-row">
                    <el-row :gutter="10">
                        <el-col :span="5">
                            <el-select v-model="address.type" placeholder="类型" size="small">
                                <el-option label="工作" value="工作" />
                                <el-option label="家庭" value="家庭" />
                            </el-select>
                        </el-col>
                        <el-col :span="9">
                            <el-input v-model="address.street" placeholder="街道地址" size="small" />
                        </el-col>
                        <el-col :span="5">
                            <el-input v-model="address.city" placeholder="城市" size="small" />
                        </el-col>
                        <el-col :span="5">
                            <el-button text size="small" @click="removeAddress(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                    <el-row :gutter="10" style="margin-top: 8px;">
                        <el-col :span="10">
                            <el-input v-model="address.state" placeholder="省/州" size="small" />
                        </el-col>
                        <el-col :span="10">
                            <el-input v-model="address.zip" placeholder="邮编" size="small" />
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addAddress">
                    <sc-icon name="ms-add" :size="14" /> 添加地址
                </el-button>

                <el-divider content-position="left">即时通讯</el-divider>
                <div v-for="(im, index) in currData.im_addresses" :key="index" class="form-row">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-select v-model="im.type" placeholder="类型" size="small">
                                <el-option label="微信" value="微信" />
                                <el-option label="QQ" value="QQ" />
                                <el-option label="钉钉" value="钉钉" />
                                <el-option label="Skype" value="Skype" />
                            </el-select>
                        </el-col>
                        <el-col :span="14">
                            <el-input v-model="im.address" placeholder="账号" size="small" />
                        </el-col>
                        <el-col :span="4">
                            <el-button text size="small" @click="removeIM(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addIM">
                    <sc-icon name="ms-add" :size="14" /> 添加即时通讯
                </el-button>

                <el-form-item label="备注">
                    <el-input v-model="currData.note" type="textarea" :rows="3" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="saveContact">确定</el-button>
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
            showEditDialog: false,
            currData: this.def_data(),
            contacts: [],
        };
    },
    computed: {
        groupedContacts() {
            const filtered = this.searchQuery
                ? this.contacts.filter((c) =>
                    c.name.includes(this.searchQuery) ||
                    c.phones.some(p => p.number.includes(this.searchQuery)) ||
                    c.emails.some(e => e.address.includes(this.searchQuery))
                )
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
        dialogTitle() {
            return this.$SCM.is_valid_id(this.currData.id) ? '编辑联系人' : '添加联系人';
        },
    },
    mounted() {
        this.getContacts();
    },
    methods: {
        def_data() {
            return {
                id: '0',
                name: '',
                first_name: '',
                middle_name: '',
                last_name: '',
                name_prefix: '',
                name_suffix: '',
                nickname: '',
                company: '',
                title: '',
                department: '',
                website: '',
                note: '',
                birthday: '',
                photo_thumb_uri: '',
                photo_uri: '',
                emails: [],
                phones: [],
                addresses: [],
                im_addresses: []
            }
        },
        getContacts() {
            this.$API.scmsyscontact.list.get().then(res => {
                this.contacts = res.data;
                this.contacts.forEach(contact => {
                    contact.phones = contact.phones || [];
                    contact.emails = contact.emails || [];
                    contact.addresses = contact.addresses || [];
                    contact.im_addresses = contact.im_addresses || [];
                    contact.color = contact.color || '#000000';
                });
            });
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        },
        selectContact(contact) {
            this.selectedContact = contact;
        },
        callContact(phoneNumber) {
            this.$message.success(`正在拨打 ${phoneNumber}...`);
        },
        sendSMS() {
            if (this.selectedContact?.phones?.length > 0) {
                this.$message.info(`打开短信应用发送到 ${this.selectedContact.phones[0].number}...`);
            } else {
                this.$message.warning('该联系人没有电话号码');
            }
        },
        addPhone() {
            this.currData.phones.push({ type: '手机', number: '' });
        },
        removePhone(index) {
            this.currData.phones.splice(index, 1);
        },
        addEmail() {
            this.currData.emails.push({ type: '工作', address: '' });
        },
        removeEmail(index) {
            this.currData.emails.splice(index, 1);
        },
        addAddress() {
            this.currData.addresses.push({ type: '工作', street: '', city: '', state: '', zip: '' });
        },
        removeAddress(index) {
            this.currData.addresses.splice(index, 1);
        },
        addIM() {
            this.currData.im_addresses.push({ type: '微信', address: '' });
        },
        removeIM(index) {
            this.currData.im_addresses.splice(index, 1);
        },
        addContact() {
            this.currData = this.def_data();
            this.showEditDialog = true;
        },
        editContact() {
            if (!this.selectedContact) return;
            this.currData = this.selectedContact;
            this.showEditDialog = true;
        },
        saveContact() {
            if (!this.currData.name) {
                this.$message.warning('请填写姓名');
                return;
            }
            if (!this.$SCM.is_valid_id(this.currData.id)) {
                this.$API.scmsyscontact.add.post(this.currData).then(res => {
                    this.currData = this.def_data();
                    this.showEditDialog = false;
                    this.$message.success('添加成功');
                    this.getContacts();
                });
                return;
            }

            this.$API.scmsyscontact.update.put(this.currData).then(res => {
                this.showEditDialog = false;
                this.$message.success('保存成功');
                this.getContacts();
            });
        },
        deleteContact() {
            this.$confirm('确定要删除该联系人吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            }).then(() => {
                this.$API.scmsyscontact.delete.delete(this.selectedContact.id).then(res => {
                    this.showEditDialog = false;
                    this.$message.success('删除成功');
                    this.getContacts();
                });
            }).catch(() => { });
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
    gap: 12px;
}

.header-info {
    text-align: center;
}

.header-info .app-name {
    font-size: 20px;
    font-weight: 600;
    display: block;
}

.header-info .title {
    font-size: 14px;
    color: var(--el-color-primary);
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
    gap: 8px;
    padding: 8px 0;
    color: var(--color-text);
    font-size: 14px;
}

.info-item .label {
    color: var(--color-text-tertiary);
    min-width: 60px;
}

.info-item .value {
    flex: 1;
}

.info-item .link {
    color: var(--el-color-primary);
    text-decoration: none;
}

.info-item .link:hover {
    text-decoration: underline;
}

.empty-info {
    color: var(--color-text-tertiary);
    font-size: 14px;
    padding: 8px 0;
}

.notes {
    color: var(--color-text-secondary);
    line-height: 1.6;
    font-size: 14px;
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

.form-row {
    margin-bottom: 8px;
}

.el-divider {
    margin: 16px 0;
}
</style>