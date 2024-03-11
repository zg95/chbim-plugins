/**
 * 处理地形函数
 * @param  { Object } map  地图对象（主地图）
 */
class BimTerrainProvider {
  constructor(map, terrainProviderArr = []) {
    if (mars3d) {
      this.map = map;
      this.terrainProviderArr = terrainProviderArr;
      this.terrainProviderId = "";
      this.events = {};
      this.map.on(mars3d.EventType.terrainLoadError, (event) => {
        console.error("地形服务加载失败", event);
        this.hide();
      });
      this.map.viewer.scene.globe.tileLoadProgressEvent.addEventListener(
        (queuedTileCount) => {
          if (this.map.viewer.scene.globe.tilesLoaded) {
            this.emit("load", queuedTileCount);
          }
        }
      );
    } else {
      console.error("未引入指定插件");
    }
  }

  /**
   * add 添加地形
   * @param  { Object || String } terrainProviderParameter 地形属性 或者 地形id
   */
  add(terrainProviderParameter) {
    let { url, id } = terrainProviderParameter;

    if (this.terrainProviderId == id && this.map.terrainProvider._layers) {
      return false;
    }

    this.map.terrainProvider = mars3d.LayerUtil.createTerrainProvider({
      imageXyzId: id,
      type: "xyz",
      url: url, //item.gisInfo.gisUrl,
      requestVertexNormals: true,
      requestMetadata: true,
    });
    this.terrainProviderId = id;
  }

  /**
   * 开启地形
   *
   */
  show() {
    this.map.hasTerrain = true;
  }

  /**
   * 隐藏地形
   *
   */
  hide() {
    this.map.hasTerrain = false;
  }

  /**
   * events
   * 事件监听
   * @param  { string } event - 事件名 目前只支持enter和leave
   * @param  { function } fn - 回调函数
   * @returns { any }
   */
  on(event, fn) {
    if (event == "load") {
      this.events[event]
        ? this.events[event].push(fn)
        : (this.events[event] = [fn]);
    } else {
      console.log("未开放自定义");
    }
  }

  /**
   * events
   * 事件触发
   * @param  { object | array } event - 事件名
   * @returns { any }
   */
  emit(event, ...varparms) {
    if (this.events[event] != undefined) {
      this.events[event].forEach((fn) => fn(...varparms));
    }
  }

  /**
   * events
   * 事件移除
   * @param  { string } event - 事件名
   * @param  { function } callback - 回调函数
   * @returns { any }
   */
  off(event, callback) {
    this.events[event] = this.events[event].filter((fn) => fn !== callback);
  }

  /**
   * events
   * 触发一次
   * @param  { string } event - 事件名
   * @param  { function }  fn - 回调函数
   * @returns { any }
   */
  once(event, fn) {
    const proxy = () => {
      fn();
      this.off(event, proxy);
    };
    this.on(event, proxy);
  }

  /**
   * 地形裁剪
   */
  addClip(id) {
    return new Promise((resolve, reject) => {
      if (window.bimClip) {
        resolve(bimClip.clipGisAdd(id));
      } else {
        reject("挖洞工具未初始化");
      }
    });
  }
}
export default BimTerrainProvider;
