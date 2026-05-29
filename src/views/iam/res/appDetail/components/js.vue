<template>
    <el-row :gutter="12">
        <el-col :span="12">
            <el-card shadow="never" header="Javascript代码">
                <el-form ref="formRef" :model="form" label-width="100px" style="margin-top: 20px">
                    <el-form-item label="显示样式" prop="style">
                        <sc-select v-model="form.style" :data="style_list"></sc-select>
                        <div class="el-form-item-msg">
                            用户代码用于登录系统，不允许修改
                        </div>
                    </el-form-item>
                    <el-form-item label="回调状态" prop="state">
                        <el-input v-model="form.state" :maxlength="32" show-word-limit clearable></el-input>
                        <div class="el-form-item-msg">
                            用户代码用于登录系统，不允许修改
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="getScript">生成</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-col>
        <el-col :span="12">
            <el-card shadow="never" header="效果预览">
                <el-card class="demo">
                    <div id="oidc" class="oidc"></div>
                </el-card>
                <el-card class="code">
                    <el-input type="textarea" v-model="script" :rows="5" readonly></el-input>
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
                style: "icon",
                state: "",
            },
            template: '',
            script: '',
            style_list: [
                {
                    id: 1,
                    label: "图标",
                    value: "icon",
                },
                {
                    id: 2,
                    label: "卡片",
                    value: "card",
                },
                {

                    id: 3,
                    label: "列表",
                    value: "item",
                },
            ],
        };
    },
    mounted() {
    },
    methods: {
        async getScript() {
            if (!this.form.style) {
                this.form.style = "icon";
            }

            if (!this.template) {
                this.template = await this.$SCM.list_cfg('oidc_script_js', '', true);
            }

            var script = this.template;
            script = script.replaceAll('{key}', this.app.app_key);
            script = script.replaceAll('{style}', this.form.style);
            script = script.replaceAll('{state}', this.form.state);
            script = script.replaceAll('\\n', '\n');
            this.script = script;

            document.getElementById('oidc').innerHTML = '';
            oidc.init(this.$CONFIG.OIDC_KEY, "oidc", { "style": this.form.style, "state": this.form.state, "columns": 5 })
        }
    },
};
</script>
<style>
.demo {
    background-color: #f0f0f0;
}

.code {
    background-color: #f0f0f0;
}
</style>