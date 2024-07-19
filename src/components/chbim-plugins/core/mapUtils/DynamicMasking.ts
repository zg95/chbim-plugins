/**
 * 注记动态遮蔽 V1.0.0
 */
import { gsap } from "gsap";
import _ from "lodash";
class DynamicMasking {
  Cesium: any;
  _map: any;
  DynamicMaskingArr!: any[];
  DynamicMaskingStyle!: any[];
  canvasClientWidth: any;
  canvasClientHeight: any;
  oldSet!: Set<unknown>;
  tweenMap!: Map<any, any>;
  isDynamicMasking!: boolean;
  constructor(map, isDynamicMasking = false) {
    if ((window as any).mars3d) {
      this.Cesium = (window as any).mars3d.Cesium;
      // 需要操作的矢量数据
      this.DynamicMaskingArr = [];
      // 矢量样式数据
      this.DynamicMaskingStyle = [];
      this.canvasClientWidth = map.viewer.canvas.clientWidth;
      this.canvasClientHeight = map.viewer.canvas.clientHeight;
      this.oldSet = new Set(); // 记录前一次显示的label的id
      this.tweenMap = new Map();
      this.isDynamicMasking = isDynamicMasking;
    } else {
      console.error("未引入指定插件");
    }
  }

  /**
   * 添加动态遮蔽数据
   * item 是地图对象
   * data 是数据 (地图对象隐藏的时候有些数据有问题 辅助作用)
   */
  add(item, data) {
    let fontSize = item.options.symbol.styleOptions.label.font_size;
    let id = item.options.vectorId;
    let charWidth = Number(fontSize) * 1.4;
    let charHeight = Number(fontSize) * 1.8;

    let label = item.options.symbol.styleOptions.label;
    let { color, outlineColor, backgroundColor } = label;

    item.eachGraphic((e) => {
      if (e.style.label)
        this.DynamicMaskingArr.push({
          id: id,
          uid: e.id,
          position: e._getLablePosition(),
          label: e.name,
          width: charWidth * e.name.length,
          height: charHeight,
          color,
          outline: data.label.outline,
          outlineColor,
          background: data.label.background,
          backgroundColor,
          dynamicMaskingColor: {
            backgroundColor: this.Cesium.Color.fromCssColorString(
              data.label.backgroundColor
            ),
            color: this.Cesium.Color.fromCssColorString(data.label.color),
            outlineColor: this.Cesium.Color.fromCssColorString(
              data.label.outlineColor
            ),
          },
        });
    });
    this.DynamicMaskingStyle.push({
      vectorId: item.options.vectorId,
      outline: data.label.outline,
      background: data.label.background,
      color: this.Cesium.Color.fromCssColorString(data.label.color),
      backgroundColor: this.Cesium.Color.fromCssColorString(
        data.label.backgroundColor
      ),
      outlineColor: this.Cesium.Color.fromCssColorString(
        data.label.outlineColor
      ),
    });

    this.oldSet = new Set(); // 记录前一次显示的label的id
    this.tweenMap = new Map();
  }

  /**
   * 移除动态遮蔽数据
   */
  remove(id) {
    this.DynamicMaskingArr = this.DynamicMaskingArr.filter(
      (user) => user.id !== id
    );
    this.DynamicMaskingStyle = this.DynamicMaskingStyle.filter(
      (user) => user.vectorId !== id
    );
    this.oldSet = new Set(); // 记录前一次显示的label的id
    this.tweenMap = new Map();
  }

  /**
   * 修改数据
   * 主要就是修改
   * outline
   * background
   * color
   * outlineColor
   * backgroundColor
   * 用于渐变
   */
  modify(id, style) {
    let { label } = style;
    if (label) {
      let { color, outline, outlineColor, background, backgroundColor } = label;
      this.DynamicMaskingArr.forEach((item) => {
        if (item.id === id) {
          // console.log(item);
          if (color != undefined) {
            item.color = this.Cesium.Color.fromCssColorString(color);
            item.dynamicMaskingColor.color =
              this.Cesium.Color.fromCssColorString(color);
          }
          if (outline != undefined) {
            item.outline = outline;
          }
          if (outlineColor != undefined) {
            item.outlineColor =
              this.Cesium.Color.fromCssColorString(outlineColor);
            item.dynamicMaskingColor.outlineColor =
              this.Cesium.Color.fromCssColorString(outlineColor);
          }

          if (background != undefined) item.background = background;
          if (backgroundColor != undefined) {
            item.backgroundColor =
              this.Cesium.Color.fromCssColorString(backgroundColor);
            item.dynamicMaskingColor.backgroundColor =
              this.Cesium.Color.fromCssColorString(backgroundColor);
          }
        }
      });
    }
  }

  /**
   * 获取边界值 生成包围盒
   */
  getBoundingRectangle(label) {
    var pos = this.Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      (window as any).map.viewer.scene,
      label.position
    );

    if (pos !== undefined) {
      return new this.Cesium.BoundingRectangle(
        pos.x,
        pos.y,
        label.width,
        label.height
      );
    }
    return new this.Cesium.BoundingRectangle(0, 0, 1, 1);
  }

  getNonIntersectingRectangles() {
    let nonIntersectingRectangles = [] as any;

    for (var i = 0; i < this.DynamicMaskingArr.length; i++) {
      let intersects = false,
        item = this.DynamicMaskingArr[i],
        item2,
        rect1,
        rect2;
      rect1 = this.getBoundingRectangle(item);

      // 是否在画布内
      if (
        rect1.x < 0 ||
        rect1.x > this.canvasClientWidth ||
        rect1.y < 0 ||
        rect1.y > this.canvasClientHeight
      ) {
        continue;
      } else if (nonIntersectingRectangles.length === 0) {
        // 准备验证 此处不能用id 会重复 暂时用下标替代 ！
        nonIntersectingRectangles.push(i);
        continue;
      } else {
        for (var j = 0; j < nonIntersectingRectangles.length; j++) {
          item2 = this.DynamicMaskingArr[nonIntersectingRectangles[j]];
          rect2 = this.getBoundingRectangle(item2);
          if (
            this.Cesium.Intersect.OUTSIDE !==
            this.Cesium.BoundingRectangle.intersect(rect1, rect2)
          ) {
            intersects = true;
            break;
          }
        }
        if (!intersects) {
          nonIntersectingRectangles.push(i);
        }
      }
    }
    return new Set(nonIntersectingRectangles);
  }

  /**
   * 动态遮蔽主要逻辑
   */
  ifShow() {
    if (this.isDynamicMasking) {
      let labelObj = {
        color: 0.001,
        outlineColor: 0.001,
        backgroundColor: 0.001,
      };
      let labelObj2 = {
        color: 1,
        outlineColor: 1,
        backgroundColor: 1,
      };

      let newSet = this.getNonIntersectingRectangles();

      // oldSet 和 newSet 求差集,结果是要隐藏的ids
      let hideIds = new Set([...this.oldSet].filter((x) => !newSet.has(x)));
      // newSet 和 oldSet 求差集,结果是新增的要显示的ids
      let showIds = new Set([...newSet].filter((x) => !this.oldSet.has(x)));
      for (let id of hideIds) {
        if (this.DynamicMaskingArr[id as number]) {
          if (this.tweenMap.has(id)) {
            var tween = this.tweenMap.get(id);
            tween.kill();
            this.tweenMap.delete(id);
          }
          var tween: any = gsap.to(labelObj2, {
            duration: 0.2,
            color: 0,
            outlineColor: 0,
            backgroundColor: 0,
            onUpdate: () => {
              var item = this.DynamicMaskingArr[id as number];
              item.backgroundColor.alpha = labelObj2.backgroundColor;
              item.color.alpha = labelObj2.color;
              item.outlineColor.alpha = labelObj2.outlineColor;
              (window as any).map
                .getLayer(item.id, "vectorId")
                ?.getGraphicByAttr(item.uid)
                ?.setStyle({
                  label: {
                    show: false,
                    outline: false,
                    background: false,
                  },
                });
            },
          });
          this.tweenMap.set(id, tween);
        }
      }

      for (let id of showIds) {
        if (this.DynamicMaskingArr[id as number]) {
          if (this.tweenMap.has(id)) {
            var tween = this.tweenMap.get(id);
            tween.kill();
            this.tweenMap.delete(id);
          }
          let item = this.DynamicMaskingArr[id as number];
          let { backgroundColor, color, outlineColor } =
            item.dynamicMaskingColor;
          var tween: any = gsap.to(labelObj, {
            duration: 0.8 + Math.random(),
            color: color.alpha,
            outlineColor: outlineColor.alpha,
            backgroundColor: backgroundColor.alpha,
            onUpdate: () => {
              item.backgroundColor.alpha = labelObj.backgroundColor;
              item.color.alpha = labelObj.color;
              item.outlineColor.alpha = labelObj.outlineColor;
              (window as any).map
                .getLayer(item.id, "vectorId")
                ?.getGraphicByAttr(item.uid)
                ?.setStyle({
                  label: {
                    show: true,
                    outline: item.outline,
                    background: item.background,
                    color: item.color,
                    outlineColor: item.outlineColor,
                    backgroundColor: item.backgroundColor,
                  },
                });
            },
          });
          this.tweenMap.set(id, tween);
        }
      }
      this.oldSet = newSet;
    } else {
    }
  }

  /**
   * 切换动态避让
   * @returns { any }
   */
  switchDynamicMasking(type) {
    //首先获取地图上所有已经加载的矢量数据
    if (type) {
      (window as any).map.getLayers().forEach((item) => {
        if (item.options?.vectorId) {
          let { color, outlineColor, backgroundColor } =
            item.options.symbol.styleOptions.label;
          item.eachGraphic((e) => {
            e.setStyle({
              label: {
                color: color.withAlpha(0),
                outlineColor: outlineColor.withAlpha(0.001),
                backgroundColor: backgroundColor.withAlpha(0.001),
                show: false,
                background: false,
                outline: false,
              },
            });
          });
        }
      });
    } else {
      if (this.DynamicMaskingStyle.length > 0) {
        let vectorItem;
        this.DynamicMaskingStyle.forEach((item) => {
          let {
            color,
            outline,
            outlineColor,
            background,
            backgroundColor,
            vectorId,
          } = item;

          vectorItem = (window as any).map.getLayer(vectorId, "vectorId");

          if (vectorItem)
            vectorItem.eachGraphic((e) => {
              e.setStyle({
                label: {
                  color,
                  outlineColor,
                  backgroundColor,
                  show: true,
                  background,
                  outline,
                },
              });
            });
        });
      }
    }
    this.isDynamicMasking = type;
    (window as any).bimVector.switchDynamicMasking(type);
  }
}

export default DynamicMasking;
