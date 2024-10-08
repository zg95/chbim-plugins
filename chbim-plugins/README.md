<br />

<p align="center">
  <a href="#">
    <img src="https://chbim.ccshcc.cn/baseResources//Logo/Logo.png" alt="Logo" height="60">
  </a>
  <h3 align="center">基于<font color="#4bbbef"> CHBIM云平台 </font>服务的插件</h3>

</p>

## 使用指南

1. 此插件和 CHBIM 平台强绑定
2. node 版本>=16.14.2

#### 安装

```sh
npm i chbim-plugins
```

#### 引入

```sh
import "chbim-plugins/style.css";
import { ChbimPlugins } from "chbim-plugins";
......
......
......
app.use(ChbimPlugins);
```

#### 使用

在需要使用的.vue 文件里面引入

```sh
import {
  BimTerrainProvider,             // 地形
  BimElevationImage,              // 瓦片
  BimModel,                       // 模型
  BimVector,                      // 矢量
  BimEntity,                      // 注记
  PanoramicView,                  // 全景图
  ......
} from "chbim-plugins";
```

添加模型为例：

```
/* data 为模型树的扁平化json */
window.bimModel = new BimModel(data);

/* 给地图添加模型
** id => 模型id
** fn => 自定义注册事件
*/
window.bimModel.add(id,fn).then((e) => {
   if (e.type == "error") {
     console.error('失败')
   }
 }).catch((e) => {
   console.error('失败')
 })
```

### API

#### window.bimElevationImage `影像`

##### add（ id || xyzParameter，isGisTkone，fn）添加影像

| 类参数名     | 类型    | 默认参数 | 描述                                                                                                                                                                                                         |
| ------------ | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id           | String  | “ ”      | 需要添加的影像 id                                                                                                                                                                                            |
| xyzParameter | Object  | { }      | 三方影像数据 `{imageXyzId:影像id，url:影像路由，zIndex:影像层级，minimumLevel:服务支持的最小层级，maximumLevel:服务支持的最大层级，chinaCRS:标识瓦片的国内坐标系（用于自动纠偏或加偏）}` chinaCRS 默认 GCJ02 |
| isGisTkone   | Boolean | true     | 是否开启 Tkone 验证，三方影像不需要开启验证                                                                                                                                                                  |
| fn           | Object  | { }      | 例如：绑定 click 事件 `{ click: (e) => { console.log(e) } }`                                                                                                                                                 |

##### remove（ id ）添加影像

| 类参数名 | 类型   | 默认参数 | 描述              |
| -------- | ------ | -------- | ----------------- |
| id       | String | “ ”      | 需要移除的影像 id |

##### query（ id ）查询影像的数据

| 类参数名 | 类型   | 默认参数 | 描述                            |
| -------- | ------ | -------- | ------------------------------- |
| id       | String | “ ”      | 需要查询的模型 id，返回模型数据 |

<br /><br />

#### window.bimModel `模型`

##### add（ id，fn，list ）添加模型

| 类参数名 | 类型   | 默认参数 | 描述                                                         |
| -------- | ------ | -------- | ------------------------------------------------------------ |
| id       | String | “ ”      | 需要添加的模型 id                                            |
| fn       | Object | { }      | 例如：绑定 click 事件 `{ click: (e) => { console.log(e) } }` |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }`                  |

##### remove（ id，list ）移除模型

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | String | “ ”      | 需要移除的模型 id                           |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### selected（ id ）选中模型

| 类参数名 | 类型    | 默认参数 | 描述                                                         |
| -------- | ------- | -------- | ------------------------------------------------------------ |
| id       | String  | “ ”      | 需要选中的模型 id                                            |
| fn       | Object  | { }      | 例如：绑定 click 事件 `{ click: (e) => { console.log(e) } }` |
| list     | Object  | { }      | 字段目前用于处理分屏数据 `{ isClone:true }`                  |
| flyTo    | Boolean | true     | 默认会自动飞行，模型选中变红，设置`false`不会飞行            |

##### query（ id ）查询模型的数据

| 类参数名 | 类型   | 默认参数 | 描述                            |
| -------- | ------ | -------- | ------------------------------- |
| id       | String | “ ”      | 需要查询的模型 id，返回模型数据 |

##### queryModel（ id ）查询 map 上模型的实体

| 类参数名 | 类型   | 默认参数 | 描述                            |
| -------- | ------ | -------- | ------------------------------- |
| id       | String | “ ”      | 需要查询的模型 id，返回模型实体 |

##### editColor（ id，newColor，list ）模型染色

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | String | “ ”      | 模型 id                                     |
| newColor | String | “ ”      | css 颜色值                                  |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### editOpacity（ id，opacity）模型染色

| 类参数名 | 类型   | 默认参数 | 描述         |
| -------- | ------ | -------- | ------------ |
| id       | String | “ ”      | 模型 id      |
| opacity  | String | “ ”      | 透明度值 0~1 |

<br /><br />

#### window.bimVector `矢量`

##### add（ id，list ）添加矢量

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | Object | “ ”      | 需要添加的矢量 id                           |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### remove（ id，list ）移除矢量

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | String | “ ”      | 需要移除的矢量 id                           |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### selected（ id ）添加矢量

| 类参数名 | 类型   | 默认参数 | 描述                                       |
| -------- | ------ | -------- | ------------------------------------------ |
| id       | Object | “ ”      | 需要选中的矢量 id ，选中会飞行到选中的矢量 |

##### query（ id ）查询矢量数据

| 类参数名 | 类型   | 默认参数 | 描述                             |
| -------- | ------ | -------- | -------------------------------- |
| id       | Object | “ ”      | 需要选中的矢量 id ，返回矢量数据 |

##### queryVector（ id ）查询矢量实体

| 类参数名 | 类型   | 默认参数 | 描述                             |
| -------- | ------ | -------- | -------------------------------- |
| id       | Object | “ ”      | 需要选中的矢量 id ，返回矢量实体 |

<br /><br />

#### window.bimEntity `标绘`

##### add（ id，entityId，list ）添加标绘

| 类参数名 | 类型   | 默认参数 | 描述                                            |
| -------- | ------ | -------- | ----------------------------------------------- |
| id       | Object | “ ”      | 需要添加的标绘 id                               |
| entityId | String | null     | 临时添加的标绘是不带 id 的，需要自定义的一个 id |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }`     |

##### remove（ id，list ）移除标绘

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | String | “ ”      | 需要移除的标绘 id                           |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### query（ id ）查询标绘数据

| 类参数名 | 类型   | 默认参数 | 描述                             |
| -------- | ------ | -------- | -------------------------------- |
| id       | Object | “ ”      | 需要选中的矢量 id ，返回矢量数据 |

##### queryEntity（ id ）查询标绘实体

| 类参数名 | 类型   | 默认参数 | 描述                             |
| -------- | ------ | -------- | -------------------------------- |
| id       | Object | “ ”      | 需要选中的矢量 id ，返回矢量实体 |

<br /><br />

#### window.bimModify `环境修改`

##### evnModifyById（ id，list ）添加环境修改

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | Object | “ ”      | 需要添加的环境修改的 id                     |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### clearEvnModifyById（ id，list ）移除环境修改

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| id       | String | “ ”      | 需要移除的环境修改 id                       |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### clearAllModelModify（ list ）移除所有对于模型的环境修改

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### clearAllTerrainModify（ list ）移除所有对于地形的环境修改

| 类参数名 | 类型   | 默认参数 | 描述                                        |
| -------- | ------ | -------- | ------------------------------------------- |
| list     | Object | { }      | 字段目前用于处理分屏数据 `{ isClone:true }` |

##### clearAllEvnModify（）移除所有的环境修改

<br /><br />

#### window.Bimroaming `漫游`

##### init（ viewPoints, savePoint, option ）初始化漫游

| 类参数名   | 类型     | 默认参数 | 描述                                                                                                                                                                  |
| ---------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| viewPoints | Array    | []       | 漫游路径的点集，每个点是一个对象{lng: 0, lat: 0, alt: 0}                                                                                                              |
| savePoint  | Function | null     | 新增点的回调函数                                                                                                                                                      |
| option     | Object   | { }      | 漫游配置项 followedX：距离视角的距离， followedZ：距离视角垂直高度，smooth：平衡值使漫游转角顺滑， speed：飞行速度 ，Viewovalue：类型 （1：第一人称 2：跟随 3：俯视） |

##### startDrawGraphic（）添加点

##### start（）开始漫游

##### pause（）暂停漫游

##### resume（）继续漫游

##### stop（）停止漫游

##### remove（）移除漫游

### 版本控制

该项目使用 Git 进行版本管理。
