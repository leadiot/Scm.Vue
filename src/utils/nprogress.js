/*
 * NProgress 兼容实现（替代停更的 nprogress-esm）
 * 仅实现项目使用的 API：start() / done()
 * 视觉效果与 nprogress 默认主题一致（顶部蓝色进度条）
 */

let started = false;
let timer = null;
let progress = 0;

const STYLE_ID = '__nprogress_style__';
const BAR_ID = 'nprogress';

const CSS = `
#${BAR_ID} {
  pointer-events: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}
#${BAR_ID} .bar {
  background: #29d;
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  width: 0;
  z-index: 9999;
  transition: width 0.2s ease, opacity 0.4s ease;
  box-shadow: 0 0 10px #29d, 0 0 5px #29d;
}
`;

function injectStyle() {
	if (!document.getElementById(STYLE_ID)) {
		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.textContent = CSS;
		document.head.appendChild(style);
	}
}

function getBar() {
	let el = document.getElementById(BAR_ID);
	if (!el) {
		el = document.createElement('div');
		el.id = BAR_ID;
		el.innerHTML = '<div class="bar"></div>';
		document.body.appendChild(el);
	}
	return el.querySelector('.bar');
}

function set(n) {
	progress = n;
	const bar = getBar();
	bar.style.width = (n * 100) + '%';
	bar.style.opacity = 1;
}

function start() {
	if (started) return;
	started = true;
	injectStyle();
	set(0.3);
	timer = setInterval(() => {
		if (progress < 0.9) {
			set(progress + (0.9 - progress) * 0.1);
		}
	}, 200);
}

function done() {
	if (!started) return;
	clearInterval(timer);
	timer = null;
	set(1);
	started = false;
	setTimeout(() => {
		const bar = document.querySelector(`#${BAR_ID} .bar`);
		if (bar) bar.style.opacity = 0;
	}, 200);
}

export default { start, done };
