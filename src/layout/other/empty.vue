<template>
	<div class="empty-layout">
		<el-empty description="页面组件加载失败" :image-size="200">
			<el-button type="primary" @click="$router.back()">返回上一页</el-button>
			<el-button @click="$router.push('/console')">返回首页</el-button>
		</el-empty>
	</div>
</template>

<script>
export default {
	name: 'EmptyLayout',
};
</script>

<style scoped>
.empty-layout {
	width: 100%;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #f5f7fa;
}
</style>
