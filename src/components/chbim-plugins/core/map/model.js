/**
 * 处理模型函数
 * @param  { Object } map  地图对象（主地图）
 * @param  { Array } modelArr  模型数组
 */

class BimModel {
  constructor(map, modelArr = []) {
    if (mars3d) {
      this.map = map;
      // 当前操作的模型对象
      this.tilesetLayer;
      // 所有模型数据
      this.modelArr = modelArr;
      // 加载过的倾斜摄影 id
      this.bimObliquePhotographyId = [];
      // 选中的模型
      this.editDate = {
        id: null,
      };
    } else {
      console.error("未引入指定插件");
    }
  }
  /**
   * 给 modelArr 添加数据
   * @param  { Object } mode 模型数据
   */
  pushModel(mode) {
    this.modelArr.push(mode);
  }

  /**
   * add 模型方法
   * @param  { Object || String } modelParameter 模型属性 或者 模型id
   * @param  { Object } fn 自定义注册事件
   * @param  { Object } customAttributes 自定义属性
   */
  add(modelParameter, fn, customAttributes) {
    /**
     * modelId 模型id
     * modelType 模型类型 --  0 倾斜摄影  --  1 白膜  --  2 普通模型
     * tender 标段信息（目前都安独有）
     * releasedDistance 动态释放的距离
     * modelTitle 模型名称
     * permission 是否可以动态释放
     * customize 配置属性
     *  -- bimModelExcavationDetails 挖洞数据
     * url 模型链接
     */

    const fnType = new Map([["click", mars3d.EventType.click]]);
    return new Promise((resolve, reject) => {
      let modelId,
        modelType,
        tender,
        releasedDistance,
        modelTitle,
        permission,
        customize,
        url,
        color;

      // 通过id添加
      if (typeof modelParameter != "object") {
        let model = this.query(modelParameter);
        if (!model) reject("缺少树结构");
        let { id, bimModelExcavationDetails, bimModel } = model;
        modelId = id;
        modelType = bimModel.modelType;
        tender = bimModel.tender;
        releasedDistance = bimModel.releasedDistance;
        modelTitle = bimModel.modelName;
        permission = bimModel.isDynamicReleased;
        customize = {
          bimModelExcavationDetails,
        };
        url = model.url;
        color = bimModel.modelColor;
      } else {
        modelId = modelParameter.modelId;
        modelType = modelParameter.modelType;
        tender = modelParameter.tender;
        releasedDistance = modelParameter.releasedDistance;
        modelTitle = modelParameter.modelTitle;
        permission = modelParameter.permission;
        customize = modelParameter.customize;
        url = modelParameter.url;
        color = modelParameter.color;
      }
      // 自定义属性
      if (customAttributes && customAttributes.color)
        color = customAttributes.color;

      let itemModel = this.map.getLayer(modelParameter, "modelId");

      if (itemModel) {
        resolve(itemModel);
        return false;
      } else {
        /**
         * 数据验证
         * 第一种 很多url 都是不全的
         */

        if (url.indexOf("tileset.json") < 0) {
          console.error("链接不完整", modelTitle);
          resolve({
            tite: "【模型】" + modelTitle + "数据地址有误",
            type: "error",
            id: modelId,
            url: url,
          });
          return false;
        }

        /**
         * 数据验证
         * 第二种 很多url 请求出来是 404
         */
        const resource = new Cesium.Resource({
          url: url,
        });
        resource
          .fetchJson()
          .then((jsonData) => {
            let style = null;
            // let highlight = null;
            let clip = { enabled: true, precise: false };
            let area = [];
            if (color) {
              style = {
                color: { conditions: [["true", color]] },
              };
            }

            if (window.bimClip && window.bimClip.activeObj[modelId]) {
              Object.keys(window.bimClip.activeObj[modelId]).forEach((key) => {
                let { item } = window.bimClip.activeObj[modelId][key];
                let { bimModelExcavationDetails } = item;
                let { excavationDetails } = bimModelExcavationDetails;
                area.push({
                  positions: JSON.parse(excavationDetails).excavationDetails,
                  id: Number(key),
                });
              });

              if (area.length > 0) {
                clip.area = area;
              }
              // console.log("clip", clip);
            }

            // 通过对象添加
            this.tilesetLayer = new mars3d.layer.TilesetLayer({
              modelId,
              modelType,
              tender,
              releasedDistance,
              modelTitle,
              permission,
              customize,
              url: encodeURI(url),
              flat: {
                precise: false,
                enabled: true,
              },
              skipLevelOfDetail: true,
              loadSiblings: true,
              cullRequestsWhileMoving: true,
              cullRequestsWhileMovingMultiplier: 10,
              preferLeaves: true,
              progressiveResolutionHeightFraction: 0.5,
              dynamicScreenSpaceError: true,
              preloadWhenHidden: false,
              style,
              clip,
              cacheBytes: 1073741824 * 2, // 1024MB = 1024*1024*1024
              maximumCacheOverflowBytes: 2147483648 * 2, // 2048MB = 2048*1024*1024
              // 1.04版本
              // customShader: new Cesium.CustomShader({
              //   lightingModel: Cesium.LightingModel.UNLIT,
              // }),
            });
            // 铭牌 配置 有构件名称显示构件 没有显示模型名称
            this.tilesetLayer.bindPopup((event) => {
              if (event.graphic) {
                const attr = event.graphic.attr;
                let symbolIndex = null,
                  name = null;
                if (JSON.stringify(attr) !== "{}") {
                  if (attr.name) {
                    symbolIndex = attr.name.lastIndexOf("@");
                  }
                  if (symbolIndex && symbolIndex > -1) {
                    name = attr.name.slice(0, symbolIndex);
                  }
                  return attr.name
                    ? `&nbsp;&nbsp;<span>${
                        name ? name : attr.name
                      }</span>&nbsp;&nbsp;`
                    : `&nbsp;&nbsp;<span>${modelTitle}</span>&nbsp;&nbsp;`;
                } else {
                  return `&nbsp;&nbsp;<span>${modelTitle}</span>&nbsp;&nbsp;`;
                }
              } else {
                return `&nbsp;&nbsp;<span>${modelTitle}</span>&nbsp;&nbsp;`;
              }
            });

            this.tilesetLayer.readyPromise
              .then((e) => {
                console.log("加载完成", this.tilesetLayer, e);
                // 加载完成
                // 处理  剪切面
                resolve(e);
                let { modelId } = e.options;
                e.clip.options.area.forEach((item) => {
                  if (window.bimClip.activeObj[modelId][item.id].id == null)
                    window.bimClip.activeObj[modelId][item.id].id = item.id;
                });
              })
              .catch((e) => {
                // 加载失败
                resolve();
              });
            this.tilesetLayer.on("click", (e) => {
              if (e.layer.style == null && map.bimMapEdit == "0")
                e.layer.openHighlight(
                  {
                    color: "rgba(255,0,0,1)",
                  },
                  true
                );
              // 用户选中会改变  selectedModelId
              // store.selectedModelId = e.layer.options.modelId;
            });
            // 自定义注册事件
            if (fn) {
              Object.keys(fn).forEach((item) => {
                this.tilesetLayer.on(fnType.get(item), (event) => {
                  fn[item](event);
                });
              });
            }

            if (modelType == 0) {
              this.bimObliquePhotographyId.push(modelId);
            }
            this.map.addLayer(this.tilesetLayer);
          })
          .catch((error) => {
            console.error("数据加载失败", modelTitle);
            resolve({
              tite: "【模型】" + modelTitle + "数据加载失败",
              type: "error",
              id: modelId,
              url,
            });
          });
      }
    });
  }

  /**
   * 移除模型方法
   * @param  { String } id 模型id
   *
   */
  remove(id) {
    let item = this.map.getLayer(id, "modelId");
    if (item) {
      this.map.getLayer(id, "modelId").closeHighlight();
      this.map.removeLayer(this.map.getLayer(id, "modelId"));
    }
  }

  /**
   * 选中模型
   * @param  { String } id 模型id
   * @param  { Object } fn 自定义注册事件
   *
   */
  selected(id, fn, flyTo = true) {
    return new Promise((resolve, reject) => {
      let itemModel = this.map.getLayer(id, "modelId");
      if (itemModel) {
        if (flyTo) itemModel.flyTo();
        /**
         * 如果模型自带颜色就不用高亮
         */
        if (itemModel.style == null && map.bimMapEdit == "0")
          itemModel.openHighlight(
            {
              color: "rgba(255,0,0,1)",
            },
            true
          );
        // 记录用户选中的模型id
        resolve(itemModel);
      } else {
        /**
         *  模型因为动态释放没有加载地图上
         */
        this.add(id, fn).then((item) => {
          if (item) {
            if (flyTo) item.flyTo();
            if (item.style == null && map.bimMapEdit == "0") {
              item.openHighlight(
                {
                  color: "rgba(255,0,0,1)",
                },
                true
              );
            }
            resolve(item);
          }
        });
      }
    });
  }

  /**
   *
   * 初始化数据
   * @returns { any }
   */
  initial() {
    this.modelArr = [];
    this.bimObliquePhotographyId = [];
    this.tilesetLayer = null;
  }

  /**
   * 查询动态释放模型方法
   * @param  { String } id 模型属性
   * @returns { Object || Boolean } 查询出来的树对象 或者 false
   */
  query(id) {
    if (this.modelArr.length == 0) return false;
    return this.modelArr.find((e) => {
      return e.id == id;
    });
  }

  /**
   * 查询矢量数据的实体
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 返回标绘实体
   */
  queryModel(id) {
    return this.map.getLayer(id, "modelId");
  }

  /**
   * 用户操作的模型
   * @param  { String } id 模型属性
   */
  postEditDate(id) {
    this.editDate = {
      id: id,
    };
  }

  /**
   * 更新模型颜色
   * @param  { String | Object} id 模型属性 或者 模型对象
   * @param  { String | Number } newColor 需要着色的颜色
   * @param  { String } selectcontent 判断逻辑 默认是全部染色
   */
  editColor(id, newColor, selectcontent = "true") {
    let itemModel;
    if (typeof id != "object") {
      itemModel = this.map.getLayer(id, "modelId");
    } else {
      itemModel = id;
    }
    // 更新用户操作模型
    if (itemModel) {
      this.postEditDate(id);
      if (newColor) {
        itemModel.style = {
          color: {
            conditions: [[selectcontent, newColor]],
          },
        };
      } else {
        // 如果模型有自带颜色就染色 没有就移除
        let oldColor = this.query(id).modelColor;
        oldColor
          ? (itemModel.style = {
              color: { conditions: [[selectcontent, oldColor]] },
            })
          : (itemModel.style = null);
      }
    }
  }
  /**
   * 更新模型透明度
   * @param  { String } id 模型属性
   * @param  { String | Number } opacity 透明度值
   */
  editOpacity(id, opacity) {
    this.map.getLayer(id, "modelId").opacity = opacity;
  }

  /**
   * 模型挖洞
   */
  addClip(id) {
    return new Promise((resolve, reject) => {
      if (window.bimClip) {
        resolve(bimClip.clipModelAdd(id));
      } else {
        reject("挖洞工具未初始化");
      }
    });
  }

  /**
   * 模型挖洞 移除
   */
  removeClip(id) {
    if (window.bimClip) {
      window.bimClip.clipModelremoveClip(id);
    } else {
      console.log("挖洞工具未初始化");
    }
  }
  // tilesetLayer.clip.clear()
}
export default BimModel;
