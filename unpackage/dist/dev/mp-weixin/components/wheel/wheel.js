"use strict";
const common_vendor = require("../../common/vendor.js");
const spinDuration = 5e3;
const _sfc_main = {
  __name: "wheel",
  props: {
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
  },
  emits: ["spin-end", "spin-request"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const rotation = common_vendor.ref(0);
    const finalRotation = common_vendor.ref(0);
    const animationId = common_vendor.ref(null);
    const isAnimating = common_vendor.ref(false);
    const touchStartTime = common_vendor.ref(0);
    common_vendor.watch(() => props.spinning, (newVal) => {
      common_vendor.index.__f__("log", "at components/wheel/wheel.vue:44", "轮盘状态变化:", newVal);
      if (newVal === true) {
        common_vendor.index.__f__("log", "at components/wheel/wheel.vue:46", "开始旋转轮盘");
        startSpin();
      }
    });
    common_vendor.watch(() => props.stopRequested, (newVal) => {
      if (newVal === true && isAnimating.value) {
        common_vendor.index.__f__("log", "at components/wheel/wheel.vue:54", "收到停止请求");
        stopSpin();
      }
    });
    const getWheelItemStyle = (index) => {
      const itemCount = props.items.length;
      const angle = 360 / itemCount;
      if (itemCount <= 4) {
        return {
          position: "absolute",
          top: "0",
          left: "0",
          width: "50%",
          height: "100%",
          transformOrigin: "right center",
          transform: `rotate(${rotate}deg)`,
          backgroundColor: getItemColor(index),
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
        };
      }
      const startAngle = angle * index;
      return {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos((startAngle + angle) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle + angle) * Math.PI / 180)}%)`,
        backgroundColor: getItemColor(index)
      };
    };
    const getTextStyle = (index) => {
      const itemCount = props.items.length;
      const angle = 360 / itemCount;
      if (itemCount <= 4) {
        const midAngle2 = (angle * index + angle / 2) * Math.PI / 180;
        const radius2 = 42;
        const x2 = 50 + radius2 * Math.cos(midAngle2);
        const y2 = 50 + radius2 * Math.sin(midAngle2);
        return {
          position: "absolute",
          left: `${x2}%`,
          top: `${y2}%`,
          transform: "translate(-50%, -50%)",
          fontSize: "48rpx",
          color: "#fff",
          fontWeight: "bold",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          // 半透明背景
          borderRadius: "50%",
          width: "80rpx",
          // 增大尺寸
          height: "80rpx",
          // 增大尺寸
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
          // 增强阴影
          zIndex: 10
          // 提高z-index确保显示在最上层
        };
      }
      const midAngle = (angle * index + angle / 2) * Math.PI / 180;
      const radius = 35;
      const x = 50 + radius * Math.cos(midAngle);
      const y = 50 + radius * Math.sin(midAngle);
      let fontSize = "40rpx";
      if (itemCount <= 8) {
        fontSize = "44rpx";
      } else if (itemCount <= 12) {
        fontSize = "40rpx";
      } else if (itemCount <= 16) {
        fontSize = "36rpx";
      } else if (itemCount <= 20) {
        fontSize = "32rpx";
      } else {
        fontSize = "28rpx";
      }
      return {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        fontSize,
        color: "#fff",
        fontWeight: "bold",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        borderRadius: "50%",
        width: "60rpx",
        height: "60rpx",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        zIndex: 1
      };
    };
    const getItemColor = (index) => {
      const colors = ["#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2", "#F6AE2D"];
      return colors[index % colors.length];
    };
    const startSpin = () => {
      if (isAnimating.value)
        return;
      isAnimating.value = true;
      const minRotation = 1800;
      const extraRotation = Math.random() * 360;
      finalRotation.value = rotation.value + minRotation + extraRotation;
      const startTime = Date.now();
      const initialRotation = rotation.value;
      const finalRotationValue = finalRotation.value;
      const duration = spinDuration;
      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        if (elapsed < duration && isAnimating.value) {
          const progress = easeOutQuart(elapsed / duration);
          rotation.value = initialRotation + progress * (finalRotationValue - initialRotation);
          animationId.value = requestAF(animate);
        } else {
          isAnimating.value = false;
          if (elapsed >= duration) {
            rotation.value = finalRotationValue;
          }
          common_vendor.index.__f__("log", "at components/wheel/wheel.vue:214", "轮盘动画结束");
          emit("spin-end", getSelectedItem());
        }
      };
      animate();
    };
    const stopSpin = () => {
      if (animationId.value) {
        cancelAF(animationId.value);
        animationId.value = null;
      }
      isAnimating.value = false;
      common_vendor.index.__f__("log", "at components/wheel/wheel.vue:233", "轮盘停止，当前角度:", rotation.value);
      emit("spin-end", getSelectedItem());
    };
    const easeOutQuart = (t) => {
      return 1 - Math.pow(1 - t, 4);
    };
    const getSelectedItem = () => {
      const itemAngle = 360 / props.items.length;
      const normalizedRotation = (360 - rotation.value % 360) % 360;
      const selectedIndex = Math.floor(normalizedRotation / itemAngle);
      return props.items[selectedIndex];
    };
    const handleTouchStart = (e) => {
      touchStartTime.value = Date.now();
      if (isAnimating.value) {
        stopSpin();
      }
    };
    const handleTouchEnd = (e) => {
      const touchDuration = Date.now() - touchStartTime.value;
      if (touchDuration < 300 && !isAnimating.value) {
        if (!props.spinning) {
          emit("spin-request");
        }
      }
    };
    const handleClick = (e) => {
      if (!isAnimating.value && !props.spinning) {
        emit("spin-request");
      }
    };
    const requestAF = (callback) => {
      return setTimeout(callback, 16);
    };
    const cancelAF = (id) => {
      clearTimeout(id);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(__props.items, (item, index, i0) => {
          return {
            a: common_vendor.t(index + 1),
            b: common_vendor.s(getTextStyle(index)),
            c: index,
            d: common_vendor.s(getWheelItemStyle(index))
          };
        }),
        b: common_vendor.t(isAnimating.value ? "旋转中" : "转盘"),
        c: `rotate(${rotation.value}deg)`,
        d: common_vendor.o(handleTouchStart),
        e: common_vendor.o(handleTouchEnd),
        f: common_vendor.o(handleClick)
      };
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/wheel/wheel.js.map
