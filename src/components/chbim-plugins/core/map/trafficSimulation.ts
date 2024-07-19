/**
 *
 * 交通模拟
 *
 * 功能点:交通模拟演示
 * 版本 2.0
 * 存疑 1.人工标点是否可以和CZML同时播放
 *     2.人工标点存储格式 是否和 CZML 一致
 */

class BimTrafficSimulation {
  private _map: any;
  /**
   * czml的时间
   */
  private beginDate: string | undefined;
  private endDate: string | undefined;
  private style!: any;
  trafficSimulationLayer: any;
  trafficSimulationArr!: any[];
  vehicleSum!: number;
  automobileList!: { url: string }[];
  private _czmlLayer: any;
  _czmlLayerArr!: any[];

  constructor(map: any) {
    if ((window as any).mars3d) {
      (window as any) = map;
      this.beginDate = "";
      this.endDate = "";
      // 轨迹图层
      this.trafficSimulationLayer;
      this.trafficSimulationArr = [];
      // 线的样式
      this.style = {
        // 线宽
        width: 4,
        // 线型
        materialType: (window as any).mars3d.MaterialType.LineFlow,
        materialOptions: {
          color: "#4ac2ff",
          image: "/img/textures/line-arrow-right.png",
          repeat_x: 20,
          repeat_y: 1,
          speed: 20,
        },
        // 是否贴地
        clampToGround: false,
        allowDrillPick: false,
        // depthFail: true,
        // depthFailColor: "#fff",
      };
      // 小车总数
      this.vehicleSum = 100;

      this.automobileList = [
        {
          url: "/gltf/cart/kache3.gltf",
        },
        {
          url: "/gltf/cart/jiaobanche.glb",
        },
        {
          url: "/gltf/cart/benchi1.gltf",
        },
        {
          url: "/gltf/cart/red_car.gltf",
        },
        {
          url: "/gltf/cart/suv.gltf",
        },
      ];

      this._czmlLayer;
      this._czmlLayerArr = [];
    }
  }

  /**
   * 初始化
   * 给地图上加图层
   */
  init(data) {
    this.trafficSimulationLayer = new (window as any).mars3d.layer.GraphicLayer(
      {
        temporaryLayer: "trafficSimulation",
      }
    );
    (window as any).addLayer(this.trafficSimulationLayer);
    (window as any).bimMapEdit = "1";
    if (data) {
      this._czmlLayerArr = data;
    }
  }

  /**
   * 新增路线
   */
  addLine(index) {
    let id = index;
    return new Promise((resolve) => {
      this.trafficSimulationLayer
        .startDraw({
          type: "polylineP",
          attr: {
            trafficSimulationId: id,
          },
          style: {
            ...this.style,
            // label: {
            //   text: id,
            //   font_size: 26,
            //   pixelOffsetY: -35,
            //   font_family: "黑体",
            //   outline: true,
            //   visibleDepth: false,
            //   distanceDisplayCondition: true,
            //   distanceDisplayCondition_far: 10000,
            //   distanceDisplayCondition_near: 0,
            // },
          },
        })
        .then((e: { coordinates: any }) => {
          resolve({
            id,
            pointSet: e.coordinates,
            speed: 45,
            interval: 1,
          });
        });
    });
  }

  /**
   * 初始化路线数据 （用于编辑）
   */
  initLine(data) {
    let graphic;
    data.forEach((item) => {
      let { id } = item;
      graphic = new (window as any).mars3d.graphic.PolylinePrimitive({
        positions: item.pointSet,
        attr: {
          trafficSimulationId: id,
        },
        style: {
          ...this.style,
          // label: {
          //   text: id,
          //   font_size: 26,
          //   pixelOffsetY: -35,
          //   font_family: "黑体",
          //   outline: true,
          //   visibleDepth: false,
          //   distanceDisplayCondition: true,
          //   distanceDisplayCondition_far: 10000,
          //   distanceDisplayCondition_near: 0,
          // },
        },
        // flyTo: true,
        // flyToOptions: {
        //   scale: 3,
        //   duration: 1.5,
        // },
      });
      this.trafficSimulationLayer.addGraphic(graphic);
    });
  }

  /**
   * 定位飞行路线
   * @param  { String } id 路线id
   */
  positionLine(id) {
    let item = this.queryTrafficSimulationLine(id);
    if (item)
      item.flyTo({
        scale: 2,
      });
  }
  /**
   * 移除一条路线
   * @param  { String } id 路线id
   */
  deleteLine(id) {
    let item = this.queryTrafficSimulationLine(id);
    if (item) item.remove();
  }

  /**
   * 查询当前路线集
   * @returns { Array } 返回当前路线集
   */
  queryTrafficSimulationArr() {
    return this.trafficSimulationArr;
  }

  /**
   * 查询线的实体
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 返回标绘实体
   */
  queryTrafficSimulationLine(id: string) {
    if (this.trafficSimulationLayer)
      return this.trafficSimulationLayer.getGraphicByAttr(
        id,
        "trafficSimulationId"
      );
  }

  /**
   * 编辑线的实体
   * @param  { String } id 矢量id
   * @returns { Object || Boolean } 返回标绘实体
   */
  editTrafficSimulationLine(id: string, isEnableDragging = true) {
    let item = this.queryTrafficSimulationLine(id);
    if (isEnableDragging) {
      item.setStyle({
        materialOptions: {
          color: "#ff0000",
        },
      });

      item.startEditing();
    } else {
      item.setStyle({
        materialOptions: {
          color: "#4ac2ff",
        },
      });

      item.stopEditing();
    }
  }

  /**
   * 查询Czml数据
   * @param  { String } id Czml的id
   * @returns { Object || Boolean } 返回Czml数据
   */
  queryCzml(id: string) {
    if (this._czmlLayerArr.length == 0) return false;
    return this._czmlLayerArr.find((e) => {
      return e.id == id;
    });
  }

  /**
   * 开始模拟
   * @param  { Array } data 模拟对象
   */
  start(id = "add") {
    // czml 文件头
    this.beginDate = new Date().toISOString();
    let currentDate = new Date();
    let currentDay = currentDate.getDate();
    currentDate.setDate(currentDay + 1);
    this.endDate = currentDate.toISOString();
    console.log(this.queryCzml(id));
    if (this.queryCzml(id)) {
      this.trafficSimulationArr = JSON.parse(this.queryCzml(id).route);
    } else {
      this.trafficSimulationArr = [];
    }
    this.processingData(id);
  }

  /**
   *定位飞行czml数据
   *
   */
  selected() {
    if (this._czmlLayer) {
      this._czmlLayer.flyTo();
    }
  }

  /**
   * 销毁
   * @param  { Array } trafficSimulationArr 模拟对象
   */
  destruction() {
    this.trafficSimulationLayer.clear();
    this.trafficSimulationLayer.remove();
    if (this._czmlLayer) {
      this._czmlLayer.clear();
      this._czmlLayer.remove();
    }
    (window as any).bimMapEdit = "0";
  }

  /**
   * 工具类
   * 处理数据 关键函数 服务于 simulationStart 函数
   * 把点集数据处理为CZML格式的数据
   * @returns { array } - 返回模拟 CZML 数据
   */
  processingData(id) {
    // CZML固定头部
    let czmlArr = [
      {
        version: "1.0",
        id: "document",
        clock: {
          interval: `${this.beginDate}/${this.endDate}`, //开始和结束时间
          currentTime: this.beginDate,
          multiplier: 1,
        },
        style: {
          distanceDisplayCondition: true,
          distanceDisplayCondition_far: 1000000,
          distanceDisplayCondition_near: 0,
        },
      },
    ] as any[];

    let CZMLData = [];
    let newTrafficSimulationArr = JSON.parse(
      JSON.stringify(this.trafficSimulationArr)
    );
    let intervalDate = 0;

    newTrafficSimulationArr.forEach((e, z) => {
      // 每台车到下一个点的间隔时间
      let time = 0;
      // 每台车的出发时间
      let initTime = 0;
      // console.log("-----------------数据分割线-----------------");
      let { pointSet, interval, speed } = e;
      for (let i = 1; i <= this.vehicleSum; i++) {
        // console.log("-----------------计算每台车的位置-----------------");
        let pointSetClone = JSON.parse(JSON.stringify(pointSet));
        pointSetClone.forEach((item, k) => {
          if (k > 0) {
            intervalDate = parseFloat(
              (
                this.disTance(item, pointSetClone[k - 1].slice(1)) / speed
              ).toFixed(2)
            );
            time += intervalDate;
          }
          if (k == 0) {
            time = initTime;
          }
          item.unshift(time);
        });
        initTime += interval;

        CZMLData = pointSetClone.reduce((a, b) => a.concat(b));
        let vehicle = {
          name: `${z}-${i}`,
          availability: `${this.beginDate}/${this.endDate}`,
          // 运动姿态
          orientation: {
            velocityReference: "#position",
          },
          position: {
            epoch: this.beginDate,
            cartographicDegrees: CZMLData,
          },
          style: {
            minimumPixelSize: 100,
            distanceDisplayCondition: true,
            distanceDisplayCondition_near: 0,
            distanceDisplayCondition_far: 1300,
            distanceDisplayPoint: {
              // 当视角距离超过一定距离(distanceDisplayCondition_far定义的) 后显示为点对象的样式
              color: "#00ff00",
              pixelSize: 8,
            },
            // clampToGround: true,
          },
          model: {
            show: true,
            // gltf: "/gltf/cart/kache3.gltf",
            gltf: this.randomVehicle(),
            heightReference: (window as any).Cesium.HeightReference
              .CLAMP_TO_GROUND,
            clampToGround: true,
            scale: 0.6,
            minimumPixelSize: 100,
            maximumScale: 1.5,
          },
        };
        czmlArr.push(vehicle);
      }
    });

    let CzmlLayerData = {
      name: "交通模拟",
      czmlId: id,
      data: czmlArr,
      autoUpdateClock: false,
      // flyTo: true,
    };
    this._czmlLayer = new (window as any).mars3d.layer.CzmlLayer(CzmlLayerData);
    (window as any).addLayer(this._czmlLayer);
    // (window as any).addLayer(this._czmlLayer).then((e) => {
    //   this._czmlLayer.flyTo();
    // });
  }

  /**
   * 工具类
   * 根据速度计算 两点之间的时间
   * @param  { array } positionsStart - 起始坐标
   * @param  { array } positionsEnd - 结束坐标
   * @returns { number } - 两点之间的时间
   *
   */
  disTance(positionsStart, positionsEnd) {
    let startPosition, endPosition, distance;
    startPosition = (window as any).Cesium.Cartesian3.fromDegrees(
      ...positionsStart
    );
    endPosition = (window as any).Cesium.Cartesian3.fromDegrees(
      ...positionsEnd
    );
    distance = (window as any).Cesium.Cartesian3.distance(
      startPosition,
      endPosition
    );
    return distance;
  }

  /**
   * 工具类
   * 随机生成小车模型
   * 把点集数据处理为CZML格式的数据
   * @returns { string } - 小车的url
   */
  randomVehicle() {
    let index = Math.round(Math.random() * (this.automobileList.length - 1));
    return this.automobileList[index].url;
  }
}
export default BimTrafficSimulation;
