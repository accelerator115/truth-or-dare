"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  wheel();
}
const wheel = () => "../../components/wheel/wheel.js";
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const selectedMode = common_vendor.ref("truth");
    const newItem = common_vendor.ref("");
    const items = common_vendor.ref([]);
    const isSpinning = common_vendor.ref(false);
    const stopRequested = common_vendor.ref(false);
    const selectedItem = common_vendor.ref({ text: "" });
    const history = common_vendor.ref([]);
    const defaultTruth = [
      "你最喜欢的一首歌是什么？",
      "你最欣赏自己的哪一点？",
      "你最近一次撒谎是什么时候？",
      "你有什么不为人知的特长？",
      "你的初恋是什么时候？",
      "如果明天是世界末日，你会做什么？",
      "你的手机里有什么不想被别人看到的东西？",
      "你最尴尬的经历是什么？",
      "你心目中的理想型是什么样的？",
      "你最近做过最疯狂的事是什么？"
    ];
    const defaultDare = [
      "模仿一种动物的叫声",
      "唱一首歌的副歌部分",
      "做10个俯卧撑",
      "向在场的异性表白",
      "模仿一个电影角色",
      "讲一个笑话",
      "跳一段即兴舞蹈",
      "站在椅子上转三圈",
      "给自己的前任发一条祝福信息",
      "让在场的一位朋友给你拍一张丑照并设为头像24小时"
    ];
    const filteredItems = common_vendor.computed(() => {
      return items.value.filter((item) => item.type === selectedMode.value);
    });
    common_vendor.onMounted(() => {
      try {
        const savedItems = common_vendor.index.getStorageSync("truth-or-dare-items");
        if (savedItems) {
          items.value = JSON.parse(savedItems);
        }
        const savedMode = common_vendor.index.getStorageSync("truth-or-dare-mode");
        if (savedMode) {
          selectedMode.value = savedMode;
        }
        const savedHistory = common_vendor.index.getStorageSync("truth-or-dare-history");
        if (savedHistory) {
          history.value = JSON.parse(savedHistory);
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:131", "读取本地存储失败:", e);
      }
    });
    const selectMode = (mode) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:137", "选择模式:", mode);
      selectedMode.value = mode;
      try {
        common_vendor.index.setStorageSync("truth-or-dare-mode", mode);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:143", "保存模式失败:", e);
      }
    };
    const addItem = () => {
      if (!newItem.value.trim()) {
        common_vendor.index.showToast({
          title: "内容不能为空",
          icon: "none"
        });
        return;
      }
      const isDuplicate = items.value.some(
        (item) => item.text.trim().toLowerCase() === newItem.value.trim().toLowerCase() && item.type === selectedMode.value
      );
      if (isDuplicate) {
        common_vendor.index.showToast({
          title: "该内容已存在",
          icon: "none"
        });
        return;
      }
      items.value.push({
        text: newItem.value.trim(),
        type: selectedMode.value
      });
      try {
        common_vendor.index.setStorageSync("truth-or-dare-items", JSON.stringify(items.value));
        newItem.value = "";
        common_vendor.index.showToast({
          title: "添加成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:185", "保存项目失败:", e);
      }
    };
    const deleteItem = (index) => {
      items.value.splice(index, 1);
      try {
        common_vendor.index.setStorageSync("truth-or-dare-items", JSON.stringify(items.value));
        common_vendor.index.showToast({
          title: "删除成功",
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:200", "删除项目失败:", e);
      }
    };
    const importDefaultItems = () => {
      const defaultItems = selectedMode.value === "truth" ? defaultTruth : defaultDare;
      const existingTexts = items.value.map((item) => item.text);
      const newItems = defaultItems.filter((text) => !existingTexts.includes(text)).map((text) => ({ text, type: selectedMode.value }));
      if (newItems.length === 0) {
        common_vendor.index.showToast({
          title: "已经导入过默认内容了",
          icon: "none"
        });
        return;
      }
      items.value = [...items.value, ...newItems];
      try {
        common_vendor.index.setStorageSync("truth-or-dare-items", JSON.stringify(items.value));
        common_vendor.index.showToast({
          title: `导入${newItems.length}个内容`,
          icon: "success"
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:231", "导入默认内容失败:", e);
      }
    };
    const startSpin = () => {
      if (filteredItems.value.length < 3) {
        common_vendor.index.showToast({
          title: "当前模式下至少需要3个内容",
          icon: "none"
        });
        return;
      }
      if (isSpinning.value)
        return;
      common_vendor.index.__f__("log", "at pages/index/index.vue:245", "开始旋转轮盘");
      isSpinning.value = true;
      stopRequested.value = false;
    };
    const stopSpin = () => {
      if (!isSpinning.value)
        return;
      common_vendor.index.__f__("log", "at pages/index/index.vue:253", "请求停止轮盘");
      stopRequested.value = true;
    };
    const onSpinEnd = (item) => {
      common_vendor.index.__f__("log", "at pages/index/index.vue:257", "轮盘停止，选中项目:", item);
      isSpinning.value = false;
      stopRequested.value = false;
      selectedItem.value = item;
      const historyItem = {
        text: item.text,
        type: selectedMode.value,
        date: (/* @__PURE__ */ new Date()).toLocaleString()
      };
      history.value.unshift(historyItem);
      if (history.value.length > 20) {
        history.value = history.value.slice(0, 20);
      }
      try {
        common_vendor.index.setStorageSync("truth-or-dare-history", JSON.stringify(history.value));
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:278", "保存历史记录失败:", e);
      }
      common_vendor.nextTick$1(() => {
        common_vendor.index.showModal({
          title: selectedMode.value === "truth" ? "真心话" : "大冒险",
          content: item.text,
          showCancel: false,
          confirmText: "知道了"
        });
      });
    };
    const clearHistory = () => {
      common_vendor.index.showModal({
        title: "确认清空",
        content: "确定要清空所有历史记录吗？",
        success: (res) => {
          if (res.confirm) {
            history.value = [];
            common_vendor.index.setStorageSync("truth-or-dare-history", "[]");
            common_vendor.index.showToast({
              title: "已清空历史记录",
              icon: "success"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedMode.value === "truth" ? 1 : "",
        b: common_vendor.o(($event) => selectMode("truth")),
        c: selectedMode.value === "dare" ? 1 : "",
        d: common_vendor.o(($event) => selectMode("dare")),
        e: common_vendor.o(addItem),
        f: newItem.value,
        g: common_vendor.o(($event) => newItem.value = $event.detail.value),
        h: common_vendor.o(addItem),
        i: common_vendor.o(importDefaultItems),
        j: items.value.length > 0
      }, items.value.length > 0 ? {
        k: common_vendor.t(items.value.length),
        l: common_vendor.f(items.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.type === "truth" ? "真心话" : "大冒险"),
            b: common_vendor.t(item.text),
            c: common_vendor.o(($event) => deleteItem(index), index),
            d: index,
            e: item.type === selectedMode.value ? 1 : ""
          };
        })
      } : {}, {
        m: filteredItems.value.length >= 3
      }, filteredItems.value.length >= 3 ? {
        n: common_vendor.o(onSpinEnd),
        o: common_vendor.o(startSpin),
        p: common_vendor.p({
          items: filteredItems.value,
          spinning: isSpinning.value,
          stopRequested: stopRequested.value
        }),
        q: common_vendor.t(isSpinning.value ? "旋转中..." : "开始旋转"),
        r: common_vendor.o(startSpin),
        s: isSpinning.value ? 1 : "",
        t: common_vendor.o(stopSpin),
        v: !isSpinning.value ? 1 : ""
      } : {}, {
        w: history.value.length > 0
      }, history.value.length > 0 ? {
        x: common_vendor.f(history.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.type === "truth" ? "真心话" : "大冒险"),
            b: common_vendor.t(item.date),
            c: common_vendor.t(item.text),
            d: index
          };
        }),
        y: common_vendor.o(clearHistory)
      } : {});
    };
  }
};
wx.createPage(_sfc_main);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
