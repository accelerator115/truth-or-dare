<template>
	<view>
		<view class="uni-popup" :class="[popupClass]" @touchmove.stop.prevent="clear">
			<uni-transition v-if="maskShow" :mode-class="['fade']" :styles="maskClass" :duration="duration" :show="showTrans" @click="onTap" />
			<uni-transition :mode-class="ani" :styles="transClass" :duration="duration" :show="showTrans" @click="onTap">
				<view class="uni-popup__wrapper" :class="[popupstyle]" @click.stop="clear">
					<slot />
				</view>
			</uni-transition>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted, nextTick } from 'vue';
	
	const props = defineProps({
		// 开启动画
		animation: {
			type: Boolean,
			default: true
		},
		// 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
		type: {
			type: String,
			default: 'center'
		},
		// maskClick
		maskClick: {
			type: Boolean,
			default: true
		}
	});
	
	const duration = ref(300);
	const ani = ref([]);
	const showPopup = ref(false);
	const showTrans = ref(false);
	let timer = null;
	let msgtimer = null;
	
	const maskClass = {
		'position': 'fixed',
		'bottom': 0,
		'top': 0,
		'left': 0,
		'right': 0,
		'backgroundColor': 'rgba(0, 0, 0, 0.4)'
	};
	
	const transClass = {
		'position': 'fixed',
		'left': 0,
		'right': 0,
	};
	
	// 计算属性
	const maskShow = computed(() => showPopup.value === true);
	const popupstyle = computed(() => props.type);
	const popupClass = computed(() => showPopup.value ? 'uni-popup--show' : '');
	
	// 方法
	const clear = (e) => {
		// TODO nvue 取消冒泡
	};
	
	const open = () => {
		showPopup.value = true;
		nextTick(() => {
			new Promise(resolve => {
				clearTimeout(timer);
				timer = setTimeout(() => {
					showTrans.value = true;
					// #ifndef APP-NVUE
					nextTick(() => {
						resolve();
					});
					// #endif
					// #ifdef APP-NVUE
					resolve();
					// #endif
				}, 50);
			}).then(res => {
				// #ifndef APP-NVUE
				clearTimeout(msgtimer);
				msgtimer = setTimeout(() => {
					// 自定义打开事件
				}, 100);
				// #endif
				// #ifdef APP-NVUE
				// 自定义打开事件
				// #endif
			});
		});
	};
	
	const close = (type) => {
		showTrans.value = false;
		nextTick(() => {
			timer = setTimeout(() => {
				showPopup.value = false;
				// 自定义关闭事件
			}, 300);
		});
	};
	
	const onTap = () => {
		if (!props.maskClick) return;
		close();
	};
	
	// 向外暴露方法
	defineExpose({
		open,
		close
	});
</script>

<style>
	.uni-popup {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
	}

	.uni-popup__mask {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.4);
		opacity: 0;
	}

	.uni-popup__wrapper {
		position: absolute;
		z-index: 10;
	}

	.uni-popup.center .uni-popup__wrapper {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.uni-popup.uni-popup--show {
		display: block;
	}

	.uni-popup.uni-popup--show .uni-popup__mask {
		opacity: 1;
	}
</style>
