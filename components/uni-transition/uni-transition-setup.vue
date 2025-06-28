<template>
	<view v-if="show" :style="{ transform: 'translateX(' + x + 'px)' }" @click="handleClick">
		<slot></slot>
	</view>
</template>

<script setup>
	import { ref, watch, computed, nextTick } from 'vue';
	
	// #ifdef APP-NVUE
	const animation = uni.requireNativePlugin('animation');
	// #endif
	
	const props = defineProps({
		show: {
			type: Boolean,
			default: false
		},
		modeClass: {
			type: Array,
			default: () => []
		},
		duration: {
			type: Number,
			default: 300
		},
		styles: {
			type: Object,
			default: () => ({})
		}
	});
	
	const emit = defineEmits(['click']);
	
	const isShow = ref(false);
	const transform = ref('');
	const ani = ref({
		in: '',
		active: ''
	});
	let timer = null;
	const x = ref(0); // 保持x变量用于模板中的动态样式
	
	// 动画默认配置
	const animation = {
		transformOrigin: '50% 50%',
		timingFunction: 'ease',
		delay: 0,
		duration: props.duration
	};
	
	// 计算属性
	const stylesObject = computed(() => {
		let styles = {
			...props.styles,
			'transition-duration': props.duration / 1000 + 's'
		};
		let transformStr = '';
		for (let i in styles) {
			let line = toLine(i);
			transformStr += line + ':' + styles[i] + ';';
		}
		return transformStr;
	});
	
	const transformStyles = computed(() => {
		return 'transform:' + transform.value + ';' + stylesObject.value;
	});
	
	// 监听show变化
	watch(() => props.show, (newVal) => {
		if (newVal) {
			open();
		} else {
			close();
		}
	}, { immediate: true });
	
	// 方法
	const init = (obj = {}) => {
		if (obj.duration) {
			animation.duration = obj.duration;
		}
		animation.timingFunction = obj.timingFunction || 'ease';
		animation.delay = obj.delay || 0;
		animation.transformOrigin = obj.transformOrigin || '50% 50%';
		
		isShow.value = true;
		nextTick(() => {
			// #ifdef APP-NVUE
			nvueEnter();
			// #endif
			// #ifndef APP-NVUE
			enter();
			// #endif
		});
	};
	
	const open = () => {
		clearTimeout(timer);
		isShow.value = true;
		nextTick(() => {
			// #ifdef APP-NVUE
			nvueEnter();
			// #endif
			// #ifndef APP-NVUE
			enter();
			// #endif
		});
	};
	
	const close = () => {
		clearTimeout(timer);
		nextTick(() => {
			// #ifdef APP-NVUE
			nvueLeave();
			// #endif
			// #ifndef APP-NVUE
			leave();
			// #endif
		});
	};
	
	const enter = () => {
		// 获取动画实例
		animation.timingFunction = 'ease';
		
		animation.duration = props.duration;
		ani.value.in = '';
		for (let i in props.modeClass) {
			if (props.modeClass[i]) {
				ani.value.in = props.modeClass[i];
			}
		}
		
		transform.value = '';
		timer = setTimeout(() => {
			animation = 'none';
			isShow.value = false;
		}, props.duration);
	};
	
	const leave = () => {
		// 获取动画实例
		animation.timingFunction = 'ease';
		animation.duration = props.duration;
		ani.value.in = '';
		for (let i in props.modeClass) {
			if (props.modeClass[i]) {
				ani.value.in = props.modeClass[i];
			}
		}
		
		transform.value = '';
		timer = setTimeout(() => {
			animation = 'none';
			isShow.value = false;
		}, props.duration);
	};
	
	const animateStyle = (styles) => {
		let style = '';
		for (let i in styles) {
			let line = toLine(i);
			style += line + ':' + styles[i] + ';';
		}
		return style;
	};
	
	// 驼峰转中横线
	const toLine = (name) => {
		return name.replace(/([A-Z])/g, "-$1").toLowerCase();
	};
	
	// 处理点击事件
	const handleClick = () => {
		emit('click');
	};
	
	// 暴露方法给父组件
	defineExpose({
		init,
		open,
		close
	});
</script>

<style>
	.uni-transition {
		transition-timing-function: ease;
		transition-duration: 0.3s;
		transition-property: transform, opacity;
	}

	.fade-in {
		opacity: 0;
	}

	.fade-active {
		opacity: 1;
	}

	.slide-top-in {
		/* transition-property: transform, opacity; */
		transform: translateY(-100%);
	}

	.slide-top-active {
		transform: translateY(0);
		/* opacity: 1; */
	}

	.slide-right-in {
		transform: translateX(100%);
	}

	.slide-right-active {
		transform: translateX(0);
	}

	.slide-bottom-in {
		transform: translateY(100%);
	}

	.slide-bottom-active {
		transform: translateY(0);
	}

	.slide-left-in {
		transform: translateX(-100%);
	}

	.slide-left-active {
		transform: translateX(0);
		opacity: 1;
	}

	.zoom-in-in {
		transform: scale(0.8);
	}

	.zoom-out-active {
		transform: scale(1);
	}

	.zoom-out-in {
		transform: scale(1.2);
	}
</style>
