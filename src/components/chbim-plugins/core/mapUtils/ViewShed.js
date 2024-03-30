/*
 *
 * 动态释放模型版本
 * 服务于 自由模式
 * 防止内存增长导致浏览器崩溃
 *
 */
/**
 * 初始化ViewShed类
 *
 * @param  { Array } modelArray  模型数组
 * @param  { Array } showModelIdArray  需要展示到地图上的模型id数组
 * @param  { Object } map 当前地图对象
 */
import _ from "lodash";
class ViewShed {
  constructor(modelArray, map, ...varparms) {
    if (mars3d) {
      if (modelArray && modelArray != undefined) this.modelArray = modelArray;
      this.showModelArray = [];
      if (map && map != undefined) this.map = map;
      this.Cesium = mars3d.Cesium;
      this.events = {};
    } else {
      console.error("未引入指定插件");
    }
  }
  /**
   * events
   * 事件监听
   * @param  { string } event - 事件名 目前只支持enter和leave
   * @param  { function } fn - 回调函数
   * @returns { any }
   */
  on(event, fn) {
    if (event == "enter" || event == "leave") {
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
   * modelArray
   * 读取数据
   * @param  { string | number } key - 需要查询对象的key 目前只有 modelArray 和 showModelIdArray
   * @returns { any }
   */
  say(key) {
    return this[key];
  }

  /**
   * modelArray
   * 添加数据
   * @param  { string | number } key - 需要添加对象的key 目前只有 modelArray 和 showModelArray
   * @param  { object | array } item - 添加的数据item
   * @returns { any }
   */
  add(key, item) {
    this[key].push(item);
  }

  /**
   * modelArray
   * 移除数据
   * @param  { string | number } key - 需要添加对象的key 目前只有 showModelArray
   * @param  { object | array } item - 添加的数据item
   * @returns { any }
   */
  remove(key, item) {
    this[key] = this[key].filter(function (i) {
      return i !== item;
    });
  }

  /**
   * modelArray && events
   * 初始化数据
   * @returns { any }
   */
  initial() {
    this.modelArray = [];
    this.events = {};
  }

  /**
   * 工具函数
   * modelArray - excavationDetails
   * 更新 modelArray 自定义属性 excavationDetails
   * @param  { string } parentId - 模型id
   * @param  { string } id - 自己实例的id
   * @param  { string } type - update | delete | add | edit 操作类型
   * @param  { object | array } data - 更新的数据
   * @returns { object }
   */
  updateCustomExcavationDetails(parentId, id, type, data = [], obj = {}) {
    let model, modelIndex, pit;
    model = this.modelArray.find((e) => {
      return e.modelId == parentId;
    }).customize["bimModelExcavationDetails"];

    pit = model.find((e, index) => {
      if (e.id == id) {
        modelIndex = index;
        return e;
      }
    });
    switch (type) {
      case "delete":
        model.splice(modelIndex, 1);
        break;
      case "update":
        pit.excavationDetails = data;
        break;
      case "add":
        model.push(obj);
        break;
      case "edit":
        pit.excavationDetails = obj.excavationDetails;
        pit.kId = obj.kId;
        break;
    }
    return model;
  }

  /**
   * 工具函数
   * 开启视角监听事件 调用freed来实现动态释放逻辑
   * @param  { object } data - 模型的树形结构 重要数据
   * @returns { any }
   */
  resourceRelease() {
    this.map.viewer.camera.moveEnd.addEventListener(() => {
      this.freed();
    });
  }

  /**
   * 功能函数
   * 动态释放的主要逻辑
   * @param  { object } data - 模型的树形结构
   * @returns { any }
   */
  freed() {
    let { alt } = this.map.getCameraView();
    // 当视高低于20000才开始生效
    if (alt < 20000) {
      // 调用 节流 2s
      this.freed = _.throttle(() => {
        let { lng, lat, alt, pitch } = this.map.getCameraView();
        if (this.modelArray)
          this.modelArray.forEach((i) => {
            let releasedDistance = i.bimModel.releasedDistance
              ? i.bimModel.releasedDistance
              : 10000;
            if (
              i.center &&
              this.disTance(
                [lng, lat, alt],
                [i.center._lng, i.center._lat, i.center._alt],
                this.calculateDistance(pitch, releasedDistance)
              )
            ) {
              // 视角离开 触发回调 leave
              if (this.map.getLayer(i.id, "modelId")) {
                this.emit("leave", i);
              }
            } else {
              // 视角进入 触发回调 enter
              if (
                this.showModelArray.indexOf(i.id) >= 0 &&
                !this.map.getLayer(i.id, "modelId")
              ) {
                this.emit("enter", i);
              }
            }
          });
      }, 2000);

      this.freed();
    }
  }

  /**
   * 手动释放 1秒防抖
   * @param  { object } data - 模型的树形结构
   * @returns { any }
   */
  manualFreed = _.debounce(() => {
    let { lng, lat, alt, pitch } = this.map.getCameraView(),
      releasedDistance;
    this.modelArray.forEach((i) => {
      releasedDistance = i.releasedDistance ? i.releasedDistance : 10000;
      if (
        this.disTance(
          [lng, lat, alt],
          [i.center._lng, i.center._lat, i.center._alt],
          this.calculateDistance(pitch, releasedDistance)
        )
      ) {
        // 视角离开 触发回调 leave
        if (this.map.getLayer(i.id, "modelId")) {
          this.emit("leave", i);
        }
      } else {
        // 视角进入 触发回调 enter
        if (!this.map.getLayer(i.id, "modelId")) {
          this.emit("enter", i);
        }
      }
    });
  }, 1000);

  /**
   * 通过id查询对象
   * @param  { object } data - 模型的树形结构
   * @param  { string } id - 模型id
   * @param  { string } type - 查找类型
   * @returns { boolean }
   */
  findPnodeId(data, id, type = "id") {
    //设置结果
    let result;
    if (!data) {
      return; //如果data传空，直接返回
    }
    for (var i = 0; i < data.length; i++) {
      let item = data[i];
      if (item[type] == id) {
        result = item;
        //找到id相等的则返回父id
        return result;
      } else if (item.children && item.children.length > 0) {
        //如果有子集，则把子集作为参数重新执行本方法
        result = this.findPnodeId(item.children, id, type);
        //关键，千万不要直接return本方法，不然即使没有返回值也会将返回return，导致最外层循环中断，直接返回undefined,要有返回值才return才对
        if (result) {
          return result;
        }
      }
    }
    //如果执行循环中都没有return，则在此return
    return result;
  }

  /**
   * modelArray
   * 动态释放的计算方法
   * @param  { array } positionsStart - 起始坐标
   * @param  { array } positionsEnd - 结束坐标
   * @param  { number } limit - 设置的长度
   * @returns { boolean }
   */
  disTance(positionsStart, positionsEnd, limit) {
    let startPosition, endPosition, distance;
    startPosition = Cesium.Cartesian3.fromDegrees(...positionsStart);
    endPosition = Cesium.Cartesian3.fromDegrees(...positionsEnd);
    distance = Cesium.Cartesian3.distance(startPosition, endPosition);
    return distance > limit;
  }

  /**
   * @function 获取模型的可视范围
   * @param { number } angle 当前角度
   * @param { number } maxDistance 最大可视距离
   * @returns { number } 当前可视距离
   * */
  calculateDistance(angle, maxDistance) {
    let newAngle = ((angle + 180) % 360) - 180;
    // 确保角度在-90至90度之间
    newAngle = Math.max(-90, Math.min(newAngle, 90));

    // 根据角度计算距离，采用线性插值的方法
    // 当角度为-90度时，距离最小为maxDistance/5；当角度为90度时，距离最大为maxDistance
    let scaledDistance =
      (maxDistance - maxDistance / 5) * (Math.abs(newAngle) / 90) +
      maxDistance / 5;
    return Math.round(scaledDistance);
  }
}

export default ViewShed;
