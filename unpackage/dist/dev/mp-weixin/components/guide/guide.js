"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "guide",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close", "complete"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const showGuide = common_vendor.ref(false);
    const currentStepIndex = common_vendor.ref(0);
    const screenInfo = common_vendor.ref({
      width: 375,
      height: 667,
      statusBarHeight: 44
    });
    const currentTargetElement = common_vendor.ref(null);
    const guideSteps = common_vendor.ref([
      {
        title: "欢迎使用真心话大冒险！",
        description: "这是一个有趣的聚会游戏，让我们一起来了解如何使用吧！",
        target: "",
        position: "center"
      },
      {
        title: "选择游戏模式",
        description: '点击"真心话"或"大冒险"来选择游戏模式。真心话是回答问题，大冒险是完成挑战任务。',
        target: ".mode-buttons",
        position: "bottom"
      },
      {
        title: "添加游戏内容",
        description: '在下方高亮区域的输入框中添加自定义内容，然后点击"添加"按钮保存。让游戏更加个性化！',
        target: ".input-group",
        position: "bottom"
      },
      {
        title: "导入默认内容",
        description: '如果你不想自己添加内容，可以点击"导入默认内容"按钮，系统会为你添加10个精选内容。',
        target: ".import-btn",
        position: "bottom"
      },
      {
        title: "查看已添加内容",
        description: "在这里可以看到所有已添加的内容。当前模式下有至少3个内容时，下方就会出现转盘。你可以添加更多内容！",
        target: ".item-list",
        position: "top"
      },
      {
        title: "开始游戏",
        description: '当内容足够时，转盘会出现在这个位置。点击"开始旋转"来随机选择一个任务！',
        target: ".wheel-section",
        position: "top"
      },
      {
        title: "数据管理",
        description: "在底部可以查看历史记录，还能清空数据或重置应用。这些功能帮助你更好地管理游戏数据。",
        target: "",
        position: "center"
      },
      {
        title: "开始享受游戏吧！",
        description: "现在你已经了解了所有功能，快去和朋友们一起享受真心话大冒险的乐趣吧！",
        target: "",
        position: "center"
      }
    ]);
    const currentStep = common_vendor.computed(() => guideSteps.value[currentStepIndex.value]);
    common_vendor.onMounted(() => {
      getSystemInfo();
      if (props.show) {
        startGuide();
      }
    });
    const getSystemInfo = () => {
      common_vendor.index.getSystemInfo({
        success: (res) => {
          screenInfo.value = {
            width: res.windowWidth,
            height: res.windowHeight,
            statusBarHeight: res.statusBarHeight || 44
          };
          common_vendor.index.__f__("log", "at components/guide/guide.vue:134", "屏幕信息:", screenInfo.value);
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at components/guide/guide.vue:137", "获取屏幕信息失败:", err);
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
      getSystemInfo();
      await common_vendor.nextTick$1();
      await updateCurrentTarget();
    };
    const nextStep = async () => {
      if (currentStepIndex.value < guideSteps.value.length - 1) {
        currentStepIndex.value++;
        await common_vendor.nextTick$1();
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
      emit("complete");
      try {
        common_vendor.index.setStorageSync("truth-or-dare-guide-completed", true);
      } catch (e) {
        common_vendor.index.__f__("error", "at components/guide/guide.vue:186", "保存指引状态失败:", e);
      }
    };
    const handleContainerClick = (e) => {
      if (e.target === e.currentTarget) {
        skipGuide();
      }
    };
    const maskStyle = common_vendor.computed(() => {
      const target = currentTargetElement.value;
      if (!target) {
        return {
          background: "rgba(0, 0, 0, 0.7)"
        };
      }
      const { top, left, width, height } = target;
      const padding = 10;
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
        background: "rgba(0, 0, 0, 0.7)",
        clipPath
      };
    });
    const highlightStyle = common_vendor.computed(() => {
      const target = currentTargetElement.value;
      if (!target)
        return { display: "none" };
      const { top, left, width, height } = target;
      const padding = 10;
      return {
        position: "fixed",
        top: `${top - padding}px`,
        left: `${left - padding}px`,
        width: `${width + padding * 2}px`,
        height: `${height + padding * 2}px`,
        borderRadius: "12rpx",
        border: "4rpx solid #FF6B6B",
        boxShadow: "0 0 20rpx rgba(255, 107, 107, 0.6)",
        pointerEvents: "none",
        zIndex: 998
      };
    });
    const cardStyle = common_vendor.computed(() => {
      const target = currentTargetElement.value;
      const margin = 30;
      const cardHeight = 280;
      let top, left;
      if (!target || currentStep.value.position === "center") {
        top = Math.max(100, (screenInfo.value.height - cardHeight) / 2);
        left = margin;
      } else {
        const { top: targetTop, left: targetLeft, width: targetWidth, height: targetHeight } = target;
        const padding = 20;
        if (currentStep.value.position === "bottom") {
          top = targetTop + targetHeight + padding;
          if (top + cardHeight > screenInfo.value.height - 60) {
            top = Math.max(screenInfo.value.statusBarHeight + 100, targetTop - cardHeight - padding);
          }
        } else if (currentStep.value.position === "top") {
          top = Math.max(screenInfo.value.statusBarHeight + 80, targetTop - cardHeight - padding);
        }
        left = margin;
      }
      return {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        right: `${margin}px`,
        // 添加右边距确保布局对称
        width: `calc(100% - ${margin * 2}px)`,
        // 使用calc确保准确的宽度计算
        minHeight: `${cardHeight}px`,
        zIndex: 997,
        boxSizing: "border-box"
      };
    });
    const arrowStyle = common_vendor.computed(() => {
      const target = currentTargetElement.value;
      if (!target || currentStep.value.position === "center") {
        return { display: "none" };
      }
      const { top: targetTop, left: targetLeft, width: targetWidth, height: targetHeight } = target;
      let top, left;
      if (currentStep.value.position === "bottom") {
        top = targetTop + targetHeight + 20;
        left = targetLeft + targetWidth / 2 - 15;
      } else if (currentStep.value.position === "top") {
        top = targetTop - 30;
        left = targetLeft + targetWidth / 2 - 15;
      }
      return {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 998
      };
    });
    const arrowDirection = common_vendor.computed(() => {
      if (currentStep.value.position === "bottom")
        return "arrow-up";
      if (currentStep.value.position === "top")
        return "arrow-down";
      return "";
    });
    const tryGetRealElementPosition = (selector) => {
      return new Promise((resolve) => {
        common_vendor.nextTick$1(() => {
          const query = common_vendor.index.createSelectorQuery();
          query.select(selector).boundingClientRect((rect) => {
            if (rect && rect.width > 0 && rect.height > 0) {
              common_vendor.index.__f__("log", "at components/guide/guide.vue:334", `获取到 ${selector} 的真实位置:`, rect);
              resolve({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
              });
            } else {
              common_vendor.index.__f__("log", "at components/guide/guide.vue:342", `无法获取 ${selector} 的真实位置，元素可能不存在或不可见`);
              resolve(null);
            }
          }).exec();
        });
      });
    };
    const getCurrentTargetElement = async () => {
      if (!currentStep.value.target)
        return null;
      try {
        const realPosition = await tryGetRealElementPosition(currentStep.value.target);
        if (realPosition) {
          return realPosition;
        }
      } catch (error) {
        common_vendor.index.__f__("log", "at components/guide/guide.vue:361", "获取真实位置失败，使用预估位置:", error);
      }
      return getEstimatedPosition(currentStep.value.target);
    };
    const getEstimatedPosition = (target) => {
      const screenWidth = screenInfo.value.width;
      const screenHeight = screenInfo.value.height;
      const statusBarHeight = screenInfo.value.statusBarHeight;
      const containerPadding = 30;
      const cardPadding = 30;
      const cardMarginBottom = 30;
      let cumulativeTop = statusBarHeight + 100;
      const modeCardTop = cumulativeTop;
      const modeCardHeight = 120;
      cumulativeTop += modeCardHeight + cardMarginBottom;
      const addContentCardTop = cumulativeTop;
      const addContentCardHeight = 300;
      cumulativeTop += addContentCardHeight + cardMarginBottom;
      const wheelSectionTop = cumulativeTop;
      const positions = {
        ".mode-buttons": {
          top: modeCardTop + cardPadding + 40,
          // 卡片内标题下方
          left: containerPadding + cardPadding,
          width: screenWidth - (containerPadding + cardPadding) * 2,
          height: 80
        },
        ".input-group": {
          top: addContentCardTop + cardPadding + 40,
          // 添加内容卡片中的输入框
          left: containerPadding + cardPadding,
          width: screenWidth - (containerPadding + cardPadding) * 2,
          height: 60
        },
        ".import-btn": {
          top: addContentCardTop + cardPadding + 40 + 60 + 20,
          // 输入框下方的按钮
          left: containerPadding + cardPadding,
          width: (screenWidth - (containerPadding + cardPadding) * 2) / 2 - 10,
          height: 60
        },
        ".item-list": {
          top: addContentCardTop + cardPadding + 40 + 60 + 80 + 20,
          // 按钮下方的列表
          left: containerPadding + cardPadding,
          width: screenWidth - (containerPadding + cardPadding) * 2,
          height: 150
        },
        ".wheel-section": {
          top: wheelSectionTop + cardPadding,
          // 转盘卡片区域
          left: containerPadding + cardPadding,
          width: screenWidth - (containerPadding + cardPadding) * 2,
          height: 300
        },
        ".history-list": {
          top: screenHeight - 300,
          left: containerPadding + cardPadding,
          width: screenWidth - (containerPadding + cardPadding) * 2,
          height: 200
        }
      };
      common_vendor.index.__f__("log", "at components/guide/guide.vue:436", `预估位置 ${target}:`, positions[target]);
      return positions[target] || null;
    };
    const updateCurrentTarget = async () => {
      const target = await getCurrentTargetElement();
      currentTargetElement.value = target;
      common_vendor.index.__f__("log", "at components/guide/guide.vue:444", "目标元素位置更新:", target);
      if (target && currentStep.value.position !== "center") {
        await scrollToTarget(target);
      }
    };
    const scrollTop = common_vendor.ref(0);
    const isScrolling = common_vendor.ref(false);
    const getCurrentScrollTop = () => {
      return new Promise((resolve) => {
        const query = common_vendor.index.createSelectorQuery();
        query.selectViewport().scrollOffset((res) => {
          resolve(res.scrollTop || 0);
        }).exec();
      });
    };
    const scrollToPosition = (targetScrollTop, duration = 500) => {
      return new Promise((resolve) => {
        if (isScrolling.value) {
          resolve();
          return;
        }
        isScrolling.value = true;
        common_vendor.index.__f__("log", "at components/guide/guide.vue:475", "开始滚动到位置:", targetScrollTop);
        common_vendor.index.pageScrollTo({
          scrollTop: targetScrollTop,
          duration,
          success: () => {
            common_vendor.index.__f__("log", "at components/guide/guide.vue:481", "滚动完成");
            scrollTop.value = targetScrollTop;
            isScrolling.value = false;
            resolve();
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at components/guide/guide.vue:487", "滚动失败:", error);
            isScrolling.value = false;
            resolve();
          }
        });
      });
    };
    const scrollToTarget = async (target) => {
      if (!target)
        return;
      try {
        const currentScrollTop = await getCurrentScrollTop();
        scrollTop.value = currentScrollTop;
        const viewportHeight = screenInfo.value.height;
        const statusBarHeight = screenInfo.value.statusBarHeight;
        const { top, height } = target;
        const elementCenter = top + height / 2;
        const viewportCenter = currentScrollTop + viewportHeight / 2;
        const centerThreshold = viewportHeight * 0.3;
        const topBoundary = currentScrollTop + centerThreshold;
        const bottomBoundary = currentScrollTop + viewportHeight - centerThreshold;
        common_vendor.index.__f__("log", "at components/guide/guide.vue:515", "滚动检查:", {
          elementTop: top,
          elementCenter,
          viewportCenter,
          topBoundary,
          bottomBoundary,
          needScroll: top < topBoundary || top + height > bottomBoundary
        });
        if (top < topBoundary || top + height > bottomBoundary) {
          const targetScrollTop = elementCenter - viewportHeight / 2;
          const finalScrollTop = Math.max(0, targetScrollTop);
          common_vendor.index.__f__("log", "at components/guide/guide.vue:529", "滚动到位置:", finalScrollTop);
          await scrollToPosition(finalScrollTop, 500);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at components/guide/guide.vue:534", "滚动到目标失败:", error);
      }
    };
    const addScrollListener = () => {
      if (!scrollCheckInterval.value) {
        scrollCheckInterval.value = setInterval(async () => {
          if (showGuide.value) {
            const currentTop = await getCurrentScrollTop();
            scrollTop.value = currentTop;
          }
        }, 100);
      }
    };
    const removeScrollListener = () => {
      if (scrollCheckInterval.value) {
        clearInterval(scrollCheckInterval.value);
        scrollCheckInterval.value = null;
      }
    };
    const scrollCheckInterval = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      getCurrentScrollTop().then((scrollTop2) => {
        scrollTop2.value = scrollTop2;
      });
    });
    common_vendor.watch(currentStepIndex, async () => {
      await common_vendor.nextTick$1();
      await updateCurrentTarget();
    });
    common_vendor.watch(showGuide, (newVal) => {
      if (newVal) {
        addScrollListener();
        setTimeout(async () => {
          await updateCurrentTarget();
        }, 300);
      } else {
        removeScrollListener();
      }
    });
    common_vendor.watch(() => props.show, (newVal) => {
      if (newVal) {
        startGuide();
      } else {
        showGuide.value = false;
      }
    });
    common_vendor.onUnmounted(() => {
      removeScrollListener();
    });
    common_vendor.computed(() => {
      if (!currentTargetElement.value)
        return null;
      return {
        currentStep: currentStepIndex.value + 1,
        targetSelector: currentStep.value.target,
        scrollTop: scrollTop.value,
        targetPosition: currentTargetElement.value,
        isScrolling: isScrolling.value
      };
    });
    common_vendor.ref(false);
    __expose({
      startGuide,
      skipGuide,
      completeGuide
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: showGuide.value
      }, showGuide.value ? common_vendor.e({
        b: common_vendor.s(maskStyle.value),
        c: common_vendor.s(highlightStyle.value),
        d: common_vendor.o(nextStep),
        e: common_vendor.t(currentStep.value.title),
        f: common_vendor.t(currentStepIndex.value + 1),
        g: common_vendor.t(guideSteps.value.length),
        h: common_vendor.t(currentStep.value.description),
        i: currentStepIndex.value < guideSteps.value.length - 1
      }, currentStepIndex.value < guideSteps.value.length - 1 ? {
        j: common_vendor.o(skipGuide)
      } : {}, {
        k: common_vendor.t(currentStepIndex.value < guideSteps.value.length - 1 ? "下一步" : "完成"),
        l: common_vendor.o(nextStep),
        m: common_vendor.s(cardStyle.value),
        n: common_vendor.o(() => {
        }),
        o: common_vendor.s(arrowStyle.value),
        p: common_vendor.n(arrowDirection.value),
        q: common_vendor.o(handleContainerClick)
      }) : {});
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3b17e17e"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/guide/guide.js.map
