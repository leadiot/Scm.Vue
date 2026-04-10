<template>
    <div class="app-container app-light">
        <div class="profile-header">
            <div class="avatar-section">
                <el-avatar :size="70" :src="$SCM.get_avatar(form.avatar)"></el-avatar>
            </div>
            <div class="user-basic">
                <h2 class="user-name">{{ form.namec || '未设置' }}</h2>
                <p class="user-signature">
                    <el-tag v-for="(it, index) in form.role_list" :key="index">{{ it }}</el-tag>
                </p>
            </div>
        </div>

        <div class="profile-content">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="用户代码" prop="codec">
                    <el-input v-model="form.codec" disabled></el-input>
                </el-form-item>
                <el-form-item label="展示名称" prop="namec">
                    <el-input v-model="form.namec"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" prop="names">
                    <el-input v-model="form.names"></el-input>
                </el-form-item>
                <el-form-item label="性别" prop="sex">
                    <sc-select v-model="form.sex" placeholder="请选择" :data="sex_list"></sc-select>
                </el-form-item>
                <el-form-item label="手机号码" prop="cellphone">
                    <el-input v-model="form.cellphone"></el-input>
                </el-form-item>
                <el-form-item label="电子邮件" prop="email">
                    <el-input v-model="form.email"></el-input>
                </el-form-item>
                <el-form-item label="个性签名" prop="remark">
                    <el-input v-model="form.remark" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
        </div>

        <div class="profile-footer">
            <el-button type="primary" @click="saveProfile">保存</el-button>
        </div>
    </div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
    name: 'Profile',
    components: {
        scIcon,
    },
    data() {
        return {
            form: this.def_data(),
            rules: {
                codec: [
                    { required: true, trigger: "blur", message: "请输入用户代码" },
                ],
                namec: [
                    { required: true, trigger: "blur", message: "请输入用户名称" },
                ],
                sex: [
                    { required: true, trigger: "blur", message: "请选择性别", pattern: this.$SCM.REGEX_INT },
                ],
                cellphone: [
                    { required: true, trigger: "blur", message: "请输入手机号码" },
                ],
                email: [
                    { required: true, trigger: "blur", message: "请输入电子邮件" },
                ],
            },
            sex_list: [this.$SCM.OPTION_ONE_INT],
        };
    },
    mounted() {
        this.$SCM.list_dic(this.sex_list, 'sex', false);
        this.loadProfile();
    },
    methods: {
        def_data() {
            return {
                id: this.$SCM.DEF_ID,
                codec: "",
                names: "",
                namec: "",
                cellphone: '',
                email: '',
                avatar: '',
                sex: 1,
                remark: '',
                role: [],
                post: [],
            }
        },
        async loadProfile() {
            const res = await this.$API.operator.userwork.get();
            if (!res || res.code != 200) {
                return;
            }

            this.form = res.data;
        },
        saveProfile() {
            this.$refs.formRef.validate(async (valid) => {
                if (valid) {
                    const user = this.$TOOL.session.get("USER_INFO");
                    const res = await this.$API.operator.userBasic.put(this.form);
                    if (res.code == 200) {
                        user.userName = this.form.namec;
                        this.$TOOL.session.set("USER_INFO", user);
                        this.$emit('profile-updated', this.form);
                        this.$message.success("保存成功");
                    } else {
                        this.$alert(res.message, "提示", { type: "error" });
                    }
                }
            });
        },
        handleAvatarChange(file) {
            this.$message.info('头像上传功能开发中');
        },
    },
};
</script>

<style src="./common.css"></style>

<style scoped>
.profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 24px;
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
}

.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar-text {
    font-size: 32px;
    font-weight: 600;
    color: #fff;
}

.avatar-upload {
    text-align: center;
}

.user-basic {
    flex: 1;
}

.user-name {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 8px 0;
}

.user-signature {
    font-size: 14px;
    color: var(--color-text-tertiary);
    margin: 0;
}

.profile-content {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
}

.profile-content :deep(.el-form-item) {
    margin-bottom: 20px;
}

.profile-content :deep(.el-form-item__label) {
    color: var(--color-text);
}

.profile-content :deep(.el-input__wrapper) {
    background-color: var(--color-bg);
    box-shadow: 0 0 0 1px var(--color-border);
}

.profile-content :deep(.el-input__inner) {
    color: var(--color-text);
}

.profile-content :deep(.el-textarea__inner) {
    background-color: var(--color-bg);
    border-color: var(--color-border);
    color: var(--color-text);
}

.profile-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--color-border);
    background-color: var(--color-bg-secondary);
}
</style>
