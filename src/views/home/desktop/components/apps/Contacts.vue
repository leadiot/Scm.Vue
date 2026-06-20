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
                    <div v-for="(im, index) in selectedContact.imAddresses" :key="index" class="info-item">
                        <sc-icon name="ms-message" :size="18" />
                        <span class="label">{{ im.type || '微信' }}:</span>
                        <span>{{ im.address }}</span>
                    </div>
                    <div v-if="selectedContact.imAddresses.length === 0" class="empty-info">
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

        <el-dialog v-model="showAddDialog" title="添加联系人" width="600px" draggable>
            <el-form :model="newContact">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名">
                            <el-input v-model="newContact.name" placeholder="请输入姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="昵称">
                            <el-input v-model="newContact.nickname" placeholder="请输入昵称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="前缀">
                            <el-input v-model="newContact.namePrefix" placeholder="先生/女士" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="后缀">
                            <el-input v-model="newContact.nameSuffix" placeholder="博士/教授" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="生日">
                            <el-date-picker v-model="newContact.birthday" type="date" placeholder="选择生日" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="公司">
                            <el-input v-model="newContact.company" placeholder="请输入公司" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="职位">
                            <el-input v-model="newContact.title" placeholder="请输入职位" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="部门">
                            <el-input v-model="newContact.department" placeholder="请输入部门" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="网站">
                            <el-input v-model="newContact.website" placeholder="请输入网站" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider content-position="left">电话</el-divider>
                <div v-for="(phone, index) in newContact.phones" :key="index" class="form-row">
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
                <div v-for="(email, index) in newContact.emails" :key="index" class="form-row">
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
                <div v-for="(address, index) in newContact.addresses" :key="index" class="form-row">
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
                <div v-for="(im, index) in newContact.imAddresses" :key="index" class="form-row">
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
                    <el-input v-model="newContact.note" type="textarea" :rows="3" placeholder="请输入备注" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addContact">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showEditDialog" title="编辑联系人" width="600px" draggable>
            <el-form :model="editContactData" label-width="80px">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="姓名">
                            <el-input v-model="editContactData.name" placeholder="请输入姓名" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="昵称">
                            <el-input v-model="editContactData.nickname" placeholder="请输入昵称" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form-item label="前缀">
                            <el-input v-model="editContactData.namePrefix" placeholder="先生/女士" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="后缀">
                            <el-input v-model="editContactData.nameSuffix" placeholder="博士/教授" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="生日">
                            <el-date-picker v-model="editContactData.birthday" type="date" placeholder="选择生日"
                                size="small" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="公司">
                            <el-input v-model="editContactData.company" placeholder="请输入公司" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="职位">
                            <el-input v-model="editContactData.title" placeholder="请输入职位" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="部门">
                            <el-input v-model="editContactData.department" placeholder="请输入部门" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="网站">
                            <el-input v-model="editContactData.website" placeholder="请输入网站" />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-divider content-position="left">电话</el-divider>
                <div v-for="(phone, index) in editContactData.phones" :key="index" class="form-row">
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
                            <el-button text size="small" @click="removeEditPhone(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addEditPhone">
                    <sc-icon name="ms-add" :size="14" /> 添加电话
                </el-button>

                <el-divider content-position="left">邮箱</el-divider>
                <div v-for="(email, index) in editContactData.emails" :key="index" class="form-row">
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
                            <el-button text size="small" @click="removeEditEmail(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addEditEmail">
                    <sc-icon name="ms-add" :size="14" /> 添加邮箱
                </el-button>

                <el-divider content-position="left">地址</el-divider>
                <div v-for="(address, index) in editContactData.addresses" :key="index" class="form-row">
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
                            <el-button text size="small" @click="removeEditAddress(index)">
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
                <el-button text size="small" @click="addEditAddress">
                    <sc-icon name="ms-add" :size="14" /> 添加地址
                </el-button>

                <el-divider content-position="left">即时通讯</el-divider>
                <div v-for="(im, index) in editContactData.imAddresses" :key="index" class="form-row">
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
                            <el-button text size="small" @click="removeEditIM(index)">
                                <sc-icon name="ms-delete" :size="14" />
                            </el-button>
                        </el-col>
                    </el-row>
                </div>
                <el-button text size="small" @click="addEditIM">
                    <sc-icon name="ms-add" :size="14" /> 添加即时通讯
                </el-button>

                <el-form-item label="备注">
                    <el-input v-model="editContactData.note" type="textarea" :rows="3" placeholder="请输入备注" />
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
            newContact: this.def_data(),
            editContactData: null,
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
    },
    mounted() {
        this.getContacts();
    },
    methods: {
        def_data() {
            return {
                id: '0',
                name: '',
                firstName: '',
                middleName: '',
                lastName: '',
                namePrefix: '',
                nameSuffix: '',
                nickname: '',
                company: '',
                title: '',
                department: '',
                website: '',
                note: '',
                birthday: '',
                photoThumbUri: '',
                photoUri: '',
                emails: [],
                phones: [],
                addresses: [],
                imAddresses: []
            }
        },
        getContacts() {
            this.$API.scmsyscontact.list.get().then(res => {
                this.contacts = res.data;
                this.contacts.forEach(contact => {
                    contact.phones = contact.phones || [];
                    contact.emails = contact.emails || [];
                    contact.addresses = contact.addresses || [];
                    contact.imAddresses = contact.imAddresses || [];
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
            this.newContact.phones.push({ type: '手机', number: '' });
        },
        removePhone(index) {
            this.newContact.phones.splice(index, 1);
        },
        addEmail() {
            this.newContact.emails.push({ type: '工作', address: '' });
        },
        removeEmail(index) {
            this.newContact.emails.splice(index, 1);
        },
        addAddress() {
            this.newContact.addresses.push({ type: '工作', street: '', city: '', state: '', zip: '' });
        },
        removeAddress(index) {
            this.newContact.addresses.splice(index, 1);
        },
        addIM() {
            this.newContact.imAddresses.push({ type: '微信', address: '' });
        },
        removeIM(index) {
            this.newContact.imAddresses.splice(index, 1);
        },
        addEditPhone() {
            this.editContactData.phones.push({ type: '手机', number: '' });
        },
        removeEditPhone(index) {
            this.editContactData.phones.splice(index, 1);
        },
        addEditEmail() {
            this.editContactData.emails.push({ type: '工作', address: '' });
        },
        removeEditEmail(index) {
            this.editContactData.emails.splice(index, 1);
        },
        addEditAddress() {
            this.editContactData.addresses.push({ type: '工作', street: '', city: '', state: '', zip: '' });
        },
        removeEditAddress(index) {
            this.editContactData.addresses.splice(index, 1);
        },
        addEditIM() {
            this.editContactData.imAddresses.push({ type: '微信', address: '' });
        },
        removeEditIM(index) {
            this.editContactData.imAddresses.splice(index, 1);
        },
        editContact() {
            if (!this.selectedContact) return;
            this.editContactData = JSON.parse(JSON.stringify(this.selectedContact));
            this.showEditDialog = true;
        },
        saveEditContact() {
            if (!this.editContactData.name) {
                this.$message.warning('请填写姓名');
                return;
            }
            this.$API.scmsyscontact.update.put(this.editContactData).then(res => {
                this.showEditDialog = false;
                this.$message.success('保存成功');
                this.getContacts();
            });
            // const index = this.contacts.findIndex((c) => c.id === this.editContactData.id);
            // if (index > -1) {
            //     this.contacts.splice(index, 1, { ...this.editContactData });
            //     this.selectedContact = this.contacts[index];
            //     this.showEditDialog = false;
            //     this.$message.success('保存成功');
            // }
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
            if (!this.newContact.name) {
                this.$message.warning('请填写姓名');
                return;
            }
            this.$API.scmsyscontact.add.post(this.newContact).then(res => {
                this.newContact = this.def_data();
                this.showAddDialog = false;
                this.$message.success('添加成功');
                this.getContacts();
            });
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