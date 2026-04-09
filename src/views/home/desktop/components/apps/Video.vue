<template>
	<div class="video-app" @dragover.prevent @drop.prevent="handleDrop">
		<div v-if="!currentVideo" class="video-empty">
			<div class="drop-zone" :class="{ 'drag-over': isDragOver }" @dragover="isDragOver = true"
				@dragleave="isDragOver = false" @drop="handleDrop">
				<sc-icon name="ms-video_library" :size="64" />
				<p>拖放视频文件到此处播放</p>
				<p class="hint">支持 MP4, WebM, OGG 格式</p>
				<el-button type="primary" @click="openFileDialog" style="margin-top: 20px;">
					<sc-icon name="ms-folder_open" style="margin-right: 8px;" />
					选择视频文件
				</el-button>
				<input ref="fileInput" type="file" accept="video/*" style="display: none;" @change="handleFileSelect">
			</div>
			<div v-if="videos.length > 0" class="video-history">
				<h4>最近播放</h4>
				<div class="history-list">
					<div v-for="video in videos" :key="video.id" class="history-item" @click="playVideo(video)">
						<sc-icon name="ms-play_circle" :size="32" />
						<div class="history-info">
							<span class="history-title">{{ video.title }}</span>
							<span class="history-duration">{{ video.duration }}</span>
						</div>
						<el-icon class="remove-btn" @click.stop="removeVideo(video.id)">
							<el-icon-close />
						</el-icon>
					</div>
				</div>
			</div>
		</div>

		<div v-else class="video-player-container">
			<div class="player-header">
				<el-button text @click="closePlayer">
					<sc-icon name="ms-arrow_back" />
					<span>返回</span>
				</el-button>
				<span class="video-name">{{ currentVideo.title }}</span>
				<el-button text @click="toggleFullscreen">
					<sc-icon :name="isFullscreen ? 'ms-fullscreen_exit' : 'ms-fullscreen'" />
				</el-button>
			</div>

			<div ref="playerWrapper" class="player-wrapper" :class="{ fullscreen: isFullscreen }">
				<video ref="videoPlayer" class="video-player" :src="currentVideo.url"
					:poster="currentVideo.poster" @timeupdate="updateProgress" @loadedmetadata="onVideoLoaded"
					@ended="onVideoEnded" @click="togglePlay" @dblclick="toggleFullscreen"></video>

				<div class="video-controls">
					<div class="progress-bar" @click="seekVideo">
						<div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
						<div class="progress-played" :style="{ width: progressPercent + '%' }"></div>
						<div class="progress-handle" :style="{ left: progressPercent + '%' }"></div>
					</div>

					<div class="controls-row">
						<div class="controls-left">
							<el-button text class="control-btn" @click="togglePlay">
								<sc-icon :name="isPlaying ? 'ms-pause' : 'ms-play_arrow'" :size="28" />
							</el-button>
							<el-button text class="control-btn" @click="skipBackward">
								<sc-icon name="ms-replay_10" :size="24" />
							</el-button>
							<el-button text class="control-btn" @click="skipForward">
								<sc-icon name="ms-forward_10" :size="24" />
							</el-button>
							<div class="volume-control">
								<el-button text class="control-btn" @click="toggleMute">
									<sc-icon :name="isMuted ? 'ms-volume_off' : 'ms-volume_up'" :size="24" />
								</el-button>
								<el-slider v-model="volume" :show-tooltip="false" :width="80" @input="changeVolume" />
							</div>
							<span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
						</div>

						<div class="controls-right">
							<el-button text class="control-btn" @click="changePlaybackRate">
								<span>{{ playbackRate }}x</span>
							</el-button>
							<el-button text class="control-btn" @click="toggleFullscreen">
								<sc-icon :name="isFullscreen ? 'ms-fullscreen_exit' : 'ms-fullscreen'" :size="24" />
							</el-button>
						</div>
					</div>
				</div>

				<div v-if="showCenterPlay" class="center-play-btn" @click="togglePlay">
					<sc-icon name="ms-play_circle" :size="80" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	name: 'Video',
	components: {
		scIcon,
	},
	props: {
		initialFile: {
			type: Object,
			default: null
		}
	},
	data() {
		return {
			currentVideo: null,
			videos: [
				{ id: 1, title: '项目演示视频', duration: '15:30', url: '' },
				{ id: 2, title: '会议录像', duration: '45:20', url: '' },
				{ id: 3, title: '教学视频', duration: '20:15', url: '' },
				{ id: 4, title: '产品介绍', duration: '10:45', url: '' },
			],
			isDragOver: false,
			isPlaying: false,
			isMuted: false,
			isFullscreen: false,
			showCenterPlay: true,
			currentTime: 0,
			duration: 0,
			volume: 100,
			bufferedPercent: 0,
			progressPercent: 0,
			playbackRate: 1,
			playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
			videoIdCounter: 5,
		};
	},
	methods: {
		loadInitialFile() {
			if (this.initialFile && this.initialFile.url) {
				const video = {
					id: this.videoIdCounter++,
					title: this.initialFile.name,
					url: this.initialFile.url,
					duration: '--:--',
				};
				this.videos.push(video);
				this.playVideo(video);
			}
		},
		handleDrop(e) {
			this.isDragOver = false;
			const files = e.dataTransfer.files;
			if (files.length > 0) {
				this.loadVideoFile(files[0]);
			}
		},
		handleFileSelect(e) {
			const files = e.target.files;
			if (files.length > 0) {
				this.loadVideoFile(files[0]);
			}
		},
		openFileDialog() {
			this.$refs.fileInput.click();
		},
		loadVideoFile(file) {
			if (!file.type.startsWith('video/')) {
				this.$message.warning('请选择视频文件');
				return;
			}
			const url = URL.createObjectURL(file);
			const video = {
				id: this.videoIdCounter++,
				title: file.name,
				url: url,
				duration: '',
				poster: '',
			};
			this.videos.unshift(video);
			this.playVideo(video);
		},
		playVideo(video) {
			this.currentVideo = video;
			this.isPlaying = false;
			this.showCenterPlay = true;
			this.currentTime = 0;
			this.progressPercent = 0;
			this.$nextTick(() => {
				if (this.$refs.videoPlayer) {
					this.$refs.videoPlayer.load();
				}
			});
		},
		closePlayer() {
			if (this.$refs.videoPlayer) {
				this.$refs.videoPlayer.pause();
			}
			this.currentVideo = null;
			this.isPlaying = false;
			this.isFullscreen = false;
		},
		removeVideo(id) {
			this.videos = this.videos.filter(v => v.id !== id);
		},
		togglePlay() {
			if (!this.$refs.videoPlayer) return;
			if (this.isPlaying) {
				this.$refs.videoPlayer.pause();
			} else {
				this.$refs.videoPlayer.play();
			}
			this.isPlaying = !this.isPlaying;
			this.showCenterPlay = !this.isPlaying;
		},
		toggleMute() {
			if (!this.$refs.videoPlayer) return;
			this.$refs.videoPlayer.muted = !this.isMuted;
			this.isMuted = !this.isMuted;
		},
		changeVolume(val) {
			if (!this.$refs.videoPlayer) return;
			this.$refs.videoPlayer.volume = val / 100;
			this.isMuted = val === 0;
		},
		updateProgress() {
			if (!this.$refs.videoPlayer) return;
			this.currentTime = this.$refs.videoPlayer.currentTime;
			this.progressPercent = (this.currentTime / this.duration) * 100;
			if (this.$refs.videoPlayer.buffered.length > 0) {
				this.bufferedPercent = (this.$refs.videoPlayer.buffered.end(0) / this.duration) * 100;
			}
		},
		onVideoLoaded() {
			if (!this.$refs.videoPlayer) return;
			this.duration = this.$refs.videoPlayer.duration;
			this.currentVideo.duration = this.formatTime(this.duration);
		},
		onVideoEnded() {
			this.isPlaying = false;
			this.showCenterPlay = true;
		},
		seekVideo(e) {
			if (!this.$refs.videoPlayer || !this.$refs.playerWrapper) return;
			const rect = this.$refs.playerWrapper.getBoundingClientRect();
			const pos = (e.clientX - rect.left) / rect.width;
			this.$refs.videoPlayer.currentTime = pos * this.duration;
		},
		skipBackward() {
			if (!this.$refs.videoPlayer) return;
			this.$refs.videoPlayer.currentTime = Math.max(0, this.$refs.videoPlayer.currentTime - 10);
		},
		skipForward() {
			if (!this.$refs.videoPlayer) return;
			this.$refs.videoPlayer.currentTime = Math.min(this.duration, this.$refs.videoPlayer.currentTime + 10);
		},
		changePlaybackRate() {
			const currentIndex = this.playbackRates.indexOf(this.playbackRate);
			const nextIndex = (currentIndex + 1) % this.playbackRates.length;
			this.playbackRate = this.playbackRates[nextIndex];
			if (this.$refs.videoPlayer) {
				this.$refs.videoPlayer.playbackRate = this.playbackRate;
			}
		},
		toggleFullscreen() {
			if (!this.$refs.playerWrapper) return;
			if (!this.isFullscreen) {
				if (this.$refs.playerWrapper.requestFullscreen) {
					this.$refs.playerWrapper.requestFullscreen();
				} else if (this.$refs.playerWrapper.webkitRequestFullscreen) {
					this.$refs.playerWrapper.webkitRequestFullscreen();
				}
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
			}
		},
		formatTime(seconds) {
			if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			const hours = Math.floor(mins / 60);
			if (hours > 0) {
				return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
			}
			return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
		},
		handleFullscreenChange() {
			this.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
		},
	},
	mounted() {
		document.addEventListener('fullscreenchange', this.handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
		if (this.initialFile) {
			this.loadInitialFile();
		}
	},
	unmounted() {
		document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
		document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
	},
};
</script>

<style scoped>
.video-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #1a1a1a;
	color: #fff;
}

.video-empty {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.drop-zone {
	width: 100%;
	max-width: 500px;
	padding: 60px 40px;
	border: 2px dashed #444;
	border-radius: 12px;
	text-align: center;
	transition: all 0.3s;
	cursor: pointer;
}

.drop-zone:hover,
.drop-zone.drag-over {
	border-color: #409eff;
	background-color: rgba(64, 158, 255, 0.1);
}

.drop-zone p {
	margin: 10px 0;
	color: #999;
}

.drop-zone .hint {
	font-size: 12px;
	color: #666;
}

.video-history {
	width: 100%;
	max-width: 500px;
	margin-top: 30px;
}

.video-history h4 {
	margin-bottom: 15px;
	color: #999;
	font-weight: normal;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.history-item {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 12px;
	background-color: #2a2a2a;
	border-radius: 8px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.history-item:hover {
	background-color: #333;
}

.history-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.history-title {
	font-size: 14px;
}

.history-duration {
	font-size: 12px;
	color: #666;
}

.remove-btn {
	opacity: 0;
	transition: opacity 0.3s;
	color: #999;
}

.history-item:hover .remove-btn {
	opacity: 1;
}

.video-player-container {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.player-header {
	display: flex;
	align-items: center;
	padding: 10px 15px;
	background-color: #252525;
	gap: 15px;
}

.player-header .el-button {
	color: #fff;
}

.video-name {
	flex: 1;
	font-size: 14px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.player-wrapper {
	flex: 1;
	position: relative;
	background-color: #000;
	display: flex;
	align-items: center;
	justify-content: center;
}

.player-wrapper.fullscreen {
	width: 100vw;
	height: 100vh;
}

.video-player {
	max-width: 100%;
	max-height: 100%;
}

.video-controls {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
	padding: 40px 15px 15px;
	opacity: 0;
	transition: opacity 0.3s;
}

.player-wrapper:hover .video-controls {
	opacity: 1;
}

.progress-bar {
	height: 4px;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 2px;
	cursor: pointer;
	position: relative;
	margin-bottom: 15px;
}

.progress-bar:hover {
	height: 6px;
}

.progress-buffered {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.3);
	border-radius: 2px;
}

.progress-played {
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	background-color: #409eff;
	border-radius: 2px;
}

.progress-handle {
	position: absolute;
	top: 50%;
	width: 12px;
	height: 12px;
	background-color: #fff;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	opacity: 0;
	transition: opacity 0.3s;
}

.progress-bar:hover .progress-handle {
	opacity: 1;
}

.controls-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.controls-left,
.controls-right {
	display: flex;
	align-items: center;
	gap: 5px;
}

.control-btn {
	color: #fff !important;
	padding: 8px !important;
}

.control-btn:hover {
	background-color: rgba(255, 255, 255, 0.1) !important;
}

.volume-control {
	display: flex;
	align-items: center;
}

.volume-control .el-slider {
	margin-left: 5px;
}

:deep(.el-slider__runway) {
	background-color: rgba(255, 255, 255, 0.2);
}

:deep(.el-slider__bar) {
	background-color: #409eff;
}

:deep(.el-slider__button) {
	border-color: #fff;
}

.time-display {
	font-size: 13px;
	color: #fff;
	margin-left: 10px;
}

.center-play-btn {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	cursor: pointer;
	opacity: 0.8;
	transition: opacity 0.3s;
}

.center-play-btn:hover {
	opacity: 1;
}
</style>
