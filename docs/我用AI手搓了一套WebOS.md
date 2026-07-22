# 我用AI手搓了一套WebOS

> 题记：有时候做东西不需要想清楚"有什么用"，先做出来了，它自然会有自己的位置。

## 一、缘起

我手头有个后台项目，Vue 3.5 + Vite 8 + Element Plus 2.13，纯 JS。原本是标准的中后台：左菜单、顶导航、标签页、表单表格。用着用着觉得这种方式太"累"——每打开一个功能就切一次页面，窗口和状态散在各处。

于是想：能不能把这套系统装进一个"桌面"里？有壁纸、有图标、有窗口、有任务栏，像 Windows 或 macOS 一样，所有业务功能变成可拖动、最小化、最大化的"应用"。结果一发不可收拾。

## 二、架构

- **桌面壳**：`index.vue` 负责壁纸、图标区、任务栏/Dock、开始菜单、右键菜单、主题调度。
- **窗口管理器**：`Window.vue` 单文件组件，拖拽、缩放、最大化、最小化、焦点管理、应用内通信。
- **应用层**：`components/apps/` 下每个应用一个 `.vue`，通过 `import.meta.glob` 按需加载。
- **菜单动态注入**：应用全部来自后端菜单接口，不是写死的玩具，而是真正能接入业务系统的壳。

## 三、主题系统：30+套，但 Windows XP 才是我的执念

所有视觉变量收敛到一个 `themes` 数组，新增主题就是加一个 JSON 对象。目前内置 30 多套，分三类：

### 抽象风格（12套）

不模仿任何操作系统，靠颜色和质感营造氛围：默认、深色、浅色、极光、午夜、海洋、森林、玫瑰、琥珀、薄荷、紫罗兰、中国紫。

![主题设置面板](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/themes/desktop-theme-setting.png)

### Windows 历代（9套）—— 重点在这里

这部分花的时间最多，因为不同版本的 Windows 差异极大，每套不只是换壁纸，而是真的复刻了对应版本的开始菜单布局、按钮形态、窗口边框。

- **Win95 / 98 / 2000**：经典灰蓝开始菜单，侧边栏，复古到底。
- **WinXP**：Luna 蓝双栏开始菜单，带用户头像区域——**这是我最花心思的一套**。
- **Vista / 7**：Aero 玻璃效果，任务栏和窗口带模糊透明。
- **Win8**：全屏磁贴开始屏幕。
- **Win10**：左侧程序 + 右侧磁贴。
- **Win11**：居中圆角网格菜单。

![Windows 11 桌面](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/themes/desktop-theme_win11.png)

**关于 XP 主题**，我必须多说几句。

2001 年，Windows XP 发布。那片蓝天绿地壁纸（Bliss）可能是全世界被看次数最多的照片。Luna 蓝的标题栏渐变、圆润的绿色开始按钮、双栏开始菜单左边的用户头像区、底部"注销 / 关闭计算机"的橙色条——这些细节刻在了很多人的记忆里。

做 XP 主题的时候，我不是在"设计"一个界面，而是在**还原一段记忆**。每一个像素都得对：标题栏渐变从哪种蓝色到哪种蓝色？关闭按钮的红色是 `#E05252` 还是偏暗一点？开始菜单左边那个蓝色大条的高度比例是多少？任务栏的蓝绿渐变分界线在哪里？这些问题没有文档可以查，只有记忆和截图可以对照。

![Windows XP 桌面](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/themes/desktop-theme_winxp.png)

XP 的窗口标题栏我用了专门的 CSS 变量体系来驱动：`--xpHeader`、`--xpBtnSize`、`--xpClose`、`--xpGlyphColor`、`--xpFrame`……所有视觉参数都从主题数据对象传入，不写死任何颜色值。这样做的好处是：同一种 `xp` 窗口风格引擎，换一组参数就能变成 Win95 的灰色、Win98 的青绿、Win2000 的深蓝——它们共享一套"经典 Windows 窗口"渲染逻辑，只是调色不同。

当 XP 主题在浏览器里跑起来的时候，看到那个 Luna 蓝的开始菜单、蓝天绿地的壁纸、圆润的绿色按钮，恍惚间真的像是回到了坐在CRT显示器前写作业的下午。

### macOS 历代（12+套）—— 还在完善中

macOS 主题的精髓在 Dock、menubar 和窗口动画。目前已经做了从 Mac OS 9 到 macOS Tahoe 的系列框架：Dock 缩放、Launchpad 启动台、红黄绿交通灯标题栏、弹入动画和精灵效果最小化。

![macOS Tahoe 主题](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/themes/desktop-theme_mactahoe.png)

**但说实话，macOS 主题还在打磨中。** macOS 的视觉细节比 Windows 更微妙——Aqua 水滴按钮的折射感、毛玻璃的分层透明、Dock 图标的反射倒影、Yosemite 之后的扁平化过渡……这些在 CSS 里很难精确还原。目前 macOS 主题的骨架和交互逻辑已经完成，但视觉精度还差几口气，后续会持续迭代。

## 四、最难的部分：图标资源和视觉复刻

说到难，不是代码难，是**素材难**。

### 图标资源：全网搜不到的角落

每个操作系统都有自己的一套图标语言：Win95 的 16 色 32×32 像素图标、XP 的 32 位彩色图标、Vista/7 开始引入的大尺寸 PNG 图标、macOS 的 512×512 Retina 图标。这些图标不像壁纸那样容易找到——壁纸有人收藏、有人分享，但系统图标散落在 DLL、EXE、`.icns` 文件里，没有现成的提取合集。

我花了很多时间从系统资源文件里提取图标，还要处理格式转换、尺寸统一、透明通道保留。有些经典图标（比如 XP 的"我的电脑"、Win98 的"回收站"）全网几乎找不到高清版本，只能从低分辨率截图里手工修复。macOS 的图标更麻烦——Apple 的设计规范极其严格，每个图标的圆角半径、阴影方向、反光角度都有规定，做偏了一像素就能看出"不对"。

### 视觉样式复刻：像素级的考古

复刻一个操作系统的视觉样式，不是"大概像就行"。用户对 Windows 和 macOS 的界面有肌肉记忆——任务栏的高度、按钮的内边距、菜单的阴影方向、窗口边框的粗细，这些细节偏了哪怕 2px，用户就会觉得"这不是我认识的那个系统"。

最折磨人的是开始菜单。Windows 从 95 到 11，每代开始菜单的布局逻辑都不同：95 的单列弹出、XP 的双栏分区、Vista 的搜索框、8 的全屏磁贴、11 的居中网格。同一个菜单数据源，要根据当前主题自动切换呈现形态——这是整个项目里最繁琐但也最有成就感的部分。

![开始菜单](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-07-desktop-startmenu.png)

窗口系统也做了四种标题栏风格来适配：现代 Windows、经典 Windows（95/98/2000/XP 共用引擎）、macOS 交通灯、Mac OS 9 白金。每个风格的按钮尺寸、圆角、阴影、边框都通过 `windowTheme` 数据驱动。

## 五、内置应用

`components/apps/` 下已经做了 14 个应用：云空间、记事本、图像查看器、音频、视频、日历、浏览器、计算器、扫雷、2048、终端、待办、个人信息、设置。它们是 Vue 组件，不是 iframe，能通过事件和桌面壳实时通信。

![记事本](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-10-notepad.png)

![图片](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-11-image.png)

![音乐](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-12-audio.png)

![待办](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-13-gtd.png)

![扫雷](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-16-minesweeper.png)

![2048](https://gitee.com/leadiot/scm.vue/raw/master/screenshots/wos-17-2048.png)

## 六、踩坑与收获

**踩坑**：早期样式写太散，加主题要改多处，后来改成 `themes` 数据 + CSS 变量统一驱动才解套；窗口动画用 transition 卡，改用 Web Animations API + FLIP 处理；macOS 最小化还原时出现"窗口消失"bug，是 `fill: forwards` 锁住了状态，加了 `cancelElementAnimations` 清残留。

**收获**：主题数据化，新增主题就是加 JSON；窗口和桌面解耦，`Window.vue` 不知道自己在哪个主题里；应用动态加载，`import.meta.glob` 按需解析。

## 七、下一步

- 更多后台业务模块封装成桌面应用
- 桌面图标自由布局、窗口边缘吸附分屏
- 多桌面（虚拟桌面）
- 主题编辑器，用户自己调色保存
- macOS 主题视觉精度持续打磨

---

意义不在于"像"，而在于**把人机交互的熟悉感带到 Web 应用里**。用户看到桌面、图标、窗口，就知道该怎么用。何况，能在浏览器里一键切回 XP 的蓝天绿地，本身就挺酷的。

如果你对这套 WebOS 有想法——不管是主题建议、交互细节、新应用创意，还是"这个按钮的颜色不对"——都欢迎提出来。图标资源的补充、macOS 主题的打磨、更多经典操作系统的复刻，这些都不是一个人能干完的事，有兴趣一起完善的随时可以聊。

*写完这篇的时候，我又切回了 XP 主题，看着 Luna 蓝的开始菜单和那片蓝天绿地，恍惚间像是回到了坐在 CRT 前的下午。*
