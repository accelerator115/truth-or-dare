<template>
	<view v-if="show" :style="{ transform: 'translateX(' + x + 'px)' }">
		<slot></slot>
	</view>
</template>

<script>
	// #ifdef APP-NVUE
	const animation = uni.requireNativePlugin('animation');
	// #endif
	/**
	 * Transition 过渡动画
	 * @description 简单过渡动画组件
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=985
	 * @property {Boolean} show = [false|true] 控制组件显示或隐藏
	 * @property {Array} modeClass = [fade|slide-top|slide-right|slide-bottom|slide-left|zoom-in|zoom-out] 过渡动画类型
	 *  @value fade 渐隐渐出过渡
	 *  @value slide-top 由上至下过渡
	 *  @value slide-right 由右至左过渡
	 *  @value slide-bottom 由下至上过渡
	 *  @value slide-left 由左至右过渡
	 *  @value zoom-in 由小到大过渡
	 *  @value zoom-out 由大到小过渡
	 * @property {Number} duration 过渡动画持续时间
	 * @property {Object} styles 组件样式，同 css 样式，注意带'-'连接符的属性需要使用小驼峰写法如：`backgroundColor:red`
	 */
	export default {
		name: 'uniTransition',
		props: {
			show: {
				type: Boolean,
				default: false
			},
			modeClass: {
				type: Array,
				default () {
					return []
				}
			},
			duration: {
				type: Number,
				default: 300
			},
			styles: {
				type: Object,
				default () {
					return {}
				}
			}
		},
		data() {
			return {
				isShow: false,
				transform: '',
				ani: {
					in: '',
					active: ''
				}
			};
		},
		watch: {
			show: {
				handler(newVal) {
					if (newVal) {
						this.open()
					} else {
						this.close()
					}
				},
				immediate: true
			}
		},
		computed: {
			// 生成样式数据
			stylesObject() {
				let styles = {
					...this.styles,
					'transition-duration': this.duration / 1000 + 's'
				}
				let transform = ''
				for (let i in styles) {
					let line = this.toLine(i)
					transform += line + ':' + styles[i] + ';'
				}
				return transform
			},
			// 初始化动画条件
			transformStyles() {
				return 'transform:' + this.transform + ';' + this.stylesObject
			}
		},
		created() {
			// 动画默认配置
			this.animation = {
				transformOrigin: '50% 50%',
				timingFunction: 'ease',
				delay: 0,
				duration: this.duration
			}
		},
		methods: {
			/**
			 *  ref 触发 初始化动画
			 */
			init(obj = {}) {
				if (obj.duration) {
					this.animation.duration = obj.duration
				}
				this.animation.timingFunction = obj.timingFunction || 'ease'
				this.animation.delay = obj.delay || 0
				this.animation.transformOrigin = obj.transformOrigin || '50% 50%'
				
				this.isShow = true
				this.$nextTick(() => {
					// #ifdef APP-NVUE
					this.nvueEnter();
					// #endif
					// #ifndef APP-NVUE
					this.enter();
					// #endif
				})
			},
			/**
			 * 开始过渡动画
			 */
			open() {
				clearTimeout(this.timer)
				this.isShow = true
				this.$nextTick(() => {
					// #ifdef APP-NVUE
					this.nvueEnter();
					// #endif
					// #ifndef APP-NVUE
					this.enter();
					// #endif
				})
			},
			/**
			 * 关闭过渡动画
			 */
			close() {
				clearTimeout(this.timer)
				this.$nextTick(() => {
					// #ifdef APP-NVUE
					this.nvueLeave();
					// #endif
					// #ifndef APP-NVUE
					this.leave();
					// #endif
				})
			},
			/**
			 * 非APP-NVUE平台 淡入过程
			 */
			enter() {
				// 获取动画实例
				this.animation.timingFunction = 'ease'
				
				this.animation.duration = this.duration
				this.ani.in = ''
				for (let i in this.modeClass) {
					if (this.modeClass[i]) {
						this.ani.in = this.modeClass[i]
					}
				}
				
				this.transform = ''
				this.timer = setTimeout(() => {
					this.animation = 'none';
					this.isShow = false
				}, this.duration)
			},
			/**
			 * 非APP-NVUE平台 淡出过程
			 */
			leave() {
				// 获取动画实例
				this.animation.timingFunction = 'ease'
				this.animation.duration = this.duration
				this.ani.in = ''
				for (let i in this.modeClass) {
					if (this.modeClass[i]) {
						this.ani.in = this.modeClass[i]
					}
				}
				
				this.transform = ''
				this.timer = setTimeout(() => {
					this.animation = 'none';
					this.isShow = false
				}, this.duration)
			},
			// 支持过渡动画
			animateStyle(styles) {
				let style = ''
				for (let i in styles) {
					let line = this.toLine(i)
					style += line + ':' + styles[i] + ';'
				}
				return style;
			},
			// 驼峰转中横线
			toLine(name) {
				return name.replace(/([A-Z])/g, "-$1").toLowerCase();
			}
		}
	}
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
