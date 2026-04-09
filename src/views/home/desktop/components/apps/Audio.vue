<template>
	<div class="music-app" @dragover.prevent @drop.prevent="handleDrop">
		<div class="app-header">
			<span class="app-title">音频</span>
			<el-button type="primary" size="small" @click="openFileDialog">
				<sc-icon name="ms-add" style="margin-right: 4px;" />
				添加音频
			</el-button>
			<input ref="fileInput" type="file" accept="audio/*" multiple style="display: none;"
				@change="handleFileSelect">
		</div>

		<div v-if="songs.length === 0" class="empty-state" :class="{ 'drag-over': isDragOver }"
			@dragover="isDragOver = true" @dragleave="isDragOver = false" @drop="handleDrop">
			<sc-icon name="ms-music_note" :size="64" />
			<p>拖放音频文件到此处或点击上方按钮添加</p>
			<p class="hint">支持 MP3, WAV, OGG 格式</p>
		</div>

		<div v-else class="music-list">
			<div v-for="(song, index) in songs" :key="song.id" class="song-item"
				:class="{ playing: currentIndex === index }" @click="playSong(index)">
				<div class="song-number">
					<sc-icon v-if="currentIndex === index && isPlaying" name="ms-music_note" :size="16"
						class="playing-icon" />
					<span v-else>{{ index + 1 }}</span>
				</div>
				<div class="song-info">
					<span class="song-title">{{ song.title }}</span>
					<span class="song-artist">{{ song.artist || '未知艺术家' }}</span>
				</div>
				<span class="song-duration">{{ song.duration || '--:--' }}</span>
				<el-button text size="small" class="remove-btn" @click.stop="removeSong(song.id)">
					<sc-icon name="ms-delete" :size="16" />
				</el-button>
			</div>
		</div>

		<div class="player-controls">
			<div class="now-playing">
				<div class="song-cover">
					<sc-icon name="ms-album" :size="32" />
				</div>
				<div class="song-meta">
					<span class="song-title">{{ currentSong?.title || '未播放' }}</span>
					<span class="song-artist">{{ currentSong?.artist || '未知艺术家' }}</span>
				</div>
			</div>

			<div class="progress-bar" @click="seek">
				<div class="progress-played" :style="{ width: progressPercent + '%' }"></div>
			</div>
			<div class="time-display">
				<span>{{ formatTime(currentTime) }}</span>
				<span>{{ formatTime(duration) }}</span>
			</div>

			<div class="controls">
				<el-button text class="control-btn" @click="setPlayMode">
					<sc-icon :name="playModeIcon" :size="20" />
				</el-button>
				<el-button text class="control-btn" @click="prevSong">
					<sc-icon name="ms-skip_previous" :size="28" />
				</el-button>
				<el-button text class="control-btn play-btn" @click="togglePlay">
					<sc-icon :name="isPlaying ? 'ms-pause' : 'ms-play_arrow'" :size="32" />
				</el-button>
				<el-button text class="control-btn" @click="nextSong">
					<sc-icon name="ms-skip_next" :size="28" />
				</el-button>
				<div class="volume-control">
					<el-button text class="control-btn" @click="toggleMute">
						<sc-icon :name="isMuted ? 'ms-volume_off' : 'ms-volume_up'" :size="20" />
					</el-button>
					<el-slider v-model="volume" :show-tooltip="false" :width="80" @input="changeVolume" />
				</div>
			</div>
		</div>

		<audio ref="audioPlayer" @timeupdate="updateProgress" @loadedmetadata="onLoaded" @ended="onEnded"
			@error="onError"></audio>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import { formatDuration } from './utils.js';

export default {
	name: 'Music',
	components: {
		scIcon,
	},
	props: {
		files: { type: Array, default: () => [] },
		index: { type: Number, default: 0 }
	},
	data() {
		return {
			songs: [],
			currentIndex: -1,
			isPlaying: false,
			isMuted: false,
			volume: 80,
			currentTime: 0,
			duration: 0,
			playMode: 'list',
			playModes: ['list', 'single', 'random'],
			isDragOver: false,
			songIdCounter: 1,
		};
	},
	computed: {
		currentSong() {
			return this.songs[this.currentIndex];
		},
		progressPercent() {
			return this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
		},
		playModeIcon() {
			const icons = {
				list: 'ms-repeat',
				single: 'ms-repeat_one',
				random: 'ms-shuffle',
			};
			return icons[this.playMode];
		},
	},
	methods: {
		loadInitialFiles() {
			if (this.files && this.files.length > 0) {
				this.files.forEach(file => {
					this.songs.push({
						id: this.songIdCounter++,
						title: file.name,
						artist: '',
						duration: '',
						url: file.url,
					});
				});
				this.currentIndex = Math.min(this.index, this.songs.length - 1);
				this.$nextTick(() => {
					this.playSong(this.currentIndex);
				});
			}
		},
		handleDrop(e) {
			this.isDragOver = false;
			const files = e.dataTransfer.files;
			this.loadFiles(files);
		},
		handleFileSelect(e) {
			const files = e.target.files;
			this.loadFiles(files);
			e.target.value = '';
		},
		openFileDialog() {
			this.$refs.fileInput.click();
		},
		loadFiles(files) {
			Array.from(files).forEach(file => {
				if (!file.type.startsWith('audio/')) return;

				const url = URL.createObjectURL(file);
				this.songs.push({
					id: this.songIdCounter++,
					title: file.name.replace(/\.[^/.]+$/, ''),
					artist: '',
					duration: '',
					url: url,
				});
			});
		},
		removeSong(id) {
			const index = this.songs.findIndex(s => s.id === id);
			if (index > -1) {
				if (index === this.currentIndex) {
					this.stopPlay();
				}
				URL.revokeObjectURL(this.songs[index].url);
				this.songs.splice(index, 1);
			}
		},
		playSong(index) {
			if (index < 0 || index >= this.songs.length) return;

			this.currentIndex = index;
			this.$nextTick(() => {
				if (this.$refs.audioPlayer && this.currentSong) {
					this.$refs.audioPlayer.src = this.currentSong.url;
					this.$refs.audioPlayer.play().catch(err => {
						console.error('音频播放失败:', err);
						this.$message.error(`无法播放: ${this.currentSong.title}`);
						this.isPlaying = false;
					});
					this.isPlaying = true;
				}
			});
		},
		togglePlay() {
			if (!this.currentSong) {
				if (this.songs.length > 0) {
					this.playSong(0);
				}
				return;
			}

			if (this.isPlaying) {
				this.$refs.audioPlayer?.pause();
			} else {
				this.$refs.audioPlayer?.play();
			}
			this.isPlaying = !this.isPlaying;
		},
		stopPlay() {
			this.$refs.audioPlayer?.pause();
			this.isPlaying = false;
			this.currentTime = 0;
		},
		prevSong() {
			if (this.songs.length === 0) return;
			let index = this.currentIndex - 1;
			if (index < 0) index = this.songs.length - 1;
			this.playSong(index);
		},
		nextSong() {
			if (this.songs.length === 0) return;
			let index;
			if (this.playMode === 'random') {
				index = Math.floor(Math.random() * this.songs.length);
			} else {
				index = this.currentIndex + 1;
				if (index >= this.songs.length) index = 0;
			}
			this.playSong(index);
		},
		setPlayMode() {
			const currentIndex = this.playModes.indexOf(this.playMode);
			const nextIndex = (currentIndex + 1) % this.playModes.length;
			this.playMode = this.playModes[nextIndex];
		},
		toggleMute() {
			this.isMuted = !this.isMuted;
			if (this.$refs.audioPlayer) {
				this.$refs.audioPlayer.muted = this.isMuted;
			}
		},
		changeVolume(val) {
			if (this.$refs.audioPlayer) {
				this.$refs.audioPlayer.volume = val / 100;
			}
		},
		updateProgress() {
			if (this.$refs.audioPlayer) {
				this.currentTime = this.$refs.audioPlayer.currentTime;
			}
		},
		onLoaded() {
			if (this.$refs.audioPlayer && this.currentSong) {
				this.duration = this.$refs.audioPlayer.duration;
				this.currentSong.duration = this.formatTime(this.duration);
			}
		},
		onEnded() {
			if (this.playMode === 'single') {
				this.$refs.audioPlayer.currentTime = 0;
				this.$refs.audioPlayer.play();
			} else {
				this.nextSong();
			}
		},
		onError(e) {
			console.error('音频加载错误:', e);
			this.isPlaying = false;
			if (this.currentSong) {
				this.$message.error(`音频资源无法加载: ${this.currentSong.title}`);
			}
		},
		seek(e) {
			if (!this.$refs.audioPlayer || !this.duration) return;
			const rect = e.currentTarget.getBoundingClientRect();
			const pos = (e.clientX - rect.left) / rect.width;
			this.$refs.audioPlayer.currentTime = pos * this.duration;
		},
		formatTime(seconds) {
			return formatDuration(seconds);
		},
	},
	mounted() {
		if (this.$refs.audioPlayer) {
			this.$refs.audioPlayer.volume = this.volume / 100;
		}
		if (this.files && this.files.length > 0) {
			this.loadInitialFiles();
		}
	},
};
</script>

<style scoped>
.music-app {
	height: 100%;
	display: flex;
	flex-direction: column;
	background-color: #1a1a1a;
	color: #fff;
}

.app-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background-color: #252525;
	border-bottom: 1px solid #333;
}

.app-title {
	font-size: 14px;
	font-weight: 500;
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #666;
}

.empty-state p {
	margin-top: 15px;
}

.empty-state .hint {
	font-size: 12px;
	color: #555;
}

.empty-state.drag-over {
	background-color: rgba(64, 158, 255, 0.1);
	border: 2px dashed #409eff;
	border-radius: 8px;
	margin: 10px;
}

.music-list {
	flex: 1;
	overflow-y: auto;
}

.song-item {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 12px 16px;
	cursor: pointer;
	transition: background-color 0.2s;
	position: relative;
}

.song-item:hover {
	background-color: #2a2a2a;
}

.song-item.playing {
	background-color: rgba(64, 158, 255, 0.1);
}

.song-number {
	width: 30px;
	color: #666;
	font-size: 14px;
	text-align: center;
}

.playing-icon {
	color: #409eff;
	animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {

	0%,
	100% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}
}

.song-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow: hidden;
}

.song-title {
	font-size: 14px;
	color: #fff;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.song-artist {
	font-size: 12px;
	color: #888;
}

.song-duration {
	color: #888;
	font-size: 13px;
}

.remove-btn {
	opacity: 0;
	transition: opacity 0.2s;
	color: #888 !important;
}

.song-item:hover .remove-btn {
	opacity: 1;
}

.player-controls {
	background-color: #252525;
	border-top: 1px solid #333;
	padding: 15px;
}

.now-playing {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
}

.song-cover {
	width: 48px;
	height: 48px;
	background-color: #333;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #666;
}

.song-meta {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow: hidden;
}

.song-meta .song-title {
	font-size: 14px;
	font-weight: 500;
}

.song-meta .song-artist {
	font-size: 12px;
}

.progress-bar {
	height: 4px;
	background-color: #333;
	border-radius: 2px;
	cursor: pointer;
	margin-bottom: 8px;
}

.progress-bar:hover {
	height: 6px;
}

.progress-played {
	height: 100%;
	background-color: #409eff;
	border-radius: 2px;
}

.time-display {
	display: flex;
	justify-content: space-between;
	font-size: 11px;
	color: #888;
	margin-bottom: 12px;
}

.controls {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8px;
}

.control-btn {
	color: #fff !important;
	padding: 8px !important;
}

.control-btn:hover {
	background-color: rgba(255, 255, 255, 0.1) !important;
}

.play-btn {
	color: #409eff !important;
}

.volume-control {
	display: flex;
	align-items: center;
	margin-left: 10px;
	gap: 8px;
}

.volume-control .el-slider {
	flex-shrink: 0;
	width: 80px;
}

:deep(.el-slider__runway) {
	background-color: #333;
}

:deep(.el-slider__bar) {
	background-color: #409eff;
}

:deep(.el-slider__button) {
	border-color: #fff;
}
</style>
