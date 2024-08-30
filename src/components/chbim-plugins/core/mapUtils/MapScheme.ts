/**
 * 地图步骤函数
 * */

const init = () => {
  (window as any).schemeEvnModify.clearAllEvnModify();
  (window as any).bimRotatePoint.stop();
  (window as any).bimTrafficSimulation.destruction();
  if ((window as any).bimMapPTV) (window as any).bimMapPTV.destruction();
  (window as any).romStop();
  (window as any).complete();
  (window as any).bimMapCompare.destroyControl();
};

const previousPage = () => {
  (window as any).bimRotatePoint.stop();
  (window as any).bimTrafficSimulation.destruction();
  if ((window as any).bimMapPTV) (window as any).bimMapPTV.destruction();
  (window as any).romStop();
  (window as any).complete();
  (window as any).bimMapCompare.destroyControl();
};

const nextPage = () => {
  (window as any).bimRotatePoint.stop();
  (window as any).bimTrafficSimulation.destruction();
  if ((window as any).bimMapPTV) (window as any).bimMapPTV.destruction();
  (window as any).romStop();
  (window as any).complete();
  (window as any).bimMapCompare.destroyControl();
};

const operateMapData = (screenplayListData) => {
  let calculateScenedata = [] as any[];
  screenplayListData.forEach((item) => {
    // console.log(`-----------场景分割线-----------`);
    let { id } = item;
    let obj = {
      id,
      mockData: {
        nextPage: [] as any[],
        item: [] as any[],
        previousPage: [] as any[],
      },
    };
    item.operate.forEach((data, i) => {
      // 步骤数据
      let nextPageData = mergeOperate(data, obj.mockData.nextPage);

      obj.mockData.nextPage = nextPageData;
      obj.mockData.item = nextPageData;
      obj.mockData.previousPage = [];
    });

    calculateScenedata.push(obj);
  });

  if (calculateScenedata.length > 1) {
    for (let index = 1; index < calculateScenedata.length; index++) {
      // 步骤
      let mockData = calculateScenedata[index].mockData,
        mapData = calculateScenedata[index - 1].mockData.item;

      const map = new Map();

      mapData.forEach((item) => {
        // 漫游数据无法被继承
        if (
          item.type != "rotatePoint" &&
          item.type != "viewpoint" &&
          item.type != "roaming" &&
          item.type != "splitScreen"
        ) {
          map.set(`${item["screenplayId"]}-${item["type"]}`, item);
        } else {
          // 数据需要加入previousPage
          calculateScenedata[index].mockData.previousPage.push(item);
        }
      });

      mockData.nextPage.forEach((item) => {
        const key = `${item["screenplayId"]}-${item["type"]}`;
        let newMockDataItem = {
          ...map.get(key),
        };
        if (map.has(key)) {
          if (item.type == "flight") {
            calculateScenedata[index].mockData.previousPage.unshift(
              map.get(key)
            );
            newMockDataItem = item;
          } else {
            let previousPageData = {};
            Object.keys(item).forEach((z) => {
              if (z != "screenplayId" && z != "type") {
                if (map.get(key)[z]) {
                  if (Object.keys(previousPageData).length == 0) {
                    previousPageData = {
                      screenplayId: item.screenplayId,
                      type: item.type,
                    };
                  }
                  if (z == "clip" || z == "flat") {
                    newMockDataItem[z] = mergeObjects(map.get(key)[z], item[z]);
                    let newPreviousPageData = {
                      screenplayId: item.screenplayId,
                      type: item.type,
                    };
                    newPreviousPageData[z] = {};
                    Object.keys(item[z]).forEach((k) => {
                      if (map.get(key)[z][k]) {
                        newPreviousPageData[z][k] = map.get(key)[z][k];
                      } else {
                        if (item[z][k] == "true") {
                          newPreviousPageData[z][k] = "false";
                        }
                      }
                    });
                    previousPageData = {
                      ...newPreviousPageData,
                      ...previousPageData,
                    };
                  } else {
                    previousPageData[z] = map.get(key)[z];
                    newMockDataItem[z] = item[z];
                  }
                } else {
                  // console.log("???????????????", z, map.get(key));
                  if (
                    !calculateScenedata[index].mockData.previousPage.some(
                      (x) => x.screenplayId === item.screenplayId
                    )
                  ) {
                    let newItem = initOperate(item, z);
                    // console.log(">>>>>>>>>>>>>>>>>>>,", previousPageData);
                    previousPageData = { ...newItem, ...previousPageData };
                  }

                  newMockDataItem[z] = item[z];
                }
              }
            });
            if (Object.keys(previousPageData).length > 0)
              calculateScenedata[index].mockData.previousPage.push(
                previousPageData
              );
          }
          map.set(key, newMockDataItem);
        } else {
          let newItem = initOperate(item);
          if (newItem) {
            calculateScenedata[index].mockData.previousPage.push(newItem);
          }
          map.set(key, item);
        }
      });

      calculateScenedata[index].mockData.item = Array.from(map.values());
    }
  }

  console.log(`-----------最后输出-----------`);
  console.log(calculateScenedata);
  console.log(`-----------最后输出-----------`);
  return calculateScenedata;
};

/**
 * 工具类11
 * 合并操作集合
 */
const mergeOperate = (data: any, operateItem: any = null) => {
  let { executionProperty, screenplayId, property, type, delay, delayTime } =
    data;
  if (property == "add" || property == true) property = "true";
  if (property == "remove" || property == false) property = "false";

  if (type == "pit") {
    // 环境修改数据需要二次处理
    let pitData = (
      window as any
    ).schemeEvnModify.getModelModifyDataForInitModelById(screenplayId);
    if (pitData) {
      let temporaryProperty = {};
      temporaryProperty[screenplayId] = property;
      property = temporaryProperty;
      screenplayId = pitData.modelId;
      executionProperty = pitData.type;
    }
  }

  let item;
  if (screenplayId == "" || screenplayId == "map") {
    // 通常没有screenplayId的数据都是操作的map
    screenplayId = "map";
    if (type == "splitScreen") {
      let { splitScreenMode, splitScreenModePercentage } = JSON.parse(property);
      operateItem.push({
        screenplayId,
        type,
        executionProperty: {
          splitScreenMode,
          splitScreenModePercentage,
          mapClone: [],
        },
      });
      let { mainScreen, secondaryScreen } = JSON.parse(data.property);
      mainScreen.forEach((item) => {
        mergeOperate(item, operateItem);
      });
      let splitScreenItem = operateItem.find((e) => {
        return e.type == "splitScreen";
      });
      secondaryScreen.forEach((item) => {
        mergeOperate(item, splitScreenItem.executionProperty.mapClone);
      });
    } else {
      item = {
        screenplayId,
        type,
        executionProperty: property,
      };
      if (executionProperty == "clip" || executionProperty == "flat") {
        item[executionProperty] = property;
      }
      // 辅助字段
      if (delay) item.delay = delay;
      if (delayTime) item.delayTime = delayTime;
      if (operateItem) {
        if (type == "flight") {
          operateItem.unshift(item);
        } else {
          operateItem.push(item);
        }
      }
    }
  } else {
    // 相同的screenplayId的数据扩展，不相同添加
    item = operateItem
      ? operateItem.find((itm: any) => itm.screenplayId == screenplayId)
      : null;

    if (item) {
      if (executionProperty == "clip" || executionProperty == "flat") {
        if (item[executionProperty]) {
          item[executionProperty] = mergeObjects(
            item[executionProperty],
            property
          );
        } else {
          item[executionProperty] = property;
          item.type = "model";
        }
      } else {
        item[executionProperty] = property;
      }

      if (delay) item[executionProperty].delay = delay;
      if (delayTime) item[executionProperty].delayTime = delayTime;
    } else {
      item = {
        screenplayId,
        type,
      };
      if (delay) item.delay = delay;
      if (delayTime) item.delayTime = delayTime;
      if (executionProperty == "clip" || executionProperty == "flat") {
        item[executionProperty] = property;
        item.type = "model";
      } else {
        item[executionProperty] = property;
      }

      if (operateItem) {
        if (type == "flight") {
          operateItem.unshift(item);
        } else {
          operateItem.push(item);
        }
      }
    }
  }
  // }

  // 此处保留 需要计算出当前地图的数据
  return operateItem ? operateItem : item;
};

const mergeObjects = (obj1, obj2) => {
  const result = { ...obj1 }; // 先复制 obj1 到 result 中
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      result[key] = obj2[key]; // 如果 obj2 有这个 key，则替换 result 中的值
    }
  }
  return result;
};

/**
 * 工具类
 * 初始化操作
 */
const initOperate = (data, initType = "all") => {
  let { type, show, screenplayId, overallStaining, clip, flat } = data;
  let initData = {};

  if (initType == "all") {
    switch (type) {
      case "model":
      case "shp":
      case "plot":
        if (show && show == "true") {
          initData = {
            screenplayId,
            type,
            show: "false",
          };
        }
        if (show && show == "false") {
          // 直接新增的操作 没有展示对象 此操作是错误的 回退时 不考虑
          console.error("map上没有添加此对象");
        }

        if (overallStaining) {
          initData = {
            ...initData,
            screenplayId,
            type,
            overallStaining: "false",
          };
        }
        if (clip) {
          initData = {
            ...initData,
            screenplayId,
            type,
            clip: "false",
          };
        }
        if (flat) {
          initData = {
            ...initData,
            screenplayId,
            type,
            flat: "false",
          };
        }
        break;

      case "terrain":
        initData = {
          screenplayId,
          type,
          executionProperty: "true",
        };
        break;
      case "pit":
        initData = {
          screenplayId,
          type,
          executionProperty: "false",
        };
        break;
    }
  } else {
    console.log("初始化", initType);
    switch (initType) {
      case "clip":
      case "flat":
      case "overallStaining":
        initData = {
          screenplayId,
          type,
        };
        initData[initType] = "false";
        break;
    }
  }

  if (Object.keys(initData).length > 0) {
    return initData;
  } else {
    return null;
  }
};

const getSameKeyData = (a, b) => {
  const result = {};
  Object.keys(b).forEach((key) => {
    if (a.hasOwnProperty(key)) {
      result[key] = a[key];
    }
  });
  return result;
};
/**
 * 工具类
 * 判断了是否是RGBA格式
 */
const isValidRGBA = (colorStr: string): boolean => {
  const rgbaPattern =
    /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0\.\d+)\s*\)$/i;
  return rgbaPattern.test(colorStr);
};

/*
 * 初始化场景
 *
 */
const initMap = (screenplayListData) => {
  // 资源复用
  let retentionData = {};
  if (screenplayListData?.length > 0) {
    screenplayListData[0].operate.forEach((item) => {
      let { executionProperty, screenplayId, property, type } = item;
      // 是否显示 - 只关联显示
      if (
        executionProperty == "show" ||
        executionProperty == "overallStaining"
      ) {
        // 模型特殊讨论
        if (!retentionData[screenplayId]) {
          retentionData[screenplayId] = {
            type,
          };
        }
        retentionData[screenplayId][property] = executionProperty;
      }
    });
  }

  // console.log("retentionData", retentionData);

  (window as any).map.getLayers().forEach((item) => {
    if (
      (item.type == "3dtiles" || item.type == "geojson") &&
      item.options.name != "国界"
    ) {
      let id = item.options.modelId || item.options.vectorId;
      if (retentionData[id]) {
        (window as any).bimModel.editColor(id);
      } else {
        item.remove();
      }
    }
  });
  (window as any).bimEntity.entityLayer.getGraphicsByAttr().forEach((item) => {
    // console.log("1111111111111", item, retentionData);

    item.remove();
  });
  (window as any).bimMapSetUp.undergroundVal(1);
  (window as any).bimTerrainProvider.show();
  (window as any).bimTrafficSimulation.destruction();
  (window as any).bimRotatePoint.stop();
  (window as any).bimMapPTV.destruction();
  (window as any).romStop();
  (window as any).complete();
};

export {
  init,
  initMap,
  previousPage,
  nextPage,
  operateMapData,
  getSameKeyData,
  isValidRGBA,
};
