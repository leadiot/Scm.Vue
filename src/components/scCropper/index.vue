<template>
	<div class="sc-cropper">
		<Cropper
			ref="cropper"
			class="sc-cropper__canvas"
			:src="src"
			:stencil-props="stencilProps"
			:background-class="'sc-cropper__bg'"
			@change="onCropperChange"
		/>
		<div class="sc-cropper__preview">
			<h4>图像预览</h4>
			<div class="sc-cropper__preview__img">
				<canvas ref="previewCanvas" width="120" height="120"></canvas>
			</div>
		</div>
	</div>
</template>

<script>
	import { Cropper } from 'vue-advanced-cropper'
	import 'vue-advanced-cropper/dist/style.css'

	export default {
		components: { Cropper },
		props: {
			src: { type: String, default: "" },
			compress: { type: Number, default: 1 },
			aspectRatio: { type: Number, default: NaN },
		},
		computed: {
			stencilProps() {
				const props = {
					movable: true,
					resizable: true,
					aspectRatio: Number.isNaN(this.aspectRatio) ? null : this.aspectRatio
				}
				return props
			}
		},
		watch: {
			aspectRatio() {
				// stencilProps 是 computed，会自动响应 aspectRatio 变化
			}
		},
		methods: {
			onCropperChange() {
				this.$nextTick(() => this.updatePreview())
			},
			getCropCanvas() {
				const cropper = this.$refs.cropper
				if (!cropper) return null
				const result = cropper.getResult()
				return result && result.canvas ? result.canvas : null
			},
			setAspectRatio(aspectRatio) {
				// 通过修改 prop 触发 stencilProps 重新计算
				// 外部调用时直接修改父组件传入的 aspectRatio 即可
				this.$emit('update:aspectRatio', aspectRatio)
			},
			updatePreview() {
				const canvas = this.getCropCanvas()
				const preview = this.$refs.previewCanvas
				if (!canvas || !preview) return
				const ctx = preview.getContext('2d')
				ctx.clearRect(0, 0, preview.width, preview.height)
				if (canvas.width === 0 || canvas.height === 0) return
				const ratio = Math.min(preview.width / canvas.width, preview.height / canvas.height)
				const w = canvas.width * ratio
				const h = canvas.height * ratio
				ctx.drawImage(canvas, (preview.width - w) / 2, (preview.height - h) / 2, w, h)
			},
			getCropData(cb, type = 'image/jpeg') {
				const canvas = this.getCropCanvas()
				if (!canvas) return
				cb(canvas.toDataURL(type, this.compress))
			},
			getCropBlob(cb, type = 'image/jpeg') {
				const canvas = this.getCropCanvas()
				if (!canvas) return
				canvas.toBlob((blob) => cb(blob), type, this.compress)
			},
			getCropFile(cb, fileName = 'fileName.jpg', type = 'image/jpeg') {
				const canvas = this.getCropCanvas()
				if (!canvas) return
				canvas.toBlob((blob) => {
					const file = new File([blob], fileName, { type })
					cb(file)
				}, type, this.compress)
			}
		}
	}
</script>

<style scoped>
	.sc-cropper {height: 300px; display: flex; gap: 20px;}
	.sc-cropper__canvas {display: block; height: 100%; width: 400px; background: #EBEEF5;}
	.sc-cropper__bg {background: #EBEEF5;}
	.sc-cropper__preview {width: 120px; flex-shrink: 0;}
	.sc-cropper__preview h4 {font-weight: normal; font-size: 12px; color: #999; margin-bottom: 20px;}
	.sc-cropper__preview__img {overflow: hidden; width: 120px; height: 120px; border: 1px solid #ebeef5;}
	.sc-cropper__preview__img canvas {display: block; width: 100%; height: 100%;}
</style>
