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
      updateFontColor(value);
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
// difference;type;
const updateStyle = (vector, label) => {
  newStyle = {};
  console.log("ZHANG", vector, label);
  // 修改矢量
  if (vector.difference && vector.difference.length > 0)
    vector.difference.forEach((key) => {
      assignDeep(newStyle, {
        [key]: vector.vectorStyle[key],
      });
    });
  // 修改注记
  if (label.difference && label.difference.length > 0) {
    label.difference.forEach((key) => {
      assignDeep(newStyle, {
        label: {
          [key]: label.labelStyle[key],
        },
      });
    });
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
const updateFontColor = (value) => {
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
