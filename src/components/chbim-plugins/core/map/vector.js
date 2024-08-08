/**
 * 处理矢量函数
 * @param  { Object } map  地图对象（主地图）
 * @param  { Array } vectorArr  模型数组
 */
import { updateStyle } from "../mapUtils/BaseGraphicStyle.js";

import _ from "lodash";

class BimVector {
  constructor(map, vectorArr = [], isDynamicMasking = false) {
    if (mars3d) {
      this.vectorArr = vectorArr;
      /**
       *
       * Point:点
       * LineString:线
       * Polygon:面
       * MultiPoint:多个点
       * MultiLineString:多段线
       * MultiPolygon:多个面
       *
       * */
      this.geoJsonType = new Map([
        ["Point"],
        ["LineString"],
        ["Polygon"],
        ["MultiPoint"],
        ["MultiLineString"],
        ["MultiPolygon"],
      ]);
      this.avoidanceArr = [];
      /**
       *
       *编辑的数据
       *
       * */
      this.editDate = {
        id: "",
      };
      this.isDynamicMasking = isDynamicMasking;
    } else {
      console.error("未引入指定插件");
    }
  }
  /**
   * 移除矢量数据
   * @param  { String } id 矢量数据id
   *
   */
  remove(id, customAttributes = null) {
    if (customAttributes) {
      if (customAttributes.isClone)
        window.mapClone.mapEx.removeLayer(
          window.mapClone.mapEx.getLayer(id, "vectorId")
        );
    } else {
      window.map.removeLayer(window.map.getLayer(id, "vectorId"));
      if (window.dynamicMasking) window.dynamicMasking.remove(id);
    }
  }

  /**
   * 矢量数据简化
   * @param {*} geojson  geojson数据
   * @returns  { Object }
   */

  simplifyFunc = (geojson) => {
    try {
      geojson = turf.simplify(geojson, {
        tolerance: 0.0005,
        highQuality: false,
        mutate: true,
      });
    } catch (e) {}
    return geojson;
  };

  /**
   * add 矢量数据
   * @param  { String } modelParameter 模型属性 或者 模型id
   * @param  { Object } customAttributes 自定义属性
   */
  add(modelParameter, customAttributes) {
    return new Promise((resolve, reject) => {
      /**
       * 判断是用id加载 还是 对象加载
       * */
      let item,
        isClone = customAttributes?.isClone;
      if (typeof modelParameter != "object") {
        // id加载
        let itemVector = window.map.getLayer(modelParameter, "vectorId");
        if (itemVector) {
          return resolve(itemVector);
        }
        item = this.query(modelParameter);
      } else {
        // 对象加载
        let itemVector = window.map.getLayer(modelParameter.id, "vectorId");
        if (itemVector) {
          return resolve(itemVector);
        }
        item = modelParameter;
      }
      let { value, url, id, title } = item;
      const resource = new Cesium.Resource({
        url: url,
      });
      resource
        .fetchJson()
        .then((data) => {
          let { id, title, shpInfo } = item;
          let { attributes, geometryType, geometryCount, pointCount } = shpInfo;
          if (attributes) {
            let {
              width,
              materialType,
              materialOptions,
              clampToGround,
              distanceDisplayCondition,
              distanceDisplayCondition_near,
              distanceDisplayCondition_far,
              zIndex,
              label,
              fill,
              diffHeight,
              outline,
              outlineStyle,
              color,
              pixelSize,
              outlineColor,
              outlineWidth,
              classificationType,
            } = JSON.parse(attributes);
            let shpLayer;
            /**
             * 为动态避让添加透明度;
             **/
            if (this.isDynamicMasking) {
              label.color = Cesium.Color.fromCssColorString(
                label.color
              ).withAlpha(0);

              label.outlineColor = Cesium.Color.fromCssColorString(
                label.outlineColor
              ).withAlpha(0.001);

              label.backgroundColor = Cesium.Color.fromCssColorString(
                label.backgroundColor
              ).withAlpha(0.001);

              label.background = false;
              label.outline = false;
              label.show = false;
            } else {
              label.color = Cesium.Color.fromCssColorString(label.color);
              label.outlineColor = Cesium.Color.fromCssColorString(
                label.outlineColor
              );
              label.backgroundColor = Cesium.Color.fromCssColorString(
                label.backgroundColor
              );
            }

            /**
             * 为动态避让添加透明度 end
             **/
            switch (geometryType) {
              case "LineString":
              case "MultiLineString":
                label.backgroundPadding = 5;
                shpLayer = new mars3d.layer.GeoJsonLayer({
                  data,
                  vectorId: id,
                  format: pointCount > 10000 ? this.simplifyFunc : null,
                  symbol: {
                    type: "polylineC",
                    styleOptions: {
                      width,
                      clampToGround,
                      distanceDisplayCondition,
                      distanceDisplayCondition_far,
                      distanceDisplayCondition_near,
                      materialType,
                      materialOptions,
                      classificationType,
                      label,
                    },
                  },
                  // popup: `&nbsp;&nbsp; ${title} &nbsp;&nbsp;`,
                  hasZIndex: true,
                  zIndex: zIndex,
                });
                break;
              case "Polygon":
              case "MultiPolygon":
                if (materialType == "PolyGrass") {
                  materialOptions = {
                    evenColor: new Cesium.Color(0.25, 0.4, 0.1, 1.0),
                    oddColor: new Cesium.Color(0.1, 0.1, 0.1, 1.0),
                    frequency: 1.5, // 斑驳
                  };
                }
                shpLayer = new mars3d.layer.GeoJsonLayer({
                  data,
                  vectorId: id,
                  format: pointCount > 10000 ? this.simplifyFunc : null,
                  symbol: {
                    type: "polygon",
                    styleOptions: {
                      fill,
                      diffHeight,
                      clampToGround,
                      materialType,
                      materialOptions,
                      distanceDisplayCondition,
                      distanceDisplayCondition_far,
                      distanceDisplayCondition_near,
                      outlineStyle,
                      outline,
                      classificationType,
                      label,
                    },
                  },
                  // popup: `&nbsp;&nbsp; ${title} &nbsp;&nbsp;`,
                });
                break;

              case "Point":
              case "MultiPoint":
                shpLayer = new mars3d.layer.GeoJsonLayer({
                  data,
                  vectorId: id,
                  format: pointCount > 10000 ? this.simplifyFunc : null,
                  symbol: {
                    type: "pointP",
                    styleOptions: {
                      color,
                      pixelSize,
                      outline,
                      outlineColor,
                      outlineWidth,
                      visibleDepth: false,
                      label,
                    },
                  },
                });
                break;
            }

            if (isClone) {
              window.mapClone.mapEx.addLayer(shpLayer);
            } else {
              window.map.addLayer(shpLayer);
            }

            shpLayer.bindPopup((event) => {
              console.log("event", event);
            });

            let freed = _.debounce((e) => {
              console.log("测试shp矢量加载完成");
              window.dynamicMasking.add(e, JSON.parse(attributes));
            }, 500);

            shpLayer.readyPromise
              .then((e) => {
                // 加载完成
                if (window.dynamicMasking) freed(e);
                resolve(e);
              })
              .catch((e) => {
                // 加载失败
                console.error("测试shp矢量加载失败", e);
                resolve({
                  tite: "【矢量】<" + title + ">无法加载",
                  type: "error",
                  id: id,
                  url: url,
                });
              });
          } else {
            resolve({
              tite: "【矢量】<" + title + ">无法加载",
              type: "error",
              id: id,
              url: url,
            });
          }
        })
        .catch((error) => {
          console.error("数据有误", error);
          resolve({
            tite: "【矢量】<" + title + ">链接地址有误",
            type: "error",
            id: id,
            url: url,
          });
        });
    });
  }
  /**
   * 更新 矢量数据
   * @param  { String } modelParameter 模型属性 或者 模型id
   * @param  { Object } fn 自定义注册事件
   */
  updateData(data) {
    this.vectorArr = data;
  }

  /**
   * 处理kml数据
   * @param  { Object } item 查询出来的对象
   * @returns { Object } 样式对象
   */
  processingKML(item) {
    /**
     * 处理kml样式
     */
    let classificationType,
      disableDepthTestDistance = 2000,
      visibleDepth = true;
    let { kmlInfo } = item;
    let {
      fill,
      areaColor,
      areaSideColor,
      transparency,
      isAreaSideColor,
      minDistinct,
      textDistinct,
      textSize,
      textColor,
      fontStyle,
      outLine,
      sideColor,
      backGround,
      backGroundColor,
      clampToGround,
    } = kmlInfo;
    /**
     * 面属性
     * fill => 是否填充
     * color => 颜色
     * opacity => 透明度
     * outline => 是否边框
     * outlineColor => 边框颜色
     * outlineWidth => 边框宽度
     * clampToGround => 是否贴地
     * distanceDisplayCondition => 是否按视距显示 或 指定此框将显示在与摄像机的多大距离。
     * classificationType => 指定贴地时的覆盖类型，是只对地形、3dtiles 或 两者同时。
     */
    let polygon = {
      fill,
      color: areaColor,
      opacity: transparency || 0.5,
      outline: isAreaSideColor,
      outlineColor: areaSideColor,
      outlineWidth: 2,
      clampToGround,
      // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1000000),
      distanceDisplayCondition: true,
      distanceDisplayCondition_far: textDistinct || 1000000,
      distanceDisplayCondition_near: minDistinct || 0,
      classificationType,
      opacity: String(transparency),
    };
    let label = {
      text: "{name}",
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffsetY: -10,
      font_size: 26,
      color: textColor || "#ffffff",
      font_family: fontStyle || "黑体",
      outline: outLine || true,
      outlineColor: sideColor || "#000000",
      outlineWidth: 4,
      scaleByDistance: true,
      distanceDisplayCondition: true,
      distanceDisplayCondition_far: textDistinct || 1000000,
      distanceDisplayCondition_near: minDistinct || 0,
      background: backGround || false,
      backgroundColor: backGroundColor || "",
      visibleDepth,
      clampToGround: clampToGround || false,
      disableDepthTestDistance,
    };

    return {
      ...polygon,
      label,
    };
  }

  /**
   * 选中矢量
   * @param  { String } id 模型id
   *
   */
  selected(id) {
    if (window.map.getLayer(id, "vectorId"))
      window.map.getLayer(id, "vectorId").flyTo();
  }

  /**
   * 查询矢量数据的对象wwwwwwwwww
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 查询出来的树对象 或者 false
   */
  query(id) {
    if (this.vectorArr.length == 0) return false;
    return this.vectorArr.find((e) => {
      return e.id == id;
    });
  }

  /**
   * 查询矢量实体的对象
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 查询出来的树对象 或者 false
   */
  queryVector(id) {
    return window.map.getLayer(id, "vectorId");
  }

  /**
   * 批量编辑矢量
   * @param  { String } id 对象id
   * @param  { Object } vector 矢量对象
   * @param  { Object } label  注记对象
   * @returns { Object }
   */
  editVector(id, vector, label) {
    let vectorItem = window.map.getLayer(id, "vectorId");
    // 样式数据
    let newStyle = updateStyle(vector, label);
    if (vectorItem) {
      // 已开启编辑
      vectorItem.eachGraphic((e) => {
        // 因为动态遮蔽的原因有部分label不需要直接修改 所有在false的时候移除
        if (e.label.show === false) {
          delete e.label.outline;
          delete e.label.background;
          delete e.label.outlineColor;
          delete e.label.backgroundColor;
        }
        e.setStyle({
          ...newStyle,
        });
      });

      if (window.dynamicMasking) dynamicMasking.modify(id, newStyle);
    }
  }

  /**
   * 加载国家边界线
   *
   * @returns { any }
   */
  nationalBoundaries() {
    let url = "/gis/nationalBoundaries.json";
    let graphicLayer = new mars3d.layer.GeoJsonLayer({
      name: "国界",
      url: url,
      format: (geojson) => {
        try {
          geojson = turf.simplify(geojson, {
            tolerance: 0.00001,
            highQuality: false,
            mutate: true,
          });
        } catch (e) {
          console.error(e);
        }
        return geojson;
      },
      symbol: {
        type: "polylineC",
        styleOptions: {
          width: 2,
          materialType: "Color",
          materialOptions: {
            color: "#CD9B1D",
          },
          distanceDisplayCondition: true,
          distanceDisplayCondition_near: 1000,
          distanceDisplayCondition_far: 20000000,
          clampToGround: true,
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
      },
    });
    map.addLayer(graphicLayer);
  }

  /**
   * 切换动态避让
   * @returns { any }
   */
  switchDynamicMasking(type) {
    this.isDynamicMasking = type;
  }
}
export default BimVector;
