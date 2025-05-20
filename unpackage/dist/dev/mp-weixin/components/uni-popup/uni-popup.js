"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_uni_transition2 = common_vendor.resolveComponent("uni-transition");
  _easycom_uni_transition2();
}
const _easycom_uni_transition = () => "../uni-transition/uni-transition.js";
if (!Math) {
  _easycom_uni_transition();
}
const _sfc_main = {
  __name: "uni-popup",
  props: {
    // 开启动画
    animation: {
      type: Boolean,
      default: true
    },
    // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
    type: {
      type: String,
      default: "center"
    },
    // maskClick
    maskClick: {
      type: Boolean,
      default: true
    }
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    const duration = common_vendor.ref(300);
    const ani = common_vendor.ref([]);
    const showPopup = common_vendor.ref(false);
    const showTrans = common_vendor.ref(false);
    let timer = null;
    let msgtimer = null;
    const maskClass = {
      "position": "fixed",
      "bottom": 0,
      "top": 0,
      "left": 0,
      "right": 0,
      "backgroundColor": "rgba(0, 0, 0, 0.4)"
    };
    const transClass = {
      "position": "fixed",
      "left": 0,
      "right": 0
    };
    const maskShow = common_vendor.computed(() => showPopup.value === true);
    const popupstyle = common_vendor.computed(() => props.type);
    const popupClass = common_vendor.computed(() => showPopup.value ? "uni-popup--show" : "");
    const clear = (e) => {
    };
    const open = () => {
      showPopup.value = true;
      common_vendor.nextTick$1(() => {
        new Promise((resolve) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            showTrans.value = true;
            common_vendor.nextTick$1(() => {
              resolve();
            });
          }, 50);
        }).then((res) => {
          clearTimeout(msgtimer);
          msgtimer = setTimeout(() => {
          }, 100);
        });
      });
    };
    const close = (type) => {
      showTrans.value = false;
      common_vendor.nextTick$1(() => {
        timer = setTimeout(() => {
          showPopup.value = false;
        }, 300);
      });
    };
    const onTap = () => {
      if (!props.maskClick)
        return;
      close();
    };
    __expose({
      open,
      close
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: maskShow.value
      }, maskShow.value ? {
        b: common_vendor.o(onTap),
        c: common_vendor.p({
          ["mode-class"]: ["fade"],
          styles: maskClass,
          duration: duration.value,
          show: showTrans.value
        })
      } : {}, {
        d: common_vendor.n(popupstyle.value),
        e: common_vendor.o(clear),
        f: common_vendor.o(onTap),
        g: common_vendor.p({
          ["mode-class"]: ani.value,
          styles: transClass,
          duration: duration.value,
          show: showTrans.value
        }),
        h: common_vendor.n(popupClass.value),
        i: common_vendor.o(clear)
      });
    };
  }
};
wx.createComponent(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/uni-popup/uni-popup.js.map
