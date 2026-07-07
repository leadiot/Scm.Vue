<template>
    <el-drawer :title="$t('console.feedbackTitle')" v-model="visible" :size="400" append-to-body destroy-on-close>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" style="padding:0 20px;">
            <el-form-item :label="$t('console.url')" prop="url">
                <el-input v-model="formData.url" show-word-limit clearable disabled></el-input>
            </el-form-item>
            <el-form-item :label="$t('console.issueType')" prop="types">
                <sc-select v-model="formData.types" :data="types_list" :placeholder="$t('console.issueTypePlaceholder')" collapse-tags></sc-select>
            </el-form-item>
            <el-form-item :label="$t('console.feedbackItem')" prop="title">
                <el-input v-model="formData.title" :placeholder="$t('console.feedbackItemPlaceholder')" :maxlength="32" show-word-limit
                    clearable></el-input>
            </el-form-item>
            <el-form-item :label="$t('console.detailDescription')" prop="remark">
                <el-input v-model="formData.remark" type="textarea" :placeholder="$t('console.detailPlaceholder')" :maxlength="1024" :rows="5"
                    show-word-limit clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button @click="close">{{ $t('common.cancel') }}</el-button>
                <el-button :loading="isSaveing" type="primary" @click="save">
                    {{ $t('common.confirm') }}
                </el-button>
            </el-form-item>
        </el-form>
    </el-drawer>
</template>

<script>
export default {
    emits: ["complete"],
    data() {
        return {
            visible: false,
            isSaveing: false,
            formData: {
                url: this.$route.path,
                types: this.$SCM.ID_ONE_INT,
                title: '',
                remark: ''
            },
            rules: {
                types: [
                    { required: true, trigger: "change", type: 'number', min: 1, message: this.$t('console.issueTypePlaceholder') },
                ],
                title: [
                    { required: true, trigger: "blur", message: this.$t('console.feedbackItemPlaceholder') },
                ],
            },
            types_list: [this.$SCM.OPTION_ONE_INT],
        }
    },
    mounted() {
        this.$SCM.list_dic(this.types_list, 'feedback_type', false);
    },
    methods: {
        open() {
            this.visible = true;
        },
        close() {
            this.visible = false;
        },
        save() {
            this.$refs.formRef.validate(async (valid) => {
                if (valid) {
                    this.isSaveing = true;
                    var res = await this.$API.scmsysfeedbackheader.add.post(this.formData);
                    this.isSaveing = false;
                    if (res.code == 200) {
                        this.$emit("complete");
                        this.visible = false;
                        this.$message.success(this.$t('console.feedbackSuccess'));
                    } else {
                        this.$alert(res.message, this.$t('common.info'), { type: "error" });
                    }
                }
            });
        }
    }
}
</script>
<style scoped>
.el-select {
    width: 100%;
}
</style>