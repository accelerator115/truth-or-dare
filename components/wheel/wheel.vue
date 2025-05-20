<template>
	<view class="wheel-container">
		<view class="wheel" :style="{ transform: `rotate(${rotation}deg)` }" @touchstart.prevent="handleTouchStart"
			@touchend.prevent="handleTouchEnd" @click.stop="handleClick">
			<view class="wheel-item" v-for="(item, index) in items" :key="index" :style="getWheelItemStyle(index)">
				<text class="wheel-text" :style="getTextStyle(index)">
					{{ index + 1 }}
				</text>
			</view>
			<view class="wheel-center">{{ isAnimating ? '旋转中' : '转盘' }}</view>
		</view>
		<view class="wheel-pointer"></view>
	</view>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
	items: {
		type: Array,
		default: () => []
	},
	spinning: {
		type: Boolean,
		default: false
	},
	stopRequested: {
		type: Boolean,
		default: false
	}
});

const emit = defineEmits(['spin-end', 'spin-request']);
const rotation = ref(0);
const finalRotation = ref(0);
const spinDuration = 5000; // 旋转持续时间，单位毫秒
const animationId = ref(null); // 用于存储动画ID，便于停止动画
const isAnimating = ref(false); // 标记是否正在执行动画
const touchStartTime = ref(0); // 记录触摸开始时间，用于判断是否为点击

// 监听spinning属性变化
watch(() => props.spinning, (newVal) => {
	console.log('轮盘状态变化:', newVal);
	if (newVal === true) {
		console.log('开始旋转轮盘');
		startSpin();
	}
});

// 监听停止请求
watch(() => props.stopRequested, (newVal) => {
	if (newVal === true && isAnimating.value) {
		console.log('收到停止请求');
		stopSpin();
	}
});

const getWheelItemStyle = (index) => {
	const itemCount = props.items.length;
	const angle = 360 / itemCount;

	// 当项目数量小于等于4个时，使用更简单的扇形计算方式
	if (itemCount <= 4) {
		const startAngle = angle * index;

		return {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '50%',
			height: '100%',
			transformOrigin: 'right center',
			transform: `rotate(${rotate}deg)`,
			backgroundColor: getItemColor(index),
			clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
		};
	}

	// 对于更多项目，使用现有的计算方法
	const startAngle = angle * index;

	return {
		position: 'absolute',
		top: '0',
		left: '0',
		width: '100%',
		height: '100%',
		clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + angle) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + angle) * Math.PI / 180)}%)`,
		backgroundColor: getItemColor(index)
	};
};

const getTextStyle = (index) => {
	const itemCount = props.items.length;
	const angle = 360 / itemCount;

	// 当项目数量小于等于4个时，使用特殊样式
	if (itemCount <= 4) {
		const midAngle = (angle * index + angle / 2) * Math.PI / 180;

		// 对于少量项目，增加半径使文本更靠近边缘
		const radius = 42; // 增加半径值
		const x = 50 + radius * Math.cos(midAngle);
		const y = 50 + radius * Math.sin(midAngle);

		return {
			position: 'absolute',
			left: `${x}%`,
			top: `${y}%`,
			transform: 'translate(-50%, -50%)',
			fontSize: '48rpx',
			color: '#fff',
			fontWeight: 'bold',
			textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
			backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明背景
			borderRadius: '50%',
			width: '80rpx', // 增大尺寸
			height: '80rpx', // 增大尺寸
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)', // 增强阴影
			zIndex: 10 // 提高z-index确保显示在最上层
		};
	}

	// 对于更多项目，使用现有的计算方法
	const midAngle = (angle * index + angle / 2) * Math.PI / 180;

	// 计算文本位置，距离中心点约70%半径的位置
	const radius = 35;
	const x = 50 + radius * Math.cos(midAngle);
	const y = 50 + radius * Math.sin(midAngle);

	// 根据项目数量动态调整文本大小
	let fontSize = '40rpx';

	if (itemCount <= 8) {
		fontSize = '44rpx';
	} else if (itemCount <= 12) {
		fontSize = '40rpx';
	} else if (itemCount <= 16) {
		fontSize = '36rpx';
	} else if (itemCount <= 20) {
		fontSize = '32rpx';
	} else {
		fontSize = '28rpx';
	}

	return {
		position: 'absolute',
		left: `${x}%`,
		top: `${y}%`,
		transform: 'translate(-50%, -50%)',
		fontSize,
		color: '#fff',
		fontWeight: 'bold',
		textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
		borderRadius: '50%',
		width: '60rpx',
		height: '60rpx',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
		zIndex: 1
	};
};

const getItemColor = (index) => {
	// 交替的颜色，可以根据需要修改
	const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#F6AE2D'];
	return colors[index % colors.length];
};

const startSpin = () => {
	if (isAnimating.value) return; // 防止重复启动动画

	isAnimating.value = true;

	// 随机旋转角度，确保至少旋转5圈以上
	const minRotation = 1800; // 5圈 = 5 * 360 = 1800度
	const extraRotation = Math.random() * 360; // 额外随机旋转0-360度
	finalRotation.value = rotation.value + minRotation + extraRotation;

	// 设置动画
	const startTime = Date.now();
	const initialRotation = rotation.value;
	const finalRotationValue = finalRotation.value;
	const duration = spinDuration;

	const animate = () => {
		const currentTime = Date.now();
		const elapsed = currentTime - startTime;

		if (elapsed < duration && isAnimating.value) {
			// 使用缓动函数使动画更自然
			const progress = easeOutQuart(elapsed / duration);
			rotation.value = initialRotation + progress * (finalRotationValue - initialRotation);
			// 使用我们的替代函数而不是原生requestAnimationFrame
			animationId.value = requestAF(animate);
		} else {
			// 动画结束或被中断
			isAnimating.value = false;

			// 确保最终位置是精确的，不要使用取余操作
			if (elapsed >= duration) {
				// 如果是自然结束，直接设置为最终旋转值
				rotation.value = finalRotationValue;
			}

			console.log('轮盘动画结束');
			emit('spin-end', getSelectedItem());
		}
	};

	animate(); // 立即开始动画
};

const stopSpin = () => {
	if (animationId.value) {
		// 使用我们的替代函数而不是原生cancelAnimationFrame
		cancelAF(animationId.value);
		animationId.value = null;
	}

	// 不进行取余操作，保持当前角度
	// rotation.value = rotation.value % 360;

	isAnimating.value = false;
	console.log('轮盘停止，当前角度:', rotation.value);
	emit('spin-end', getSelectedItem());
};

const easeOutQuart = (t) => {
	return 1 - Math.pow(1 - t, 4);
};
const getSelectedItem = () => {
	// 计算指针指向的项目
	const itemAngle = 360 / props.items.length;
	const normalizedRotation = (360 - (rotation.value % 360)) % 360; // 转换为0-360度
	const selectedIndex = Math.floor(normalizedRotation / itemAngle);
	return props.items[selectedIndex];
};

// 触摸事件处理
const handleTouchStart = (e) => {
	touchStartTime.value = Date.now();

	// 如果轮盘正在旋转，停止旋转
	if (isAnimating.value) {
		stopSpin();
	}
};

const handleTouchEnd = (e) => {
	const touchDuration = Date.now() - touchStartTime.value;

	// 如果是短暂的触摸（点击），而且轮盘没有在旋转，就开始旋转
	if (touchDuration < 300 && !isAnimating.value) {
		if (!props.spinning) {
			emit('spin-request'); // 发送请求开始旋转的事件
		}
	}
};
const handleClick = (e) => {
	// 如果轮盘没有在旋转，就开始旋转
	if (!isAnimating.value && !props.spinning) {
		emit('spin-request'); // 发送请求开始旋转的事件
	}
};

// 为小程序环境提供requestAnimationFrame和cancelAnimationFrame的替代实现
const requestAF = (callback) => {
	return setTimeout(callback, 16); // 约60fps
};

const cancelAF = (id) => {
	clearTimeout(id);
};

</script>

<style>
.wheel-container {
	position: relative;
	width: 600rpx;
	height: 600rpx;
	margin: 0 auto;
}

.wheel {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	position: relative;
	overflow: hidden;
	box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.3);
	transition: transform 0.2s ease-out;
	will-change: transform;
	backface-visibility: hidden;
	transform-style: preserve-3d;
}

.wheel-item {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.wheel-text {
	position: absolute;
	color: #fff;
	font-weight: bold;
	text-align: center;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
	background-color: rgba(0, 0, 0, 0.3);
	border-radius: 50%;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
	z-index: 1;
}

.wheel-center {
	position: absolute;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background-color: #fff;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 2;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.3);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 22rpx;
	color: #333;
	font-weight: bold;
}

.wheel-pointer {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 0;
	height: 0;
	border-left: 30rpx solid transparent;
	border-right: 30rpx solid transparent;
	border-bottom: 80rpx solid #FF6B6B;
	transform-origin: 50% 0;
	z-index: 3;
	filter: drop-shadow(0 5rpx 5rpx rgba(0, 0, 0, 0.3));
}
</style>
