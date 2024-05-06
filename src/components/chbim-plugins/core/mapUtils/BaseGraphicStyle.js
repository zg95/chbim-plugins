/*
 *此js服务于更新矢量样式
 *
 */
import { assignDeep } from "./Utilities.js";
let newStyle = {};

const updateKmlStyle = (key, value, style) => {
  switch (key) {
    case "textDistinct":
      updateDisplayConditionFar(value);
      break;
    case "clampToGround":
      updateClampToGround(value);
      break;
    case "fill":
      updateFill(value);
      break;
    case "areaColor":
      updateColor(value);
      break;
    case "transparency":
      updateOpacity(value);
      break;
    case "isAreaSideColor":
      updateOutline(value);
      break;
    case "areaSideColor":
      updateOutlineColor(value);
      break;
    case "fontStyle":
      updateFontStyle(value);
      break;
    case "textSize":
      updateFontSize(value);
      break;
    case "textColor":
      updatefont_color(value);
      break;
    case "outLine":
      updateFontOutLine(value);
      break;
    case "sideColor":
      updateFontOutlineColor(value);
      break;
    case "backGround":
      updateFontBackGround(value);
      break;
    case "backGroundColor":
      updateFontBackGroundColor(value);
      break;
  }
};

const updateShpStyle = (key, value, style) => {
  switch (key) {
    case "textDistinct":
      updateDisplayConditionFar(value);
      break;
    case "clampToGround":
      updateClampToGround(value);
      break;
    case "shpColor":
      updateLineColor(value);
      break;
    case "width":
      updateLineWidth(value);
      break;
    case "materialType":
      updateLineMaterialType(value);
      break;
    case "dashLength":
      updateLineDashLength(value);
      break;
    case "gapColor":
      updateLineGapColor(value);
      break;
  }
};

const updateStyle = (vector, label, customType) => {
  newStyle = {};
  let { vectorStyle, difference } = vector;
  if (vectorStyle) {
    let { divType } = vectorStyle;
    let html = ``;
    if (divType) {
      // div是一种特殊的点属性 需要单独编辑整体变化
      let {
        theme_color,
        title,
        font_color,
        content,
        scaleByDistance,
        scaleByDistance_far,
        scaleByDistance_farValue,
        scaleByDistance_near,
        scaleByDistance_nearValue,
        distanceDisplayCondition,
        distanceDisplayCondition_far,
        distanceDisplayCondition_near,
        clampToGround,
        divStyle,
        // theme_color2,
        // theme_color3,
      } = vectorStyle;
      let { theme_color2, theme_color3 } = divStyle;
      switch (divType) {
        case "1":
          // 动态框div
          html = `<div class="entity-div-style entity-div-style1" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
          </div >`;
          break;
        case "2":
          // 竖直文本框div
          html = `<div class="entity-div-style entity-div-style2" style="--theme-color1:${theme_color};--theme-font-color1:${font_color};">
            <div class="title">${title}</div>
             <div class="mars3d-divUpLabel-line"></div>
          </div >`;
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
          // <div class="title">${title}</div>
          // <div class="content">${content}</div>
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
      newStyle = {
        html,
        scaleByDistance,
        scaleByDistance_far,
        scaleByDistance_farValue,
        scaleByDistance_near,
        scaleByDistance_nearValue,
        distanceDisplayCondition,
        distanceDisplayCondition_far,
        distanceDisplayCondition_near,
        clampToGround,
      };
    } else {
      // 修改普通矢量
      if (vector.difference && vector.difference.length > 0)
        vector.difference.forEach((key) => {
          assignDeep(newStyle, {
            [key]: vectorStyle[key],
          });
        });
      // 修改注记
      if (label && label.difference && label.difference.length > 0)
        label.difference.forEach((key) => {
          assignDeep(newStyle, {
            label: {
              [key]: label.labelStyle[key],
            },
          });
        });
    }
  }

  return newStyle;
};

// 更新颜色 color
const updateColor = (value) => {
  newStyle = assignDeep(newStyle, {
    color: value,
  });
};

// 更新可视距离最大值
const updateDisplayConditionFar = (value) => {
  newStyle = assignDeep(newStyle, {
    distanceDisplayCondition_far: value,
  });
};

// 更新是否贴地
const updateClampToGround = (value) => {
  newStyle = assignDeep(newStyle, {
    clampToGround: value,
  });
};

// 面是否填充
const updateFill = (value) => {
  newStyle = assignDeep(newStyle, {
    fill: value,
  });
};

// 面的透明度
const updateOpacity = (value) => {
  newStyle = assignDeep(newStyle, {
    opacity: value,
  });
};

// 描边
const updateOutline = (value) => {
  newStyle = assignDeep(newStyle, {
    outline: value,
  });
};

// 描边颜色
const updateOutlineColor = (value) => {
  newStyle = assignDeep(newStyle, {
    outlineColor: value,
  });
};

/**
 * ****************** 面属性更新 end ********************
 */

/**
 * ****************** 文本属性 ********************
 */
//  字体
const updateFontStyle = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      font_family: value,
    },
  });
};

//  字体大小
const updateFontSize = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      font_size: value,
    },
  });
};

//  字体颜色
const updatefont_color = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      color: value,
    },
  });
};
//  字体描边
const updateFontOutLine = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      outline: value,
    },
  });
};
// 字体描边色
const updateFontOutlineColor = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      outlineColor: value,
    },
  });
};
// 是否显示背景色
const updateFontBackGround = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      background: value,
    },
  });
};
// 字体背景色
const updateFontBackGroundColor = (value) => {
  newStyle = assignDeep(newStyle, {
    label: {
      backgroundColor: value,
    },
  });
};
/**
 * ****************** 文本属性 end ********************
 */

/**
 * **************** 线属性更新 *******************
 */

// 线的颜色更新
const updateLineColor = (value) => {
  newStyle = assignDeep(newStyle, {
    materialOptions: {
      color: value,
    },
  });
};

// 线的宽度更新
const updateLineWidth = (value) => {
  newStyle = assignDeep(newStyle, {
    width: value,
  });
};

// 线的类型
const updateLineMaterialType = (value) => {
  newStyle = assignDeep(newStyle, {
    materialType: value,
  });
};

/**
 * 线类型 虚线 PolylineDash
 */
// 虚线间隔长度
const updateLineDashLength = (value) => {
  newStyle = assignDeep(newStyle, {
    materialOptions: {
      dashLength: value,
    },
  });
};
// 虚线间隔颜色
const updateLineGapColor = (value) => {
  newStyle = assignDeep(newStyle, {
    materialOptions: {
      gapColor: value,
    },
  });
};

/**
 * **************** 线属性更新 end *******************
 */

export { updateStyle };
