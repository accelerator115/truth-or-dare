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
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:12", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:15", "App Hide");
  }
};
const uniPopup = () => "./components/uni-popup/uni-popup.js";
const uniTransition = () => "./components/uni-transition/uni-transition.js";
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.component("uni-popup", uniPopup);
  app.component("uni-transition", uniTransition);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
