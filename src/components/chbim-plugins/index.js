import Button from "./button/index.vue";
// 过度组件
import BimCutscenes from "./cutscenes/index.vue";
import "./cutscenes/stylez.css";
import "./cutscenes/js/TweenMax.min.js";
// 提示框组件
import MapModali from "./mapModali/Index.vue";
import "./mapModali/style.css";
// 背景板组件
import BimBackgroundPlate from "./backgroundPlate/Index.vue";
import "./backgroundPlate/style.css";
import "./backgroundPlate/js/three.min.js";
import "./backgroundPlate/js/Sky.js";
import "./backgroundPlate/js/charming.min.js";
// 模型js
import BimModel from "./core/map/model.js";
// 矢量js
import BimVector from "./core/map/vector.js";
// 地形js
import BimTerrainProvider from "./core/map/terrainProvider.js";
// 图层js
import BimElevationImage from "./core/map/elevationImage.js";
// 动态释放js
import ViewShed from "./core/mapUtils/ViewShed.js";
// 注记js
import BimEntity from "./core/map/entity.js";
//全景图
import PanoramicView from "./core/mapUtils/PanoramicView.ts";

import { createApp } from "vue";
export { Button, BimBackgroundPlate, BimCutscenes, MapModali };

const component = [Button, BimBackgroundPlate];

const ChbimPlugins = {
  continuation: null,
  mapModali: null,
  install(app) {
    component.forEach((item, index) => {
      app.component(item.name, item);
    });

    if (this.continuation) {
      app.config.globalProperties.$continuation = this.continuation;
      return;
    }
    let instance = createApp(BimCutscenes);
    let div = document.createElement("div");
    let body = document.body;
    body.appendChild(div);
    this.loading = instance.mount(div);
    app.config.globalProperties.$loading = this.loading;
    window.$continuation = this.loading;

    if (this.mapModali) {
      app.config.globalProperties.$mapModali = this.mapModali;
      return;
    }
    let instance2 = createApp(MapModali);
    let div2 = document.createElement("div");
    body.appendChild(div2);
    this.mapModali = instance2.mount(div2);
    app.config.globalProperties.$mapModali = this.mapModali;
    window.$mapModali = this.mapModali;
  },
};

export {
  ChbimPlugins,
  BimTerrainProvider,
  BimElevationImage,
  BimModel,
  BimVector,
  ViewShed,
  BimEntity,
  PanoramicView,
};
