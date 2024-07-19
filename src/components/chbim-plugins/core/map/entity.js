/**
 * 处理标绘实例函数
 * @param  { Object } map  地图对象（主地图）
 * @param  { Array } 标绘数据
 */
import { updateStyle } from "../mapUtils/BaseGraphicStyle.js";
class BimEntity {
  constructor(entityArr = [], fn) {
    if (mars3d) {
      // 标绘实例数组
      this.entityArr = entityArr;
      // 标绘实例图层
      this.entityLayer = new mars3d.layer.GraphicLayer({
        entityId: "bimEntity",
      });
      window.map.addLayer(this.entityLayer);

      // 当前编辑的标绘
      this.entityItem = null;
      this.events = {};
      this.entityCloneLayer;
    } else {
      console.error("未引入指定插件");
    }
  }

  /**
   * events
   * 事件监听
   * @param  { string } event - 事件名 目前只支持change和collection
   * @param  { function } fn - 回调函数
   * @returns { any }
   */
  on(event, fn) {
    if (event == "change" || event == "collection") {
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
   * 添加标会实例
   * @param  { String } modelParameter 标绘实例id 或者 标绘参数
   *
   */
  add(modelParameter, entityId = null, customAttributes) {
    return new Promise((resolve, reject) => {
      if (this.entityLayer) {
        let itemEntity,
          item,
          graphic,
          isClone = customAttributes?.isClone;
        if (isClone) {
          if (this.entityCloneLayer) {
            item = this.query(modelParameter);
            graphic = JSON.parse(item.bimPlanPainting.graphic);
            graphic.attr = graphic.attr || {};
            graphic.attr.entityId = modelParameter;
            this.entityCloneLayer.addGraphic(graphic);
          }
        } else {
          // graphic 矢量对象数据
          if (typeof modelParameter != "object") {
            itemEntity = this.entityLayer.getGraphicByAttr(
              modelParameter,
              "entityId"
            );
            item = this.query(modelParameter);
            graphic = JSON.parse(item.bimPlanPainting.graphic);
            graphic.attr = graphic.attr || {};
            graphic.attr.entityId = modelParameter;
          } else {
            itemEntity = this.entityLayer.getGraphicByAttr(
              modelParameter.id,
              "entityId"
            );
            graphic = JSON.parse(JSON.stringify(modelParameter));
            graphic.attr = graphic.attr || {};
            graphic.attr.entityId = graphic.attr.entityId || entityId;
            if (graphic.attr == undefined) {
              graphic.attr = {
                entityId: modelParameter.id,
              };
            } else if (graphic.attr?.entityId == undefined && entityId) {
              graphic.attr.entityId = entityId;
            }
          }

          if (itemEntity) {
            return resolve();
          } else {
            // 添加标绘
            this.entityLayer.addGraphic(graphic);
            resolve(graphic);
          }
        }
      } else {
        resolve();
        console.error("未初始化标绘实例图层");
      }
    });
  }

  /**
   * 查询矢量数据的对象
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 查询出来的树对象 或者 false
   */
  query(id) {
    if (this.entityArr.length == 0) return false;
    return this.entityArr.find((e) => {
      return e.id == id;
    });
  }

  /**
   * 查询矢量数据的实体
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 返回标绘实体
   */
  queryEntity(id) {
    if (bimEntity.entityLayer)
      return bimEntity.entityLayer.getGraphicByAttr(id, "entityId");
  }

  /**
   * 选中标绘
   * @param  { String } id 模型id
   *
   */
  selected(id, customAttributes = null) {
    let item = this.entityLayer.getGraphicByAttr(id, "entityId"),
      isClone = customAttributes?.isClone;
    if (item._point && item._point._alt > 0) {
      item.flyTo({
        radius: item._point._alt + 500,
      });
    } else {
      item.flyTo();
    }
  }

  /**
   * 移除标绘
   * @param  { String } id 模型id
   *
   */
  remove(id, customAttributes = null) {
    let isClone = customAttributes?.isClone;
    if (isClone) {
      if (this.entityCloneLayer) {
        this.entityCloneLayer.getGraphicByAttr(id, "entityId").remove();
      }
    } else {
      if (this.entityLayer.getGraphicByAttr(id, "entityId")) {
        this.entityLayer.getGraphicByAttr(id, "entityId").remove();
        if (
          this.entityItem &&
          (this.entityItem._state == "destroy" ||
            this.entityItem.options.attr.entityId == id)
        )
          this.entityItem = null;
      }
    }
  }

  entityCloneLayerInit() {
    if (this.entityCloneLayer == null) {
      this.entityCloneLayer = window.mapClone._mapEx.getLayer(
        "bimEntity",
        "entityId"
      );
    }
  }

  /**
   * 移除克隆场景的标绘
   *
   */
  entityCloneLayerRemove() {
    console.log("没用移除");
    this.entityCloneLayer.remove();
    this.entityCloneLayer = null;
  }

  /**
   * 移除当前标绘对象
   * @param  { String } id 模型id
   *
   */
  removeEntityItem() {
    this.entityItem = null;
  }

  /**
   * 更新 矢量数据集合
   * @param  { String } modelParameter 模型属性 或者 模型id
   * @param  { Object } fn 自定义注册事件
   */
  updateData(data) {
    this.entityArr = data;
  }

  /**
   * 开始绘制标绘
   * @param  { Object } data 标绘参数
   *
   */
  startDrawGraphic(data) {
    let { type, style } = data;
    if (type == "div") {
      if (style.html) {
        // 收藏添加
        this.entityLayer.startDraw(data).then((graphic) => {
          setTimeout(() => {
            this.entityItem = graphic;
            this.entityLayer.startEditing(graphic);
          }, 500);
        });
      } else {
        let {
          title,
          divType,
          theme_color,
          font_color,
          scaleByDistance,
          scaleByDistance_far,
          scaleByDistance_farValue,
          scaleByDistance_near,
          scaleByDistance_nearValue,
          distanceDisplayCondition,
          distanceDisplayCondition_far,
          distanceDisplayCondition_near,
          clampToGround,
        } = style;
        let newData = {
          type: "div",
          style: {
            pointerEvents: true,
            scaleByDistance,
            scaleByDistance_far,
            scaleByDistance_farValue,
            scaleByDistance_near,
            scaleByDistance_nearValue,
            distanceDisplayCondition,
            distanceDisplayCondition_far,
            distanceDisplayCondition_near,
            clampToGround,
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          },
        };
        switch (divType) {
          case "1":
            newData.style.html = `<div class="entity-div-style entity-div-style1" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
          </div>`;
            newData.style.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
            break;
        }
        this.entityLayer.startDraw(newData).then((graphic) => {
          setTimeout(() => {
            this.entityItem = graphic;
            this.entityLayer.startEditing(graphic);
          }, 500);
        });
      }
    } else {
      this.entityLayer.startDraw(data).then((graphic) => {
        setTimeout(() => {
          this.entityItem = graphic;
          this.entityLayer.startEditing(graphic);
        }, 500);
      });
    }
  }

  /**
   * 停止绘制标绘
   *
   */
  stopDraw(isentityItem = true) {
    if (this.entityLayer) this.entityLayer.stopDraw();
    if (isentityItem && this.entityItem) {
      this.entityItem.stopEditing();
      this.entityItem.remove();
      this.entityItem = null;
    }
  }

  /**
   * 更新标绘
   * @param  { Object } data 标绘参数
   *
   */
  updateEntityItem(id) {
    let item = this.entityLayer.getGraphicByAttr(id, "entityId");
    if (item) this.entityItem = item;
  }

  /**
   * 编辑标绘
   * @param  { String | Number } id 标绘id或者是edit新建标绘
   * @param  { Object } vector 标绘主体
   * @param  { Object } label 标绘label
   * @param  { String } 自定义类型 目前有div
   */
  edit(id, vector, label, customType) {
    let newStyle = updateStyle(vector, label);
    if (vector.vectorStyle && this.entityItem) {
      // console.log("edit", vector.vectorStyle.divType, this.entityItem);
      // 已开启编辑
      if (vector.vectorStyle.divType == 5) {
        // 轴心变化 比较重要
        this.entityItem.setStyle({
          ...newStyle,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        });
      } else {
        // console.log("newStyle", newStyle);
        this.entityItem.setStyle({
          ...newStyle,
          // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        });
      }
    }
  }

  /**
   * 开启拖动/关闭拖动
   * @param  { Boolean } isEnableDragging 是否开启
   */
  enableDragging(isEnableDragging = true) {
    if (isEnableDragging) {
      this.entityLayer.startEditing(this.entityItem);
    } else {
      this.entityLayer.stopDraw();
      if (this.entityItem) this.entityItem.stopEditing();
    }
  }

  /**
   * 添加右键菜单
   *
   */
  addRightMenu() {
    // 给标绘图层绑定菜单
    this.entityLayer.bindContextMenu([
      {
        text: "编辑对象",
        callback: (e) => {
          this.emit("change", e);
        },
      },
      {
        text: "收藏对象",
        callback: (e) => {
          this.emit("collection", e);
        },
      },
    ]);
  }

  /**
   * 移除右键菜单
   *
   */
  removeRightMenu() {
    if (this.entityLayer.hasContextMenu()) this.entityLayer.unbindContextMenu();
  }

  /**
   * 解耦div数据
   * @param  { String } htmlString HTML字符串
   * @returns { Object } 返回的是表单数据
   */
  processDivData(htmlString) {
    // 样式属性
    let correspondStyle = {
      "--theme-color1": "theme_color",
      "--theme-font-color1": "font_color",
      "--theme-color2": "theme_color2",
      "--theme-color3": "theme_color3",
    };
    let data = {
      title: "",
      theme_color: "",
      font_color: "",
      content: "",
      divType: "",
      divStyle: {},
    };
    // 将HTML字符串转为DOM节点
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlString;
    const targetElement = divElement.querySelector(".entity-div-style");
    console.log("解耦", targetElement);
    // 获取内联样式中的CSS变量
    Object.keys(correspondStyle).forEach((key) => {
      if (key == "--theme-color2" || key == "--theme-color3") {
        data.divStyle[correspondStyle[key]] =
          targetElement.style.getPropertyValue(key) || "#fff";
      } else {
        data[correspondStyle[key]] = targetElement.style.getPropertyValue(key);
      }
    });
    data.title = targetElement.querySelector(".title")
      ? targetElement.querySelector(".title").innerText
      : "标题";
    data.content = targetElement.querySelector(".content")
      ? targetElement.querySelector(".content").innerText
      : "内容";
    data.divType = targetElement.classList[1]
      ? targetElement.classList[1].replace("entity-div-style", "")
      : "";

    return data;
  }

  /**
   * 更新html数据
   * @param  { String } divType 类型
   * @param  { Object } list 配合类型的样式参数
   * @returns { Object } html 字符串
   */
  updateHtml(divType, htmlStyle) {
    let { theme_color, font_color, title, content, divStyle } = htmlStyle;
    let { theme_color2, theme_color3 } = divStyle;
    let html = "";
    switch (divType) {
      case "1":
        html = `<div class="entity-div-style entity-div-style1" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
          </div>`;
        break;
      case "2":
        html = `<div class="entity-div-style entity-div-style2" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
            <div class="mars3d-divUpLabel-line"></div>
          </div>`;
        break;
      case "3":
        // 波浪卡片div
        html = `<div class="entity-div-style entity-div-style3" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};--theme-color2:${theme_color2};--theme-color3:${theme_color3}">
            <div class="image"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div>
            <div class="infotop"><div class="title">${title}</div><div class="content overflow-auto scrollbar h-full">${content}</div></div>
          </div >`;
        break;
      case "4":
        // 指向说明一
        html = `<div class="entity-div-style entity-div-style4" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
          </div >`;
        break;
      case "5":
        // 指向说明二
        html = `<div class="entity-div-style entity-div-style5 marsTiltPanel marsTiltPanel-theme-green" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};--theme-color2:${theme_color2};">
            <div class="marsTiltPanel-wrap">
              <div class="area">
                <div class="arrow-lt"></div>
                <div class="b-t"></div>
                <div class="b-r"></div>
                <div class="b-b"></div>
                <div class="b-l"></div>
                <div class="arrow-rb"></div>
                <div class="label-wrap">
                  <div class="title">${title}</div>
                  <div class="content">${content}</div>
                </div>
              </div>
              <div class="b-t-l"></div>
              <div class="b-b-r"></div>
            </div>
            <div class="arrow"></div>
          </div >`;
        break;
      case "6":
        // 静态文本框
        html = `<div class="entity-div-style entity-div-style6" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};--theme-color2:${theme_color2};">
            <div class="title">${title}</div>
          </div >`;
        break;
      case "7":
        // 桩号
        html = `<div class="entity-div-style entity-div-style7" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
            <div class="pile-number">
              <div class="circular"></div>
              <div class="pole"></div>
            </div>
          </div >`;
        break;
    }
    return html;
  }
}
export default BimEntity;
