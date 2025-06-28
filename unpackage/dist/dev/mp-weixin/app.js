"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
if (!Math) {
  "./pages/index/index.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "真心话大冒险应用启动");
    common_vendor.index.setNavigationBarTitle({
      title: "真心话大冒险"
    });
    this.checkNewUserGuide();
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:15", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:18", "App Hide");
  },
  methods: {
    checkNewUserGuide() {
      try {
        const guideCompleted = common_vendor.index.getStorageSync("truth-or-dare-guide-completed");
        if (!guideCompleted) {
          common_vendor.index.__f__("log", "at App.vue:25", "检测到新用户，将显示新手指引");
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at App.vue:29", "检查新手指引状态失败:", e);
      }
    }
  }
};
const uniPopup = () => "./components/uni-popup/uni-popup.js";
const uniTransition = () => "./components/uni-transition/uni-transition.js";
const guide = () => "./components/guide/guide.js";
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.component("uni-popup", uniPopup);
  app.component("uni-transition", uniTransition);
  app.component("guide", guide);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
