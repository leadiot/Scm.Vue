<template>
    <sc-dialog v-model="visible" show-fullscreen destroy-on-close :title="title" width="750px">
        <el-form ref="formRef" label-width="100px" :model="formData">
            <el-form-item label="应用代码" prop="app_code">
                <el-input v-model="formData.app_code" disabled></el-input>
            </el-form-item>
            <el-form-item label="应用名称" prop="app_name">
                <el-input v-model="formData.app_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="应用简介" prop="app_desc">
                <el-input v-model="formData.app_desc" disabled></el-input>
            </el-form-item>
            <el-form-item label="回调地址" prop="redirect_uri">
                <el-input v-model="formData.redirect_uri" disabled></el-input>
            </el-form-item>
            <el-form-item label="排序依据" prop="order_by_name">
                <el-input v-model="formData.order_by_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="显示更多" prop="show_more_name">
                <el-input v-model="formData.show_more_name" disabled></el-input>
            </el-form-item>
            <el-form-item label="App Key" prop="app_key">
                <el-input v-model="formData.app_key" disabled></el-input>
            </el-form-item>
            <el-form-item label="App Secret" prop="app_secret">
                <el-input v-model="formData.app_secret" disabled>
                    <template #append>
                        <el-button @click="resetSecret()">重置</el-button>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button type="primary" @click="close">
                确 定
            </el-button>
        </template>
    </sc-dialog>
</template>
<script>
export default {
    data() {
        return {
            title: '详情',
            visible: false,
            formData: {},
            orderby_list: [],
            showmore_list: []
        };
    },
    mounted() {
    },
    methods: {
        async open(row) {
            if (!row || !row.id) {
                return;
            }

            var res = await this.$API.iamresappheader.view.get(row.id);
            this.formData = res.data;
            this.visible = true;
        },
        close() {
            this.formData = {};
            this.$refs.formRef.resetFields();
            this.visible = false;
        },
        async resetSecret() {
            var res = await this.$API.iamresappheader.reset.get(this.formData.id);
            if (!res || res.code != 200) {
                return;
            }

            this.formData.app_secret = res.data;
        }
    },
};
</script>