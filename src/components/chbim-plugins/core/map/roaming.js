/**
 * 漫游
 */
let graphicLayer = null;
let graphicLayerpoint = null;
let flyoption = null;
class Bimroaming {
  constructor() {
    if (mars3d) {
      this.projectId = parseInt(window.sessionStorage.getItem("nowProjectId"));
      this.viewPoints = new Array();
      this.roaming = null;
    }
  }
  init(viewPoints, savePoint, option) {
    graphicLayerpoint = new mars3d.layer.GraphicLayer({
      isContinued: true,
      // drawEndEventType: true,
    });
    var that = this;
    window.map.addLayer(graphicLayerpoint);
    graphicLayerpoint.on(mars3d.EventType.drawCreated, function (e) {
      var point = e.graphic.point;
      console.log(point);
      savePoint(point);
      setTimeout(() => {
        that.startDrawGraphic();
      }, 500);
      // 连续标绘时，可以代替
    });
    graphicLayerpoint.on(mars3d.EventType.editStop, function (e) {
      console.log("停止编辑", e);
    });
    // if (!viewPoints) {
    //   return;
    // }
    flyoption = option;
    // console.log(
    //   viewPoints.slice(0, 35000).map((e) => {
    //     return [e.lng, e.lat, e.alt];
    //   })
    // );

    graphicLayer = new mars3d.layer.GraphicLayer();

    window.map.addLayer(graphicLayer);
    if (viewPoints)
      this.viewPoints = viewPoints.filter((e, index) => {
        if (index % (flyoption.smooth * 1) == 0) {
          return e;
        }
      });

    this.addGraphicLayer(this.viewPoints);
    //this.addDemoGraphic1(this.viewPoints);
  }
  addDemoGraphic1(points) {
    console.log(
      points.map((e) => {
        return [e.lng, e.lat, e.alt];
      })
    );

    const graphicLine = new mars3d.graphic.PolylinePrimitive({
      positions: points.map((e) => {
        return [e.lng, e.lat, e.alt + 1000];
      }),
      style: {
        width: 10,
        materialType: mars3d.MaterialType.LineFlow,
        materialOptions: {
          color: "red",
          image: "http://mars3d.cn/img/textures/line-arrow-blue.png",
          speed: 10,
          repeat: new Cesium.Cartesian2(5, 1),
          mixt: true,
        },
      },
    });
    graphicLayer.addGraphic(graphicLine);
  }
  addGraphicLayer(point) {
    // console.log(point);
    var option = {};
    if (flyoption.Viewovalue == 1) {
      option = {
        camera: {
          type: "dy",
          followedX: flyoption.followedX,
          followedZ: flyoption.followedZ,
        },

        interpolation: true,
        interpolationDegree: 6,

        autoMiddleDynamicPosition: true,
        interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
      };
    } else if (flyoption.Viewovalue == 2) {
      option = {
        camera: {
          type: "gs",
          pitch: -30,
          radius: 500,
        },
        interpolation: true,
        interpolationDegree: 2,
        clockLoop: true,

        path: {
          width: 3,

          color: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5),
        },
      };
    } else {
      option = {
        camera: {
          type: "sd",

          followedZ: flyoption.followedZ,
        },
        polyline: {
          width: 3,

          color: Cesium.Color.fromCssColorString("#ff0000").withAlpha(0.5),
        },
      };
    }

    point = point.map((e) => {
      return [e.lng, e.lat, e.alt];
    });

    var length = point.length;

    this.fixedRoute = new mars3d.graphic.FixedRoute({
      name: "贴地表表面漫游",
      speed: flyoption.speed,
      autoStop: true,
      positions: point,
      offsetHeight: 1.6,
      clockLoop: true, // 是否循环播放
      ...option,
      // polyline: {
      //   color: "#ffff00",
      //   width: 3,
      // },
    });

    graphicLayer.addGraphic(this.fixedRoute);
  }
  addDemoGraphic(point, name) {
    const graphic = new mars3d.graphic.BillboardEntity({
      position: new mars3d.LngLatPoint(point.lng, point.lat, point.alt),
      style: {
        width: 30,
        height: 32,
        image: "/img/marker/markffd700.png",
        scale: 1,
        scaleByDistance: false,
        scaleByDistance_far: 1000000,
        scaleByDistance_farValue: 0.1,
        scaleByDistance_near: 1000,
        scaleByDistance_nearValue: 1,
        distanceDisplayCondition: false,
        distanceDisplayCondition_far: 2000000,
        distanceDisplayCondition_near: 0,
        clampToGround: false,
        visibleDepth: false,
        drawShow: true,
        // label: {
        //   // 不需要文字时，去掉label配置即可
        //   text: name,
        //   font_size: 30,
        //   color: "#ffffff",
        //   outline: true,
        //   outlineColor: "#000000",
        //   pixelOffsetY: -50,
        // },
      },
    });
    graphicLayerpoint.addGraphic(graphic);
    // this.addDemoGraphic();
  }

  startDrawGraphic(name) {
    graphicLayerpoint
      .startDraw({
        type: "billboard",
        style: {
          width: 30,
          height: 32,
          image: "/img/marker/markffd700.png",
          scale: 1,
          scaleByDistance: false,
          scaleByDistance_far: 1000000,
          scaleByDistance_farValue: 0.1,
          scaleByDistance_near: 1000,
          scaleByDistance_nearValue: 1,
          distanceDisplayCondition: false,
          distanceDisplayCondition_far: 2000000,
          distanceDisplayCondition_near: 0,
          clampToGround: false,
          visibleDepth: false,
          drawShow: true,
          classificationType: Cesium.ClassificationType.TERRAIN,
          // label: {
          //   text: name,
          //   font_size: 30,
          //   color: "#ffffff",
          //   outline: true,
          //   outlineColor: "#000000",
          //   pixelOffsetY: -50,
          // },
        },
      })
      .then((res) => {
        console.log(123);
      });
    // this.startDrawGraphic();
  }
  start() {
    console.log(this.fixedRoute);
    if (this.fixedRoute) this.fixedRoute.start();
  }
  pause() {
    if (this.fixedRoute) this.fixedRoute.pause();
  }
  resume() {
    if (this.fixedRoute) this.fixedRoute.proceed();
  }
  stop() {
    if (this.fixedRoute) this.fixedRoute.stop();
  }
  remove() {
    if (this.fixedRoute) this.fixedRoute.stop();
    window.map.removeThing(this.roaming, true);
    window.map.removeLayer(graphicLayer, true);
    window.map.removeLayer(graphicLayerpoint, true);
    this.viewPoints = [];
  }

  removeCameraRoute() {
    graphicLayer.clear();
    graphicLayerpoint.clear();
  }
  removegraphicLayerpoint() {
    graphicLayerpoint.clear();
  }
}
export default Bimroaming;
