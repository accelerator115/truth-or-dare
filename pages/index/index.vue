<template>
	<view class="container">
		<view class="mode-selector card">
			<view class="title">选择模式</view>
			<view class="mode-buttons">
				<view class="mode-btn" :class="{ 'active': selectedMode === 'truth' }" @click.stop="selectMode('truth')">
					真心话</view>
				<view class="mode-btn" :class="{ 'active': selectedMode === 'dare' }" @click.stop="selectMode('dare')">大冒险
				</view>
			</view>
		</view>

		<view class="card">
			<view class="title">添加内容</view>
			<view class="input-group"> <input type="text" v-model="newItem" placeholder="请输入真心话/大冒险内容"
					confirm-type="done" @confirm="addItem" />
				<button @click.stop="addItem">添加</button>
			</view>
			<view class="import-btn" @click.stop="importDefaultItems">导入默认内容</view>
			<view class="item-list" v-if="items.length > 0">
				<view class="list-title">已添加内容 ({{ items.length }})</view>
				<view class="item" v-for="(item, index) in items" :key="index"
					:class="{ 'current-mode': item.type === selectedMode }">
					<view class="item-content">
						<text class="item-type">{{ item.type === 'truth' ? '真心话' : '大冒险' }}</text>
						<text>{{ item.text }}</text>
					</view>
					<text class="delete" @click.stop="deleteItem(index)">删除</text>
				</view>
			</view>
		</view>
		<view class="wheel-section card" v-if="filteredItems.length >= 3">
			<wheel :items="filteredItems" :spinning="isSpinning" :stopRequested="stopRequested" @spin-end="onSpinEnd"
				@spin-request="startSpin"></wheel>
			<view class="button-group">
				<view class="spin-btn" @click.stop="startSpin" :class="{ 'disabled': isSpinning }">
					{{ isSpinning ? '旋转中...' : '开始旋转' }}
				</view>
				<view class="stop-btn" @click.stop="stopSpin" :class="{ 'disabled': !isSpinning }">
					停止旋转
				</view>
			</view>
		</view>
		<view class="card notice" v-else>
			<text>当前模式下至少需要添加3个内容才能开始</text>
		</view>

		<view class="card" v-if="history.length > 0">
			<view class="title">历史记录</view>
			<view class="history-list">
				<view class="history-item" v-for="(item, index) in history" :key="index">
					<view class="history-info">
						<text class="history-type">{{ item.type === 'truth' ? '真心话' : '大冒险' }}</text>
						<text class="history-date">{{ item.date }}</text>
					</view>
					<view class="history-content">{{ item.text }}</view>
				</view>
			</view>
			<view class="clear-btn" @click.stop="clearHistory">清空历史记录</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted, computed } from 'vue';
import wheel from '@/components/wheel/wheel.vue';

// 响应式状态
const selectedMode = ref('truth'); // 'truth' 或 'dare'
const newItem = ref('');
const items = ref([]);
const isSpinning = ref(false);
const stopRequested = ref(false);
const selectedItem = ref({ text: '' });

// 记录历史
const history = ref([]);

// 默认内容
const defaultTruth = [
	'你最喜欢的一首歌是什么？',
	'你最欣赏自己的哪一点？',
	'你最近一次撒谎是什么时候？',
	'你有什么不为人知的特长？',
	'你的初恋是什么时候？',
	'如果明天是世界末日，你会做什么？',
	'你的手机里有什么不想被别人看到的东西？',
	'你最尴尬的经历是什么？',
	'你心目中的理想型是什么样的？',
	'你最近做过最疯狂的事是什么？'
];

const defaultDare = [
	'模仿一种动物的叫声',
	'唱一首歌的副歌部分',
	'做10个俯卧撑',
	'向在场的异性表白',
	'模仿一个电影角色',
	'讲一个笑话',
	'跳一段即兴舞蹈',
	'站在椅子上转三圈',
	'给自己的前任发一条祝福信息',
	'让在场的一位朋友给你拍一张丑照并设为头像24小时'
];

// 过滤出当前模式下的项目
const filteredItems = computed(() => {
	return items.value.filter(item => item.type === selectedMode.value);
});

// 生命周期钩子 - 组件挂载时
onMounted(() => {
	// 尝试从本地存储加载数据
	try {
		const savedItems = uni.getStorageSync('truth-or-dare-items');
		if (savedItems) {
			items.value = JSON.parse(savedItems);
		}

		const savedMode = uni.getStorageSync('truth-or-dare-mode');
		if (savedMode) {
			selectedMode.value = savedMode;
		}

		const savedHistory = uni.getStorageSync('truth-or-dare-history');
		if (savedHistory) {
			history.value = JSON.parse(savedHistory);
		}
	} catch (e) {
		console.error('读取本地存储失败:', e);
	}
});

// 方法
const selectMode = (mode) => {
	console.log('选择模式:', mode);
	selectedMode.value = mode;
	// 保存到本地存储
	try {
		uni.setStorageSync('truth-or-dare-mode', mode);
	} catch (e) {
		console.error('保存模式失败:', e);
	}
};

const addItem = () => {
	if (!newItem.value.trim()) {
		uni.showToast({
			title: '内容不能为空',
			icon: 'none'
		});
		return;
	}

	// 检查是否与现有项目重复
	const isDuplicate = items.value.some(item =>
		item.text.trim().toLowerCase() === newItem.value.trim().toLowerCase() &&
		item.type === selectedMode.value
	);

	if (isDuplicate) {
		uni.showToast({
			title: '该内容已存在',
			icon: 'none'
		});
		return;
	}

	items.value.push({
		text: newItem.value.trim(),
		type: selectedMode.value
	});

	// 保存到本地存储
	try {
		uni.setStorageSync('truth-or-dare-items', JSON.stringify(items.value));

		newItem.value = '';
		uni.showToast({
			title: '添加成功',
			icon: 'success'
		});
	} catch (e) {
		console.error('保存项目失败:', e);
	}
};

const deleteItem = (index) => {
	items.value.splice(index, 1);
	// 保存到本地存储
	try {
		uni.setStorageSync('truth-or-dare-items', JSON.stringify(items.value));

		uni.showToast({
			title: '删除成功',
			icon: 'success'
		});
	} catch (e) {
		console.error('删除项目失败:', e);
	}
};

const importDefaultItems = () => {
	const defaultItems = selectedMode.value === 'truth' ? defaultTruth : defaultDare;

	// 过滤掉已存在的项目
	const existingTexts = items.value.map(item => item.text);
	const newItems = defaultItems.filter(text => !existingTexts.includes(text))
		.map(text => ({ text, type: selectedMode.value }));

	if (newItems.length === 0) {
		uni.showToast({
			title: '已经导入过默认内容了',
			icon: 'none'
		});
		return;
	}

	items.value = [...items.value, ...newItems];

	// 保存到本地存储
	try {
		uni.setStorageSync('truth-or-dare-items', JSON.stringify(items.value));

		uni.showToast({
			title: `导入${newItems.length}个内容`,
			icon: 'success'
		});
	} catch (e) {
		console.error('导入默认内容失败:', e);
	}
};
const startSpin = () => {
	if (filteredItems.value.length < 3) {
		uni.showToast({
			title: '当前模式下至少需要3个内容',
			icon: 'none'
		});
		return;
	}

	if (isSpinning.value) return;

	console.log("开始旋转轮盘");
	isSpinning.value = true;
	stopRequested.value = false;
};

const stopSpin = () => {
	if (!isSpinning.value) return;

	console.log("请求停止轮盘");
	stopRequested.value = true;
};
const onSpinEnd = (item) => {
	console.log('轮盘停止，选中项目:', item);
	isSpinning.value = false;
	stopRequested.value = false;
	selectedItem.value = item;

	// 添加到历史记录
	const historyItem = {
		text: item.text,
		type: selectedMode.value,
		date: new Date().toLocaleString()
	};

	history.value.unshift(historyItem); // 将新记录添加到开头
	if (history.value.length > 20) { // 最多保留20条记录
		history.value = history.value.slice(0, 20);
	}

	// 保存历史记录
	try {
		uni.setStorageSync('truth-or-dare-history', JSON.stringify(history.value));
	} catch (e) {
		console.error('保存历史记录失败:', e);
	}

	// 显示结果弹窗
	nextTick(() => {
		uni.showModal({
			title: selectedMode.value === 'truth' ? '真心话' : '大冒险',
			content: item.text,
			showCancel: false,
			confirmText: '知道了'
		});
	});
};

const clearHistory = () => {
	uni.showModal({
		title: '确认清空',
		content: '确定要清空所有历史记录吗？',
		success: (res) => {
			if (res.confirm) {
				history.value = [];
				uni.setStorageSync('truth-or-dare-history', '[]');
				uni.showToast({
					title: '已清空历史记录',
					icon: 'success'
				});
			}
		}
	});
};
</script>

<style>
.container {
	padding: 30rpx;
}

.title {
	font-size: 36rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	color: #333;
}

.mode-selector {
	text-align: center;
}

.mode-buttons {
	display: flex;
	justify-content: space-around;
	margin-top: 20rpx;
}

.mode-btn {
	width: 45%;
	padding: 20rpx 0;
	text-align: center;
	border-radius: 10rpx;
	background-color: #f0f0f0;
	color: #333;
	font-weight: bold;
	position: relative;
	overflow: hidden;
}

.mode-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.mode-btn.active {
	background-color: #FF6B6B;
	color: #fff;
}

.input-group {
	display: flex;
	margin-bottom: 20rpx;
}

.input-group input {
	flex: 1;
	padding: 20rpx;
	border: 1px solid #ddd;
	border-radius: 10rpx;
	margin-right: 20rpx;
}

.input-group button {
	background-color: #FF6B6B;
	color: #fff;
	border: none;
	border-radius: 10rpx;
	padding: 0 30rpx;
}

.input-group button:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.import-btn {
	text-align: center;
	background-color: #4ECDC4;
	color: #fff;
	padding: 20rpx 0;
	border-radius: 10rpx;
	margin-bottom: 30rpx;
}

.import-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.item-list {
	margin-top: 30rpx;
}

.list-title {
	font-size: 32rpx;
	margin-bottom: 20rpx;
	color: #333;
}

.item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx;
	background-color: #f9f9f9;
	margin-bottom: 10rpx;
	border-radius: 8rpx;
}

.item.current-mode {
	border-left: 6rpx solid #FF6B6B;
}

.item-content {
	display: flex;
	flex-direction: column;
	flex: 1;
	margin-right: 20rpx;
}

.item-type {
	font-size: 24rpx;
	color: #888;
	margin-bottom: 6rpx;
}

.delete {
	color: #FF6B6B;
	align-self: center;
	padding: 10rpx;
}

.delete:active {
	opacity: 0.7;
	transform: scale(0.95);
}

.wheel-section {
	text-align: center;
	padding: 30rpx;
}

.button-group {
	display: flex;
	justify-content: space-between;
	margin-top: 40rpx;
	gap: 20rpx;
}

.spin-btn,
.stop-btn {
	flex: 1;
	padding: 20rpx 0;
	border-radius: 10rpx;
	font-weight: bold;
	color: #fff;
	transition: all 0.2s;
}

.spin-btn:active,
.stop-btn:active {
	opacity: 0.8;
	transform: scale(0.98);
}

.spin-btn {
	background-color: #FF6B6B;
}

.stop-btn {
	background-color: #4ECDC4;
}

.spin-btn.disabled,
.stop-btn.disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.notice {
	text-align: center;
	padding: 40rpx;
	color: #888;
}

.history-list {
	margin-top: 20rpx;
}

.history-item {
	background-color: #f9f9f9;
	padding: 20rpx;
	margin-bottom: 15rpx;
	border-radius: 8rpx;
}

.history-info {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.history-type {
	color: #FF6B6B;
	font-size: 26rpx;
	font-weight: bold;
}

.history-date {
	color: #999;
	font-size: 24rpx;
}

.history-content {
	font-size: 28rpx;
}

.clear-btn {
	text-align: center;
	margin-top: 20rpx;
	padding: 15rpx 0;
	background-color: #f0f0f0;
	color: #666;
	border-radius: 8rpx;
}
</style>
