<template>
    <el-row :gutter="12">
        <el-col :span="12">
            <el-card shadow="never" header="Html代码">
                <el-form ref="formRef" :model="form" label-width="100px" style="margin-top: 20px">
                    <el-form-item label="提示文本" prop="title">
                        <el-input v-model="form.title"></el-input>
                        <div class="el-form-item-msg">
                            用户代码用于登录系统，不允许修改
                        </div>
                    </el-form-item>
                    <el-form-item label="回调状态" prop="state">
                        <el-input v-model="form.state"></el-input>
                        <div class="el-form-item-msg">
                            用户代码用于登录系统，不允许修改
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getScript">保存</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card shadow="never" header="效果预览">
                <el-card class="demo">
                    <div class="oidc" v-if="this.url">
                        <a :href="url" target="_blank" class="oidc-link">{{ this.form.title }}</a>
                    </div>
                </el-card>
                <el-card class="code">
                    <el-input type="textarea" v-model="script" :rows="5"></el-input>
                </el-card>
                <el-button type="primary" v-copy="script">复制</el-button>
            </el-card>
        </el-col>
    </el-row>
</template>

<script>
export default {
    props: {
        app: { type: Object, default: {} }
    },
    data() {
        return {
            form: {
                title: "登录",
                state: "login",
            },
            template: '',
            script: '',
            url: '',
        };
    },
    mounted() {
    },
    methods: {
        async getScript() {
            if (!this.form.title) {
                this.form.title = "登录";
            }

            if (!this.template) {
                this.template = await this.$SCM.list_cfg('oidc_script_html', '', true);
                if (!this.template) {
                    this.template = 'http://www.oidc.org.cn/web/login?client_id={key}&state={state}';
                }
            }

            var url = this.template.toString();
            url = url.replaceAll('{key}', this.app.app_key);
            url = url.replaceAll('{state}', this.form.state);
            this.url = url;

            this.script = '<a href="' + this.url + '">' + this.form.title + '</a>';
        },
    },
};
</script>