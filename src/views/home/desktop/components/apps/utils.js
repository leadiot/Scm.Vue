export const AVATAR_COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#00bcd4'];

export function formatDuration(seconds) {
	if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	const hours = Math.floor(mins / 60);
	if (hours > 0) {
		return `${hours}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
	return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function getAvatarColor(id) {
	return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length];
}

export function getRandomColor() {
	return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function getCurrentTime() {
	const now = new Date();
	return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
