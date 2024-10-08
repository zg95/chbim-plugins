class BimModify {
  constructor(flattenData) {
    // 获取扁平化的环境修改树数据，包含模型和地形
    this.flattenedEvnModifyData = flattenData;
    // 主地图添加了模型修改动作的模型id组成的数组
    this.modelIdListByModify = [];
    // 副地图添加了模型修改动作的模型id组成的数组
    this.modelIdListByModifyClone = [];
    // 主地图的地形裁剪实例
    this.terrainClip = null;
    // 主地图的地形压平实例
    this.terrainFlat = null;
    // 副地图的地形裁剪实例
    this.terrainClipClone = null;
    // 副地图的地形压平实例
    this.terrainFlatClone = null;
    // 创建地形修改实例
    this.createTerrainModifyInstance();
  }

  // ------------------------------------------数据预处理------------------------------------------
  /**
   * 通过id从扁平化的环境修改树数据中获取数据
   * @param {String} id 环境修改树数据的id
   * @return {Object} 环境修改树数据
   */
  getDataFromFlattenedEvnModifyListById(id) {
    const data = this.flattenedEvnModifyData.find((item) => item.id == id);
    // 将id转换为字符串，防止id为数字时无法匹配
    if (data) {
      data.id = data.id.toString();
      return data;
    }
    return null;
  }

  /**
   * 通过modelId从map对象中获取对应模型
   * @param {String} modelId 模型id
   * @return {Object} 模型对象没有返回undifine
   */
  getModelFromMapById(modelId, params) {
    let layers;
    switch (params?.isClone) {
      case true:
        layers = window.mapClone ? window.mapClone.mapEx.getLayers() : [];
        break;
      case false:
        layers = window.map.getLayers();
        break;
    }
    const tilesetLayer = layers.find(
      (layer) => layer.options.modelId == modelId
    );
    return tilesetLayer;
  }

  /**
   * 更新flattenedEvnModifyData
   * @param {Array} flattenData 环境修改树数据
   */
  updateFlattenedEvnModifyData(flattenData) {
    this.flattenedEvnModifyData = flattenData;
  }

  // ------------------------------------------模型修改相关方法------------------------------------------
  /**
   * 对指定模型添加裁剪区域
   * @param {String} modelId 模型id
   * @param {Array} positions 裁剪区域的坐标点数组(笛卡尔坐标对象组成的数组)
   * @param {String} id 裁剪区域的id即
   */
  modelCutById(modelId, positions, id, params) {
    // 通过模型id查询到模型对象
    const tilesetLayer = this.getModelFromMapById(modelId, params);
    // 模型不存在则直接返回
    if (!tilesetLayer) return;
    // 重复添加相同id的裁剪则直接return
    if (tilesetLayer.clip.list.find((item) => item.id == id)) return;
    // 利用裁剪区域坐标点数组裁剪模型(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
    tilesetLayer.clip.addArea(positions.length > 1 ? positions : positions[0], {
      id,
    });
    switch (params?.isClone) {
      case true:
        // 将模型id加入到modelIdListByModifyClone数组中
        this.modelIdListByModifyClone.push(modelId);
        // 数组去重
        this.modelIdListByModifyClone = [
          ...new Set(this.modelIdListByModifyClone),
        ];
        break;
      case false:
        // 将模型id加入到modelIdListByModify数组中
        this.modelIdListByModify.push(modelId);
        // 数组去重
        this.modelIdListByModify = [...new Set(this.modelIdListByModify)];
        break;
    }
  }

  /**
   * 对指定模型添加压平区域
   * @param {String} modelId 模型id
   * @param {Array} positions 压平区域的坐标点数组
   * @param {Number} height 压平高度
   * @param {String} id 压平区域的id
   */
  modelFlattenById(modelId, positions, height, id, params) {
    // 通过模型id查询到模型对象
    const tilesetLayer = this.getModelFromMapById(modelId, params);
    // 模型不存在则直接返回
    if (!tilesetLayer) return;
    // 重复添加相同id的压平则直接return
    if (tilesetLayer.flat.list.find((item) => item.id == id)) return;
    // 利用压平区域坐标点数组和压平高度压平模型(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
    tilesetLayer.flat.addArea(positions.length > 1 ? positions : positions[0], {
      height,
      id,
    });
    switch (params?.isClone) {
      case true:
        // 将模型id加入到modelIdListByModifyClone数组中
        this.modelIdListByModifyClone.push(modelId);
        // 数组去重
        this.modelIdListByModifyClone = [
          ...new Set(this.modelIdListByModifyClone),
        ];
        break;
      case false:
        // 将模型id加入到modelIdListByModify数组中
        this.modelIdListByModify.push(modelId);
        // 数组去重
        this.modelIdListByModify = [...new Set(this.modelIdListByModify)];
        break;
    }
  }

  /**
   * 清除指定模型的裁剪区域
   * @param {String} modelId 模型id
   * @param {String} id 裁剪区域的id
   */
  clearModelCutById(modelId, id, params) {
    // 通过模型id查询到模型对象
    const tilesetLayer = this.getModelFromMapById(modelId, params);
    // 模型不存在则直接返回
    if (!tilesetLayer) return;
    // 通过裁剪的id清除裁剪区域
    tilesetLayer.clip.removeArea(id);
    switch (params.isClone) {
      case true:
        // 将模型id从modelIdListByModifyClone数组中移除
        this.modelIdListByModifyClone = this.modelIdListByModifyClone.filter(
          (item) => item != modelId
        );
        break;
      case false:
        // 将模型id从modelIdListByModify数组中移除
        this.modelIdListByModify = this.modelIdListByModify.filter(
          (item) => item != modelId
        );
        break;
    }
  }

  /**
   * 清除指定模型的压平区域
   * @param {String} modelId 模型id
   * @param {String} id 压平区域的id
   */
  clearModelFlattenById(modelId, id, params) {
    // 通过模型id查询到模型对象
    const tilesetLayer = this.getModelFromMapById(modelId, params);
    // 模型不存在则直接返回
    if (!tilesetLayer) return;
    // 模型不存在flat则直接返回
    // if (!tilesetLayer.flat) return;
    // 通过压平的id清除压平区域
    tilesetLayer.flat.removeArea(id);
    switch (params?.isClone) {
      case true:
        // 将模型id从modelIdListByModifyClone数组中移除
        this.modelIdListByModifyClone = this.modelIdListByModifyClone.filter(
          (item) => item != modelId
        );
        break;
      case false:
        // 将模型id从modelIdListByModify数组中移除
        this.modelIdListByModify = this.modelIdListByModify.filter(
          (item) => item != modelId
        );
        break;
    }
  }

  // ------------------------------------------地形修改相关方法------------------------------------------
  /**
   * 创建地形修改实例(地形修改不像模型修改，模型修改拿到模型对象后直接调用模型对象的clip和flat方法即可。地形修改需要创
   * 建实例，通过该实例来进行地形裁剪和压平操作)
   */
  createTerrainModifyInstance() {
    // 判断map对象上有无创建好的地形修改实例，有就直接拿，没有就创建
    if (window.map.thing.terrainClip) {
      this.terrainClip = window.map.thing.terrainClip;
    } else {
      const terrainClip = new mars3d.thing.TerrainClip({
        czm: false,
        splitNum: 30, // 井边界插值数
      });
      window.map.addThing(terrainClip);
      this.terrainClip = terrainClip;
    }

    if (window.map.thing.terrainFlat) {
      this.terrainFlat = window.map.thing.terrainFlat;
    } else {
      const terrainFlat = new mars3d.thing.TerrainFlat({
        splitNum: 80, // 井边界插值数
      });
      window.map.addThing(terrainFlat);
      this.terrainFlat = terrainFlat;
    }
  }

  /**
   * 创建副地图地形修改实例
   */
  createTerrainModifyInstanceClone() {
    // 不存在副地图直接return
    if (!window.mapClone) return;

    if (window.mapClone.mapEx.thing.terrainClip) {
      this.terrainClipClone = window.mapClone.mapEx.thing.terrainClip;
    } else {
      const terrainClipClone = new mars3d.thing.TerrainClip({
        splitNum: 80, // 井边界插值数
      });
      window.mapClone.mapEx.addThing(terrainClipClone);
      this.terrainClipClone = terrainClipClone;
    }

    if (window.mapClone.mapEx.thing.terrainFlat) {
      this.terrainFlatClone = window.mapClone.mapEx.thing.terrainFlat;
    } else {
      const terrainFlatClone = new mars3d.thing.TerrainFlat({
        splitNum: 80, // 井边界插值数
      });
      window.mapClone.mapEx.addThing(terrainFlatClone);
      this.terrainFlatClone = terrainFlatClone;
    }
  }
  /**
   * 对地形添加裁剪区域
   * @param {Array} positions 裁剪区域的坐标点数组
   * @param {String} id 裁剪区域的id
   */
  terrainCutById = (positions, id, params) => {
    switch (params?.isClone) {
      case true:
        this.createTerrainModifyInstanceClone();
        // 不存在地形修改实例则直接返回
        if (!this.terrainClipClone) return;
        // 存在相同id的裁剪区域则直接返回
        if (this.terrainClipClone.list.find((item) => item.id == id)) return;
        // 利用裁剪区域坐标点数组裁剪模型(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
        this.terrainClipClone.addArea(
          positions.length > 1 ? positions : positions[0],
          { id }
        );
        break;
      case false:
        // 不存在地形修改实例则直接返回
        if (!this.terrainClip) return;
        // 存在相同id的裁剪区域则直接返回
        if (this.terrainClip.list.find((item) => item.id == id)) return;
        // 利用裁剪区域坐标点数组裁剪模型(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
        this.terrainClip.addArea(
          positions.length > 1 ? positions : positions[0],
          { id }
        );
        break;
    }
  };

  /**
   * 清除地形的裁剪区域
   * @param {String} id 裁剪区域的id
   */
  clearTerrainCutById = (id, params) => {
    switch (params?.isClone) {
      case true:
        this.createTerrainModifyInstanceClone();
        // 不存在地形修改实例则直接返回
        if (!this.terrainClipClone) return;
        // 通过裁剪的id清除裁剪区域
        this.terrainClipClone.removeArea(id);
        break;
      case false:
        // 不存在地形修改实例则直接返回
        if (!this.terrainClip) return;
        // 通过裁剪的id清除裁剪区域
        this.terrainClip.removeArea(id);
        break;
    }
  };

  /**
   * 对地形添加压平区域
   * @param {Array} positions 压平区域的坐标点数组
   * @param {Number} diffHeight 压平区域深度
   * @param {String} id 压平区域的id
   */
  terrainFlattenById = (positions, height, id, params) => {
    switch (params?.isClone) {
      case true:
        // 第一次操作副地图地形时，this.isCloneMapCreated为flase，代表副地图还未创建。
        // 因此需要执行创建副地图地形实例的操作
        // 执行后，this.isCloneMapCreated为true，代表副地图已经创建。且后续执行地形操作的时候不会执行下面创建副地图地形实例的操作，直到手动调用销毁副地图地形实例的操作。
        this.createTerrainModifyInstanceClone();
        // 不存在地形修改实例则直接返回
        if (!this.terrainFlatClone) return;
        // 存在相同id的压平区域则直接返回
        if (this.terrainFlatClone.list.find((item) => item.id == id)) return;
        // 利用压平区域坐标点数组压平地形(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
        this.terrainFlatClone.addArea(
          positions.length > 1 ? positions : positions[0],
          { id, height }
        );
        break;
      case false:
        // 不存在地形修改实例则直接返回
        if (!this.terrainFlat) return;
        // 存在相同id的压平区域则直接返回
        if (this.terrainFlat.list.find((item) => item.id == id)) return;
        // 利用压平区域坐标点数组压平地形(坐标这么写是因为geojson单个多边形和多个多边形坐标的嵌套层级不一样)
        this.terrainFlat.addArea(
          positions.length > 1 ? positions : positions[0],
          { id, height }
        );
        break;
    }
  };

  /**
   * 清除地形的压平区域
   */
  clearTerrainFlattenById = (id, params) => {
    switch (params?.isClone) {
      case true:
        this.createTerrainModifyInstanceClone();
        // 不存在地形修改实例则直接返回
        if (!this.terrainFlatClone) return;
        // 通过压平的id清除压平区域
        this.terrainFlatClone.removeArea(id);
        break;
      case false:
        // 不存在地形修改实例则直接返回
        if (!this.terrainFlat) return;
        // 通过压平的id清除压平区域
        this.terrainFlat.removeArea(id);
        break;
    }
  };

  // ------------------------------------------利用以上工具函数实现通过id来进行环境修改功能------------------------------------------
  /**
   * 传入id来进行环境修改
   * @param {String} id 环境修改树数据的id
   * @param {Object} params 额外参数，目前只有isClone，用来标识是否是副地图的环境修改
   */
  evnModifyById(inputId, params) {
    params = arguments[1] || { isClone: false };
    // 通过id获取环境修改树的数据，并解构出需要用到的参数
    const res = this.getDataFromFlattenedEvnModifyListById(inputId);
    // 查不到数据则直接返回
    if (!res) return;
    const {
      bimEnvModify: { embsId: modelId, dataType, modifyType },
    } = res;
    for (let i = 0; i < res.bimEnvModifyData.length; i++) {
      // positions里面需要的数据有可能嵌套在第三层或者第四层因此需要处理
      /**
       * [
       *   [
       *    {x:123,y:456,z:789},{x:123,y:456,z:789}
       *    ]
       * ]
       */
      /**
       * [
       * [
       *   [
       *    {x:123,y:456,z:789},{x:123,y:456,z:789}
       *    ]
       *  ]
       * ]
       */
      // 这是直接拿到的坐标数据
      const positions = JSON.parse(
        res.bimEnvModifyData[i].modifyData
      ).coordinates;
      // 处理后的坐标数据，可以直接传给模型修改函数，虽然模型修改函数里面也对postions进行了判断处理
      const positionsReal =
        positions[0].length > 1 ? positions[0] : positions[0][0];

      const height = JSON.parse(res.bimEnvModifyData[i].modifyData).depth;
      const id = res.bimEnvModifyData[i].id.toString();
      // positions是一个二维数组，因此需要取下标为0的元素来作为区域坐标
      if (dataType === 0 && modifyType === 0) {
        //模型裁剪
        this.modelCutById(modelId, positionsReal, id, params);
      } else if (dataType === 0 && modifyType === 1) {
        //模型压平
        this.modelFlattenById(modelId, positionsReal, height, id, params);
      } else if (dataType === 1 && modifyType === 0) {
        //地形裁剪
        this.terrainCutById(positionsReal, id, params);
      } else if (dataType === 1 && modifyType === 1) {
        //地形压平
        this.terrainFlattenById(positionsReal, height, id, params);
      }
    }
  }

  /**
   * 传入id来进行环境修改并且向map store中传入针对倾斜摄影模型的环境修改配置项，以便在模型重载的时候能够还原环境修改
   * @param {String} id 环境修改树数据的id
   * @param {Object} params 额外参数，目前只有isClone，用来标识是否是副地图的环境修改
   */
  evnModifyByIdAndAddOptionsToStore(inputId, params) {
    params = arguments[1] || { isClone: false };
    // 通过id获取环境修改树的数据，并解构出需要用到的参数
    const res = this.getDataFromFlattenedEvnModifyListById(inputId);
    // 查不到数据则直接返回
    if (!res) return;
    const {
      bimEnvModify: { embsId: modelId, dataType, modifyType },
    } = res;
    for (let i = 0; i < res.bimEnvModifyData.length; i++) {
      // positions里面需要的数据有可能嵌套在第三层或者第四层因此需要处理
      /**
       * [
       *   [
       *    {x:123,y:456,z:789},{x:123,y:456,z:789}
       *    ]
       * ]
       */
      /**
       * [
       * [
       *   [
       *    {x:123,y:456,z:789},{x:123,y:456,z:789}
       *    ]
       *  ]
       * ]
       */
      // 这是直接拿到的坐标数据
      const positions = JSON.parse(
        res.bimEnvModifyData[i].modifyData
      ).coordinates;
      // 处理后的坐标数据，可以直接传给模型修改函数，虽然模型修改函数里面也对postions进行了判断处理
      const positionsReal =
        positions[0].length > 1 ? positions[0] : positions[0][0];

      const height = JSON.parse(res.bimEnvModifyData[i].modifyData).depth;
      const id = res.bimEnvModifyData[i].id.toString();
      // positions是一个二维数组，因此需要取下标为0的元素来作为区域坐标
      if (dataType === 0 && modifyType === 0) {
        //模型裁剪
        this.modelCutById(modelId, positionsReal, id, params);
      } else if (dataType === 0 && modifyType === 1) {
        //模型压平
        this.modelFlattenById(modelId, positionsReal, height, id, params);
      } else if (dataType === 1 && modifyType === 0) {
        //地形裁剪
        this.terrainCutById(positionsReal, id, params);
      } else if (dataType === 1 && modifyType === 1) {
        //地形压平
        this.terrainFlattenById(positionsReal, height, id, params);
      }
    }
  }

  /**
   * 传入id来清除环境修改
   * @param {String} id 环境修改树数据的id
   * @param {Object} params 额外参数，目前只有isClone，用来标识是否是副地图的环境修改
   */
  clearEvnModifyById(inputId, params) {
    params = arguments[1] || { isClone: false };
    // 通过id获取环境修改树的数据，并解构出需要用到的参数
    // 通过id获取环境修改树的数据，并解构出需要用到的参数
    const res = this.getDataFromFlattenedEvnModifyListById(inputId);
    // 查不到数据则直接返回
    if (!res) return;
    const {
      bimEnvModify: { embsId: modelId, dataType, modifyType },
    } = res;
    for (let i = 0; i < res.bimEnvModifyData.length; i++) {
      const id = res.bimEnvModifyData[i].id.toString();
      if (dataType === 0 && modifyType === 0) {
        //清除指定模型的裁剪区域
        this.clearModelCutById(modelId, id, params);
      } else if (dataType === 0 && modifyType === 1) {
        //清除指定模型的压平区域
        this.clearModelFlattenById(modelId, id, params);
      } else if (dataType === 1 && modifyType === 0) {
        //清除地形的裁剪区域
        this.clearTerrainCutById(id, params);
      } else if (dataType === 1 && modifyType === 1) {
        //清除地形的压平区域
        this.clearTerrainFlattenById(id, params);
      }
    }
  }

  /**
   * 根据params参数来清除指定地图上所有模型的裁剪和压平区域
   * @param {Array} modelIdListByModify 要清除裁剪和压平区域的模型id数组(一般不传即可)
   */
  clearAllModelModify(params) {
    if (!params) {
      params = { isClone: false };
    }
    switch (params.isClone) {
      case true:
        // 遍历modelIdListByModifyClone数组，清除裁剪和压平区域
        this.modelIdListByModifyClone.forEach((modelId) => {
          const tilesetLayer = this.getModelFromMapById(modelId, params);
          // 模型不存在则直接返回
          if (!tilesetLayer) return;
          // 清除裁剪区域
          tilesetLayer.clip.clear();
          // 清除压平区域
          tilesetLayer.flat.clear();
        });
        // 重置modelIdListByModifyClone数组
        this.modelIdListByModifyClone = [];
        break;
      case false:
        // 遍历modelIdListByModify数组，清除裁剪和压平区域
        this.modelIdListByModify.forEach((modelId) => {
          const tilesetLayer = this.getModelFromMapById(modelId, params);
          // 模型不存在则直接返回
          if (!tilesetLayer) return;
          // 清除裁剪区域
          tilesetLayer.clip.clear();
          // 清除压平区域
          tilesetLayer.flat.clear();
        });
        // 重置modelIdListByModify数组
        this.modelIdListByModify = [];
        break;
    }
  }

  /**
   * 根据params参数来清除指定地形修改区域
   */
  clearAllTerrainModify(params) {
    if (!params) {
      params = { isClone: false };
    }
    switch (params.isClone) {
      case true:
        this.terrainClip && this.terrainClip.clear();
        this.terrainFlat && this.terrainFlat.clear();
        break;
      case false:
        // 如果清除的是副地图的所有地形修改，则判断副地图是否被销毁如果被销毁则重置副地图相关的变量
        if (!window.mapClone) {
          this.terrainClipClone = null;
          this.terrainFlatClone = null;
        }
        this.terrainClipClone && this.terrainClipClone.clear();
        this.terrainFlatClone && this.terrainFlatClone.clear();
        break;
    }
  }

  /**
   * 传入id来获取模型修改所用到的数据，以便在模型加载的时候直接进行模型修改
   *  !!!!!!!!!!!!!!!!!!!!!
   * !!!!!!!!!!!!!!!!!!!!!
   * !!!!!!!!!!!!!!!!!!!!!
   * 从coordinates拿到的position数组，在multpolygon和polygon格式的geojson中，需要的坐标分别嵌套在第三层和第四层因此需要判断后拿到真实的数据
   * !!!!!!!!!!!!!!!!!!!!!
   * !!!!!!!!!!!!!!!!!!!!!
   * !!!!!!!!!!!!!!!!!!!!!
   * @param {String} id 环境修改树数据的id
   * @return {Array} 可以直接放到area中的数组
   */
  getModelModifyDataForInitModelById(inputId) {
    // 通过id获取环境修改树的数据，并解构出需要用到的参数
    const res = this.getDataFromFlattenedEvnModifyListById(inputId);

    // 查不到数据则直接返回
    if (!res) return;

    // 解构出需要的数据
    const {
      bimEnvModify: { embsId: modelId, dataType, modifyType },
    } = res;

    // 根据数据类型和修改类型，返回对应的初始化数据
    if (dataType === 0 && modifyType === 0) {
      //模型裁剪数据
      const options = {
        modelId,
        type: "clip",
        area: [],
      };
      // 遍历环境修改树的bimEnvModifyData数组，往area中添加倾斜初始化时需要的环境修改数据
      for (let i = 0; i < res.bimEnvModifyData.length; i++) {
        let positions = JSON.parse(res.bimEnvModifyData[i].modifyData)
          .coordinates[0];
        positions = positions.length > 1 ? positions : positions[0];
        const areaItem = {
          positions: positions,
          id: res.bimEnvModifyData[i].id.toString(),
        };
        options.area.push(areaItem);
      }
      return options;
    } else if (dataType === 0 && modifyType === 1) {
      //模型压平数据
      const options = {
        modelId,
        type: "flat",
        area: [],
      };
      // 遍历环境修改树的bimEnvModifyData数组，往area中添加倾斜初始化时需要的环境修改数据
      for (let i = 0; i < res.bimEnvModifyData.length; i++) {
        let positions = JSON.parse(res.bimEnvModifyData[i].modifyData)
          .coordinates[0];
        positions = positions.length > 1 ? positions : positions[0];
        const areaItem = {
          id: res.bimEnvModifyData[i].id.toString(),
          positions: JSON.parse(res.bimEnvModifyData[i].modifyData)
            .coordinates[0],
          height: JSON.parse(res.bimEnvModifyData[i].modifyData).depth,
        };
        options.area.push(areaItem);
        return options;
      }
    }
    // 倾斜里面配置项实例
    // clip: {
    //     area: [
    //       {
    //         id: "1",
    //         positions: [
    //           [117.217219, 31.81957, 33.1],
    //           [117.220855, 31.818821, 31.8],
    //           [117.220938, 31.817249, 30.6],
    //           [117.21743, 31.816218, 31.7]
    //         ]
    //       }
    //     ],
    //       enabled: true
    // }

    // flat: {
    //     area: [
    //       {
    //         id: "1",
    //         positions: [
    //           [117.217219, 31.81957, 33.1],
    //           [117.220855, 31.818821, 31.8],
    //           [117.220938, 31.817249, 30.6],
    //           [117.21743, 31.816218, 31.7]
    //         ],
    //         height: 100
    //       }
    //     ],
    //       enabled: true
    // }
  }
  /**
   * 清空地图上所有的环境修改
   */

  clearAllEvnModify() {
    this.clearAllModelModify({ isClone: true });
    this.clearAllModelModify({ isClone: false });
    this.clearAllTerrainModify({ isClone: true });
    this.clearAllTerrainModify({ isClone: false });
  }

  /**
   * 销毁地形修改实例
   */
  destroyTerrainModifyInstance() {
    // 先清空所有地形修改
    this.clearAllTerrainModify({ isClone: true });
    this.clearAllTerrainModify({ isClone: false });
    // 销毁地形修改实例
    this.terrainClip && window.map.removeThing(this.terrainClip, true);
    this.terrainFlat && window.map.removeThing(this.terrainFlat, true);
    this.terrainClipClone &&
      window.mapClone.mapEx.removeThing(this.terrainClipClone, true);
    this.terrainFlatClone &&
      window.mapClone.mapEx.removeThing(this.terrainFlatClone, true);
    // 重置terrainClip和terrainFlat
    this.terrainClip = null;
    this.terrainFlat = null;
    this.terrainClipClone = null;
    this.terrainFlatClone = null;
  }
}
export default BimModify;
