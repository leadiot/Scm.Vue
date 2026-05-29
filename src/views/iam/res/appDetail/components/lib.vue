<template>
    <el-card shadow="never" header="三方类库">
        <el-form ref="form" label-width="100px" label-position="left">
            <el-form-item label=".Net依赖库">
                <el-link target="_blank" href="https://gitee.com/openscm/scm.oidc.net">Gitee开源项目</el-link>
            </el-form-item>
            <el-form-item label="Java依赖库">
                <el-link target="_blank" href="https://gitee.com/openscm/scm.oidc.java">Gitee开源项目</el-link>
            </el-form-item>
            <el-form-item label="Html依赖库">
                <el-link target="_blank" href="https://gitee.com/openscm/scm.oidc.html">Gitee开源项目</el-link>
            </el-form-item>
        </el-form>
        <el-text></el-text>
    </el-card>
</template>
<script>
export default {
    props: {
        app: { type: Object, default: {} }
    }
};
</script>