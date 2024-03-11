/**
 * 处理影像函数
 * @param  { Object } map  地图对象（主地图）
 * @param  { Array } elevationImageArr  影像数组
 */
class BimElevationImage {
  constructor(map, elevationImageArr = []) {
    if (mars3d) {
      this.map = map;
      this.elevationImageArr = elevationImageArr;
      this.elevationImageLayer;
      // 默认数据
      this.form = {
        brightnessVal: 1.3, //环境亮度配置
        msaaSamples: 4, //反锯齿配置
        surfaceOpacity: 1, //地表不透明度
        layerOpacity: 1, //瓦片透明度
        layerBrightness: 2, //瓦片亮度
        layerContrast: 1, //瓦片对比度
        layerHue: 0, //瓦片色彩
        layerSaturation: 1, //瓦片饱和度
        layerGamma: 1, //瓦片伽马值
      };
      // console.log("elevationImageArr", this.elevationImageArr);
    } else {
      console.error("未引入指定插件");
    }
  }

  /**
   * 给影像数组添加数据
   * @param  { Object } data 集合数据
   */
  pushVector(data) {
    this.elevationImageArr.push(data);
  }

  /**
   * 添加影像
   * @param  { Object || String } xyzParameter 影像属性 或者 影像id
   * @param  { Object } fn 监听函数
   *
   */
  add(xyzParameter, fn) {
    // 如果重复加载 阻止
    let repeatedId;
    typeof xyzParameter != "object"
      ? (repeatedId = xyzParameter)
      : (repeatedId = xyzParameter.imageXyzId);
    if (this.map.getLayer(repeatedId, "imageXyzId")) {
      return false;
    }

    const {
      layerOpacity,
      layerBrightness,
      layerContrast,
      layerHue,
      layerSaturation,
      layerGamma,
      surfaceOpacity,
    } = this.exposureEnvironmentSettings();

    return new Promise((resolve, reject) => {
      let imageXyzId, url, zIndex;
      if (typeof xyzParameter != "object") {
        let xyz = this.query(xyzParameter);
        if (!xyz) reject("缺少树结构");
        let { gisInfo } = xyz;
        imageXyzId = gisInfo.id;
        zIndex = gisInfo.order;
        url = xyz.url;
      } else {
        imageXyzId = xyzParameter.imageXyzId;
        url = xyzParameter.url;
        zIndex = xyzParameter.zIndex;
      }
      this.elevationImageLayer = new mars3d.layer.XyzLayer({
        imageXyzId,
        type: "xyz",
        url, //item.gisUrl,
        hasZIndex: true, //是否可以调整图层顺序（在同类型图层间）
        zIndex: zIndex.toString(), //图层顺序，数字大的在上面。（当hasZIndex为true时）
        brightness: layerBrightness, //亮度0.0-1.0。
        opacity: layerOpacity,
        saturation: layerSaturation,
        contrast: layerContrast,
        hue: layerHue,
        gamma: layerGamma,
        alpha: surfaceOpacity,
        show: true,
      });
      this.elevationImageLayer.on(mars3d.EventType.load, (event) => {
        resolve(event);
      });
      this.map.addLayer(this.elevationImageLayer);
      // 自定义注册事件
      if (fn) {
        Object.keys(fn).forEach((item) => {
          this.elevationImageLayer.on(fnType.get(item), (event) => {
            fn[item](event);
          });
        });
      }
    });
  }

  /**
   * 移除影像方法
   * @param  { String } id 影像id
   *
   */
  remove(id) {
    console.log(id);
    this.map.removeLayer(this.map.getLayer(id, "imageXyzId"));
  }

  /**
   * 查询影像方法
   * @param  { String } id 模型属性
   * @returns { Object || Boolean } 查询出来的对象 或者 false
   */
  query(id) {
    if (this.elevationImageArr.length == 0) return false;
    return this.elevationImageArr.find((e) => {
      return e.id == id;
    });
  }

  /**
   *
   * 初始化数据
   * @returns { any }
   */
  initial() {
    this.elevationImageArr = [];
    this.elevationImageLayer = null;
  }

  /**
   *
   * 是否读取本地化数据 来初始化地球
   * @returns { any }
   */
  exposureEnvironmentSettings() {
    if (localStorage.getItem("environmentSettings")) {
      return JSON.parse(localStorage.getItem("environmentSettings"));
    } else {
      localStorage.setItem("environmentSettings", JSON.stringify(this.form));
      return JSON.parse(JSON.stringify(this.form));
    }
  }
}
export default BimElevationImage;
