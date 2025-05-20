"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  name: "uniTransition",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modeClass: {
      type: Array,
      default() {
        return [];
      }
    },
    duration: {
      type: Number,
      default: 300
    },
    styles: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      isShow: false,
      transform: "",
      ani: {
        in: "",
        active: ""
      }
    };
  },
  watch: {
    show: {
      handler(newVal) {
        if (newVal) {
          this.open();
        } else {
          this.close();
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
        "transition-duration": this.duration / 1e3 + "s"
      };
      let transform = "";
      for (let i in styles) {
        let line = this.toLine(i);
        transform += line + ":" + styles[i] + ";";
      }
      return transform;
    },
    // 初始化动画条件
    transformStyles() {
      return "transform:" + this.transform + ";" + this.stylesObject;
    }
  },
  created() {
    this.animation = {
      transformOrigin: "50% 50%",
      timingFunction: "ease",
      delay: 0,
      duration: this.duration
    };
  },
  methods: {
    /**
     *  ref 触发 初始化动画
     */
    init(obj = {}) {
      if (obj.duration) {
        this.animation.duration = obj.duration;
      }
      this.animation.timingFunction = obj.timingFunction || "ease";
      this.animation.delay = obj.delay || 0;
      this.animation.transformOrigin = obj.transformOrigin || "50% 50%";
      this.isShow = true;
      this.$nextTick(() => {
        this.enter();
      });
    },
    /**
     * 开始过渡动画
     */
    open() {
      clearTimeout(this.timer);
      this.isShow = true;
      this.$nextTick(() => {
        this.enter();
      });
    },
    /**
     * 关闭过渡动画
     */
    close() {
      clearTimeout(this.timer);
      this.$nextTick(() => {
        this.leave();
      });
    },
    /**
     * 非APP-NVUE平台 淡入过程
     */
    enter() {
      this.animation.timingFunction = "ease";
      this.animation.duration = this.duration;
      this.ani.in = "";
      for (let i in this.modeClass) {
        if (this.modeClass[i]) {
          this.ani.in = this.modeClass[i];
        }
      }
      this.transform = "";
      this.timer = setTimeout(() => {
        this.animation = "none";
        this.isShow = false;
      }, this.duration);
    },
    /**
     * 非APP-NVUE平台 淡出过程
     */
    leave() {
      this.animation.timingFunction = "ease";
      this.animation.duration = this.duration;
      this.ani.in = "";
      for (let i in this.modeClass) {
        if (this.modeClass[i]) {
          this.ani.in = this.modeClass[i];
        }
      }
      this.transform = "";
      this.timer = setTimeout(() => {
        this.animation = "none";
        this.isShow = false;
      }, this.duration);
    },
    // 支持过渡动画
    animateStyle(styles) {
      let style = "";
      for (let i in styles) {
        let line = this.toLine(i);
        style += line + ":" + styles[i] + ";";
      }
      return style;
    },
    // 驼峰转中横线
    toLine(name) {
      return name.replace(/([A-Z])/g, "-$1").toLowerCase();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? {
    b: "translateX(" + _ctx.x + "px)"
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/components/uni-transition/uni-transition.js.map
