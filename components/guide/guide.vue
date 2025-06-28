<template>
	<view class="guide-container" v-if="showGuide" @click.stop="handleContainerClick">
		<!-- 遮罩层 -->
		<view class="guide-mask" :style="maskStyle"></view>
		
		<!-- 高亮区域 -->
		<view 
			class="guide-highlight" 
			:style="highlightStyle"
			@click.stop="nextStep"
		></view>
		
		<!-- 指引内容卡片 -->
		<view class="guide-card" :style="cardStyle" @click.stop="">
			<view class="guide-header">
				<text class="guide-title">{{ currentStep.title }}</text>
				<view class="guide-progress">
					<text class="guide-step">{{ currentStepIndex + 1 }}/{{ guideSteps.length }}</text>
				</view>
			</view>
			
			<view class="guide-content">
				<text class="guide-description">{{ currentStep.description }}</text>
			</view>
			
			<view class="guide-actions">
				<view class="guide-btn guide-btn-skip" @click.stop="skipGuide" v-if="currentStepIndex < guideSteps.length - 1">
					跳过引导
				</view>
				<view class="guide-btn guide-btn-next" @click.stop="nextStep">
					{{ currentStepIndex < guideSteps.length - 1 ? '下一步' : '完成' }}
				</view>
			</view>
		</view>
		
		<!-- 指示箭头 -->
		<view class="guide-arrow" :style="arrowStyle" :class="arrowDirection"></view>
	</view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['close', 'complete']);

const showGuide = ref(false);
const currentStepIndex = ref(0);
const screenInfo = ref({
	width: 375,
	height: 667,
	statusBarHeight: 44
});

// 当前目标元素的响应式状态
const currentTargetElement = ref(null);

// 指引步骤配置
const guideSteps = ref([
	{
		title: '欢迎使用真心话大冒险！',
		description: '这是一个有趣的聚会游戏，让我们一起来了解如何使用吧！',
		target: '',
		position: 'center'
	},
	{
		title: '选择游戏模式',
		description: '点击"真心话"或"大冒险"来选择游戏模式。真心话是回答问题，大冒险是完成挑战任务。',
		target: '.mode-buttons',
		position: 'bottom'
	},
	{
		title: '添加游戏内容',
		description: '在下方高亮区域的输入框中添加自定义内容，然后点击"添加"按钮保存。让游戏更加个性化！',
		target: '.input-group',
		position: 'bottom'
	},
	{
		title: '导入默认内容',
		description: '如果你不想自己添加内容，可以点击"导入默认内容"按钮，系统会为你添加10个精选内容。',
		target: '.import-btn',
		position: 'bottom'
	},
	{
		title: '查看已添加内容',
		description: '在这里可以看到所有已添加的内容。当前模式下有至少3个内容时，下方就会出现转盘。你可以添加更多内容！',
		target: '.item-list',
		position: 'top'
	},
	{
		title: '开始游戏',
		description: '当内容足够时，转盘会出现在这个位置。点击"开始旋转"来随机选择一个任务！',
		target: '.wheel-section',
		position: 'top'
	},
	{
		title: '数据管理',
		description: '在底部可以查看历史记录，还能清空数据或重置应用。这些功能帮助你更好地管理游戏数据。',
		target: '',
		position: 'center'
	},
	{
		title: '开始享受游戏吧！',
		description: '现在你已经了解了所有功能，快去和朋友们一起享受真心话大冒险的乐趣吧！',
		target: '',
		position: 'center'
	}
]);

const currentStep = computed(() => guideSteps.value[currentStepIndex.value]);

// 获取屏幕信息
onMounted(() => {
	getSystemInfo();
	if (props.show) {
		startGuide();
	}
});

const getSystemInfo = () => {
	uni.getSystemInfo({
		success: (res) => {
			screenInfo.value = {
				width: res.windowWidth,
				height: res.windowHeight,
				statusBarHeight: res.statusBarHeight || 44
			};
			console.log('屏幕信息:', screenInfo.value); // 调试用
		},
		fail: (err) => {
			console.error('获取屏幕信息失败:', err);
			// 设置默认值
			screenInfo.value = {
				width: 375,
				height: 667,
				statusBarHeight: 44
			};
		}
	});
};

const startGuide = async () => {
	currentStepIndex.value = 0;
	showGuide.value = true;
	// 重新获取屏幕信息确保位置计算准确
	getSystemInfo();
	
	// 等待DOM更新后更新目标元素位置
	await nextTick();
	await updateCurrentTarget();
};

const nextStep = async () => {
	if (currentStepIndex.value < guideSteps.value.length - 1) {
		// 切换到下一步
		currentStepIndex.value++;
		
		// 等待DOM更新
		await nextTick();
		
		// 更新目标元素位置（包含自动滚动）
		await updateCurrentTarget();
	} else {
		completeGuide();
	}
};

const skipGuide = () => {
	completeGuide();
};

const completeGuide = () => {
	showGuide.value = false;
	emit('complete');
	
	// 保存用户已完成新手指引的状态
	try {
		uni.setStorageSync('truth-or-dare-guide-completed', true);
	} catch (e) {
		console.error('保存指引状态失败:', e);
	}
};

const handleContainerClick = (e) => {
	// 点击遮罩层关闭指引
	if (e.target === e.currentTarget) {
		skipGuide();
	}
};

// 计算遮罩样式
const maskStyle = computed(() => {
	const target = currentTargetElement.value;
	if (!target) {
		return {
			background: 'rgba(0, 0, 0, 0.7)'
		};
	}
	
	const { top, left, width, height } = target;
	const padding = 10;
	
	// 创建带有高亮区域的遮罩
	const clipPath = `polygon(
		0% 0%, 
		0% 100%, 
		${left - padding}px 100%, 
		${left - padding}px ${top - padding}px, 
		${left + width + padding}px ${top - padding}px, 
		${left + width + padding}px ${top + height + padding}px, 
		${left - padding}px ${top + height + padding}px, 
		${left - padding}px 100%, 
		100% 100%, 
		100% 0%
	)`;
	
	return {
		background: 'rgba(0, 0, 0, 0.7)',
		clipPath
	};
});

// 计算高亮区域样式
const highlightStyle = computed(() => {
	const target = currentTargetElement.value;
	if (!target) return { display: 'none' };
	
	const { top, left, width, height } = target;
	const padding = 10;
	
	return {
		position: 'fixed',
		top: `${top - padding}px`,
		left: `${left - padding}px`,
		width: `${width + padding * 2}px`,
		height: `${height + padding * 2}px`,
		borderRadius: '12rpx',
		border: '4rpx solid #FF6B6B',
		boxShadow: '0 0 20rpx rgba(255, 107, 107, 0.6)',
		pointerEvents: 'none',
		zIndex: 998
	};
});

// 计算指引卡片样式
const cardStyle = computed(() => {
	const target = currentTargetElement.value;
	const margin = 30; // 左右边距
	const cardHeight = 280; // 减小基础高度
	
	let top, left;
	
	if (!target || currentStep.value.position === 'center') {
		// 居中显示
		top = Math.max(100, (screenInfo.value.height - cardHeight) / 2);
		left = margin;
	} else {
		const { top: targetTop, left: targetLeft, width: targetWidth, height: targetHeight } = target;
		const padding = 20; // 减小间距使指引更贴近目标
		
		if (currentStep.value.position === 'bottom') {
			top = targetTop + targetHeight + padding;
			// 确保卡片不超出屏幕边界
			if (top + cardHeight > screenInfo.value.height - 60) {
				top = Math.max(screenInfo.value.statusBarHeight + 100, targetTop - cardHeight - padding);
			}
		} else if (currentStep.value.position === 'top') {
			top = Math.max(screenInfo.value.statusBarHeight + 80, targetTop - cardHeight - padding);
		}
		
		// 使用固定左边距确保布局一致
		left = margin;
	}
	
	return {
		position: 'fixed',
		top: `${top}px`,
		left: `${left}px`,
		right: `${margin}px`, // 添加右边距确保布局对称
		width: `calc(100% - ${margin * 2}px)`, // 使用calc确保准确的宽度计算
		minHeight: `${cardHeight}px`,
		zIndex: 997,
		boxSizing: 'border-box'
	};
});

// 计算箭头样式和方向
const arrowStyle = computed(() => {
	const target = currentTargetElement.value;
	if (!target || currentStep.value.position === 'center') {
		return { display: 'none' };
	}
	
	const { top: targetTop, left: targetLeft, width: targetWidth, height: targetHeight } = target;
	
	let top, left;
	
	if (currentStep.value.position === 'bottom') {
		top = targetTop + targetHeight + 20;
		left = targetLeft + targetWidth / 2 - 15;
	} else if (currentStep.value.position === 'top') {
		top = targetTop - 30;
		left = targetLeft + targetWidth / 2 - 15;
	}
	
	return {
		position: 'fixed',
		top: `${top}px`,
		left: `${left}px`,
		zIndex: 998
	};
});

const arrowDirection = computed(() => {
	if (currentStep.value.position === 'bottom') return 'arrow-up';
	if (currentStep.value.position === 'top') return 'arrow-down';
	return '';
});

// 尝试获取真实DOM元素位置的辅助函数
const tryGetRealElementPosition = (selector) => {
	return new Promise((resolve) => {
		// 使用nextTick确保DOM已更新
		nextTick(() => {
			const query = uni.createSelectorQuery();
			query.select(selector).boundingClientRect((rect) => {
				if (rect && rect.width > 0 && rect.height > 0) {
					console.log(`获取到 ${selector} 的真实位置:`, rect);
					resolve({
						top: rect.top,
						left: rect.left,
						width: rect.width,
						height: rect.height
					});
				} else {
					console.log(`无法获取 ${selector} 的真实位置，元素可能不存在或不可见`);
					resolve(null);
				}
			}).exec();
		});
	});
};

// 获取当前目标元素的位置信息
const getCurrentTargetElement = async () => {
	if (!currentStep.value.target) return null;
	
	// 首先尝试获取真实DOM位置
	try {
		const realPosition = await tryGetRealElementPosition(currentStep.value.target);
		if (realPosition) {
			return realPosition;
		}
	} catch (error) {
		console.log('获取真实位置失败，使用预估位置:', error);
	}
	
	// 如果无法获取真实位置，使用预估位置
	return getEstimatedPosition(currentStep.value.target);
};

// 预估位置计算函数
const getEstimatedPosition = (target) => {
	// 基于屏幕信息和实际布局动态计算位置
	const screenWidth = screenInfo.value.width;
	const screenHeight = screenInfo.value.height;
	const statusBarHeight = screenInfo.value.statusBarHeight;
	
	// 考虑容器内边距和实际布局的精确位置计算
	const containerPadding = 30; // 容器的内边距
	const cardPadding = 30; // 卡片的内边距
	const cardMarginBottom = 30; // 卡片之间的间距
	
	// 基于实际页面结构的位置计算
	let cumulativeTop = statusBarHeight + 100; // 导航栏下方起始位置
	
	// 第一个卡片：模式选择器
	const modeCardTop = cumulativeTop;
	const modeCardHeight = 120;
	cumulativeTop += modeCardHeight + cardMarginBottom;
	
	// 第二个卡片：添加内容
	const addContentCardTop = cumulativeTop;
	const addContentCardHeight = 300; // 包含输入框、按钮和列表
	cumulativeTop += addContentCardHeight + cardMarginBottom;
	
	// 转盘区域（如果存在）
	const wheelSectionTop = cumulativeTop;
	
	// 精确的位置计算
	const positions = {
		'.mode-buttons': { 
			top: modeCardTop + cardPadding + 40, // 卡片内标题下方
			left: containerPadding + cardPadding, 
			width: screenWidth - (containerPadding + cardPadding) * 2, 
			height: 80 
		},
		'.input-group': { 
			top: addContentCardTop + cardPadding + 40, // 添加内容卡片中的输入框
			left: containerPadding + cardPadding, 
			width: screenWidth - (containerPadding + cardPadding) * 2, 
			height: 60 
		},
		'.import-btn': { 
			top: addContentCardTop + cardPadding + 40 + 60 + 20, // 输入框下方的按钮
			left: containerPadding + cardPadding, 
			width: (screenWidth - (containerPadding + cardPadding) * 2) / 2 - 10, 
			height: 60 
		},
		'.item-list': { 
			top: addContentCardTop + cardPadding + 40 + 60 + 80 + 20, // 按钮下方的列表
			left: containerPadding + cardPadding, 
			width: screenWidth - (containerPadding + cardPadding) * 2, 
			height: 150 
		},
		'.wheel-section': { 
			top: wheelSectionTop + cardPadding, // 转盘卡片区域
			left: containerPadding + cardPadding, 
			width: screenWidth - (containerPadding + cardPadding) * 2, 
			height: 300 
		},
		'.history-list': { 
			top: screenHeight - 300, 
			left: containerPadding + cardPadding, 
			width: screenWidth - (containerPadding + cardPadding) * 2, 
			height: 200 
		}
	};
	
	console.log(`预估位置 ${target}:`, positions[target]);
	return positions[target] || null;
};

// 更新目标元素位置
const updateCurrentTarget = async () => {
	const target = await getCurrentTargetElement();
	currentTargetElement.value = target;
	console.log('目标元素位置更新:', target);
	
	// 使用简化的滚动确保目标元素可见
	if (target && currentStep.value.position !== 'center') {
		await scrollToTarget(target);
	}
};

// 计算页面滚动相关的响应式状态
const scrollTop = ref(0);
const isScrolling = ref(false);

// 获取当前页面滚动位置
const getCurrentScrollTop = () => {
	return new Promise((resolve) => {
		const query = uni.createSelectorQuery();
		query.selectViewport().scrollOffset((res) => {
			resolve(res.scrollTop || 0);
		}).exec();
	});
};

// 简化的滚动到指定位置
const scrollToPosition = (targetScrollTop, duration = 500) => {
	return new Promise((resolve) => {
		if (isScrolling.value) {
			resolve();
			return;
		}
		
		isScrolling.value = true;
		console.log('开始滚动到位置:', targetScrollTop);
		
		uni.pageScrollTo({
			scrollTop: targetScrollTop,
			duration: duration,
			success: () => {
				console.log('滚动完成');
				scrollTop.value = targetScrollTop;
				isScrolling.value = false;
				resolve();
			},
			fail: (error) => {
				console.error('滚动失败:', error);
				isScrolling.value = false;
				resolve();
			}
		});
	});
};

// 简化的滚动到目标元素
const scrollToTarget = async (target) => {
	if (!target) return;
	
	try {
		const currentScrollTop = await getCurrentScrollTop();
		scrollTop.value = currentScrollTop;
		
		const viewportHeight = screenInfo.value.height;
		const statusBarHeight = screenInfo.value.statusBarHeight;
		
		const { top, height } = target;
		const elementCenter = top + height / 2;
		const viewportCenter = currentScrollTop + viewportHeight / 2;
		
		// 简单判断：如果元素不在屏幕中央区域，就滚动让它居中
		const centerThreshold = viewportHeight * 0.3; // 中央30%区域
		const topBoundary = currentScrollTop + centerThreshold;
		const bottomBoundary = currentScrollTop + viewportHeight - centerThreshold;
		
		console.log('滚动检查:', {
			elementTop: top,
			elementCenter,
			viewportCenter,
			topBoundary,
			bottomBoundary,
			needScroll: top < topBoundary || (top + height) > bottomBoundary
		});
		
		if (top < topBoundary || (top + height) > bottomBoundary) {
			// 计算目标滚动位置，让元素在屏幕中央
			const targetScrollTop = elementCenter - viewportHeight / 2;
			const finalScrollTop = Math.max(0, targetScrollTop);
			
			console.log('滚动到位置:', finalScrollTop);
			await scrollToPosition(finalScrollTop, 500);
		}
		
	} catch (error) {
		console.error('滚动到目标失败:', error);
	}
};

// 智能滚动判断 - 考虑指引卡片的位置
const smartScrollToTarget = async (target) => {
	if (!target) return;
	
	try {
		const currentScrollTop = await getCurrentScrollTop();
		scrollTop.value = currentScrollTop;
		
		const viewportHeight = screenInfo.value.height;
		const statusBarHeight = screenInfo.value.statusBarHeight;
		const cardHeight = 280; // 指引卡片高度
		const padding = 20; // 卡片与目标的间距
		
		const { top, height, position } = { ...target, position: currentStep.value.position };
		
		// 计算指引卡片将要出现的位置
		let guideCardTop;
		if (position === 'bottom') {
			guideCardTop = top + height + padding;
		} else if (position === 'top') {
			guideCardTop = top - cardHeight - padding;
		} else {
			// center 位置
			guideCardTop = (viewportHeight - cardHeight) / 2;
		}
		
		// 计算目标元素和指引卡片的总体边界
		const totalTop = Math.min(top, guideCardTop);
		const totalBottom = Math.max(top + height, guideCardTop + cardHeight);
		const totalHeight = totalBottom - totalTop;
		
		// 安全区域
		const safeTop = statusBarHeight + 60;
		const safeBottom = viewportHeight - 60;
		const safeHeight = safeBottom - safeTop;
		
		// 相对于当前视窗的位置
		const relativeTop = totalTop - currentScrollTop;
		const relativeBottom = totalBottom - currentScrollTop;
		
		console.log('智能滚动分析:', {
			totalTop, totalBottom, totalHeight,
			safeTop, safeBottom, safeHeight,
			relativeTop, relativeBottom,
			needScroll: false
		});
		
		let needScroll = false;
		let targetScrollTop = currentScrollTop;
		
		// 如果总体内容太高，无法完全在安全区域内显示
		if (totalHeight > safeHeight) {
			// 优先显示目标元素
			if (relativeTop < safeTop) {
				needScroll = true;
				targetScrollTop = top - safeTop;
			} else if (relativeTop + height > safeBottom) {
				needScroll = true;
				targetScrollTop = top + height - safeBottom;
			}
		} else {
			// 总体内容可以完全显示，居中显示
			if (relativeTop < safeTop || relativeBottom > safeBottom) {
				needScroll = true;
				const centerPosition = (safeTop + safeBottom - totalHeight) / 2;
				targetScrollTop = totalTop - centerPosition;
			}
		}
		
		if (needScroll) {
			console.log('执行智能滚动到位置:', targetScrollTop);
			await scrollToPosition(Math.max(0, targetScrollTop), 400);
		}
		
	} catch (error) {
		console.error('智能滚动失败:', error);
	}
};

// 简化的页面滚动监听
const addScrollListener = () => {
	// 定期检查滚动位置
	if (!scrollCheckInterval.value) {
		scrollCheckInterval.value = setInterval(async () => {
			if (showGuide.value) {
				const currentTop = await getCurrentScrollTop();
				scrollTop.value = currentTop;
			}
		}, 100); // 每100ms检查一次
	}
};

// 移除页面滚动监听
const removeScrollListener = () => {
	if (scrollCheckInterval.value) {
		clearInterval(scrollCheckInterval.value);
		scrollCheckInterval.value = null;
	}
};

// 滚动检查定时器
const scrollCheckInterval = ref(null);

// 监听页面滚动事件
onMounted(() => {
	// 初始化滚动位置
	getCurrentScrollTop().then(scrollTop => {
		scrollTop.value = scrollTop;
	});
});

// 监听步骤变化，更新目标元素
watch(currentStepIndex, async () => {
	await nextTick();
	await updateCurrentTarget();
});

// 监听指引显示状态变化
watch(showGuide, (newVal) => {
	if (newVal) {
		addScrollListener();
		setTimeout(async () => {
			await updateCurrentTarget();
		}, 300);
	} else {
		removeScrollListener();
	}
});

// 监听show属性变化
watch(() => props.show, (newVal) => {
	if (newVal) {
		startGuide();
	} else {
		showGuide.value = false;
	}
});

// 组件卸载时清理
onUnmounted(() => {
	removeScrollListener();
});

// 开发模式下的调试信息
const debugInfo = computed(() => {
	if (!currentTargetElement.value) return null;
	
	return {
		currentStep: currentStepIndex.value + 1,
		targetSelector: currentStep.value.target,
		scrollTop: scrollTop.value,
		targetPosition: currentTargetElement.value,
		isScrolling: isScrolling.value
	};
});

// 添加调试模式切换（可选）
const showDebugInfo = ref(false); // 可以改为 true 来显示调试信息

// 测试滚动功能
const testScroll = async () => {
	console.log('测试滚动功能');
	const currentTop = await getCurrentScrollTop();
	console.log('当前滚动位置:', currentTop);
	
	// 尝试滚动到页面底部
	await scrollToPosition(500, 1000);
	
	// 等待一秒后滚动回顶部
	setTimeout(async () => {
		await scrollToPosition(0, 1000);
	}, 2000);
};

// 在开发模式下可以调用 testScroll() 来测试滚动功能

// 暴露方法
defineExpose({
	startGuide,
	skipGuide,
	completeGuide
});
</script>

<style scoped>
.guide-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	box-sizing: border-box;
}

.guide-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
}

.guide-highlight {
	position: absolute;
	border: 4rpx solid #FF6B6B;
	border-radius: 12rpx;
	box-shadow: 0 0 20rpx rgba(255, 107, 107, 0.6);
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 20rpx rgba(255, 107, 107, 0.6);
	}
	50% {
		box-shadow: 0 0 30rpx rgba(255, 107, 107, 0.9);
	}
	100% {
		box-shadow: 0 0 20rpx rgba(255, 107, 107, 0.6);
	}
}

.guide-card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.3);
	animation: slideIn 0.3s ease-out;
	box-sizing: border-box;
	width: 100%;
	margin: 0;
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: scale(0.8);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.guide-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.guide-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.guide-progress {
	background: #FF6B6B;
	color: #fff;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.guide-step {
	font-weight: bold;
}

.guide-content {
	margin-bottom: 40rpx;
}

.guide-description {
	font-size: 30rpx;
	line-height: 1.6;
	color: #666;
}

.guide-actions {
	display: flex;
	justify-content: space-between;
	gap: 20rpx;
	width: 100%;
	box-sizing: border-box;
}

.guide-btn {
	flex: 1;
	padding: 20rpx 0;
	text-align: center;
	border-radius: 12rpx;
	font-size: 30rpx;
	font-weight: bold;
	transition: all 0.2s;
	box-sizing: border-box;
	min-width: 0; /* 确保flex项目能够正确收缩 */
}

.guide-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.guide-btn-skip {
	background: #f0f0f0;
	color: #666;
}

.guide-btn-next {
	background: #FF6B6B;
	color: #fff;
}

.guide-arrow {
	width: 30rpx;
	height: 30rpx;
	position: fixed;
	z-index: 998;
}

.arrow-up {
	border-left: 15rpx solid transparent;
	border-right: 15rpx solid transparent;
	border-bottom: 20rpx solid #FF6B6B;
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.3));
}

.arrow-down {
	border-left: 15rpx solid transparent;
	border-right: 15rpx solid transparent;
	border-top: 20rpx solid #FF6B6B;
	filter: drop-shadow(0 -2rpx 4rpx rgba(0, 0, 0, 0.3));
}

/* 响应式样式调整 */
@media screen and (max-width: 480rpx) {
	.guide-card {
		padding: 30rpx;
		border-radius: 15rpx;
	}
	
	.guide-title {
		font-size: 32rpx;
	}
	
	.guide-description {
		font-size: 28rpx;
	}
}

@media screen and (min-width: 768rpx) {
	.guide-card {
		padding: 50rpx;
		border-radius: 25rpx;
	}
}
</style>
