/**
 * 360全景图方法
 * @param  { Object } itemMap  地图对象（主地图）
 */

interface CameraPosition {
  heading: number;
  pitch: number;
  stop: number;
}
interface CameraScreenshot {
  src: string;
  name: string;
}

import JSZip from "jszip";
import saveAs from "file-saver";
// import { ElNotification } from "element-plus";
class PanoramicView {
  private map: any;
  private panoramicViewClass!: string;
  private lat: number | undefined;
  private lng: number | undefined;
  private alt: number | undefined;
  private events!: Object;
  private timestamp!: number;
  coordinate: CameraPosition[] | undefined;
  screenshotArray: CameraScreenshot[] | undefined;

  constructor(itemMap: any, panoramicViewClass: string) {
    if ((window as any).mars3d) {
      this.map = itemMap;
      this.panoramicViewClass = panoramicViewClass;
      this.coordinate = [
        {
          heading: 0,
          pitch: 0,
          stop: 5,
        },
        {
          heading: 90,
          pitch: 0,
          stop: 5,
        },
        {
          heading: 180,
          pitch: 0,
          stop: 5,
        },
        {
          heading: 270,
          pitch: 0,
          stop: 5,
        },
        {
          heading: 0,
          pitch: 90,
          stop: 5,
        },
        {
          heading: 0,
          pitch: -90,
          stop: 5,
        },
      ];
      this.screenshotArray = [];
      this.events = {};
      this.timestamp = 0;
      this.lat, this.lng, this.alt;
    } else {
      console.error("未引入指定插件");
    }
  }
  /**
   * 开启全景图下载
   * @returns { any }
   */
  start(state = true): any {
    if (state) {
      this.timestamp = new Date().getTime();
      const element: HTMLElement | null = document.getElementById("app");
      const viewportHeight = window.innerHeight;
      const mars3dContainerDiv = document.getElementById("mars3dContainer");
      if (mars3dContainerDiv) {
        mars3dContainerDiv.style.width = viewportHeight.toString() + "px";
        mars3dContainerDiv.style.height = viewportHeight.toString() + "px";
      }
      if (element !== null) {
        element.classList.add(this.panoramicViewClass);
      }
      let { lat, lng, alt } = this.map.getCameraView();
      this.lat = lat;
      this.lng = lng;
      this.alt = alt;
      // 视距扩散
      this.map.viewer.scene.camera.frustum.fov =
        (window as any).Cesium.Math.PI_OVER_THREE * 1.5;
    }
    if (this.screenshotArray && this.coordinate) {
      if (this.coordinate[this.screenshotArray?.length]) {
        this.map.setCameraView(
          {
            lat: this.lat,
            lng: this.lng,
            alt: this.alt,
            ...this.coordinate[this.screenshotArray?.length],
          },
          {
            complete: () => {
              setTimeout(() => {
                this.screenshot(this.screenshotArray?.length);
              }, 100);
            },
          }
        );
      } else {
        this.downloadImagesAsZip();
        this.screenshotArray = [];
      }
    } else {
      console.error("初始化失效");
      // ElNotification({
      //   title: "提示",
      //   message: "生成失败",
      //   type: "error",
      //   offset: 320,
      // });
      this.emit("state", {
        type: "error",
      });
    }
  }

  /**
   * 截图
   * @returns { any }
   */
  async screenshot(_index: number | undefined): Promise<any> {
    const mapImg = await this.map.expImage({ download: false });
    const filterNode = this.map.container.getElementsByClassName(
      "cesium-viewer-cesiumWidgetContainer"
    );
    const divImg = await (window as any).domtoimage.toPng(this.map.container, {
      filter: (node: any) => {
        return node !== filterNode[0];
      },
    });

    this.mergeImage(mapImg.image, divImg, mapImg.width, mapImg.height).then(
      (e: string) => {
        let index = Number(_index) + 1;
        let data = {
          src: e,
          name: "全景图_" + this.timestamp + "_" + index + ".jpg",
        };
        this.emit("intercept", data);
        this.screenshotArray?.push(data);
        this.start(false);
      }
    );
  }

  /**
   * 合成图片
   * @param {any} width
   * @param {any} height
   * @returns {any}
   */
  mergeImage(base1: string, base2: string, width: any, height: any): any {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (canvas && ctx) {
        const image = new Image(); // MAP图片
        image.crossOrigin = "Anonymous"; // 支持跨域图片
        image.onload = () => {
          ctx.drawImage(image, 0, 0, width, height);
          const image2 = new Image(); // div图片
          image2.crossOrigin = "Anonymous"; // 支持跨域图片
          image2.onload = () => {
            ctx.drawImage(image2, 0, 0, width, height);
            // 合并后的图片
            const base64 = canvas.toDataURL("image/png");
            resolve(base64);
          };
          image2.src = base2;
        };
        image.src = base1;
      } else {
        reject();
      }
    });
  }

  /**
   * 下载图片
   * @returns {any}
   */
  download(): any {
    if (this.screenshotArray) {
      this.screenshotArray.forEach((e: any) => {
        (window as any).mars3d.Util.downloadBase64Image(e.name, e.src);
      });
    }
  }

  /**
   * 下载压缩包
   * @returns
   */
  async downloadImagesAsZip() {
    if (this.screenshotArray) {
      const zip = new JSZip();
      this.screenshotArray.forEach((item) => {
        const base64Data = item.src.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteArrays: Uint8Array[] = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          for (let j = 0; j < slice.length; j++) {
            byteNumbers[j] = slice.charCodeAt(j);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: "image/jpeg" }); // 根据实际类型调整
        const fileName = `${item.name}`; // 自定义文件名

        // 添加到JSZip
        zip.file(fileName, blob, { binary: true });
      });
      // 生成最终的zip文件
      const content = await zip.generateAsync({ type: "blob" });

      // 触发下载
      saveAs(content, "CHBIM-Panorama.zip");

      // ElNotification({
      //   title: "提示",
      //   message: "截图完成，请下载压缩包",
      //   type: "success",
      //   offset: 320,
      // });

      this.emit("state", {
        type: "success",
        schedule: 100,
      });

      this.init();
    }
  }

  /**
   * 初始化
   */
  init(): any {
    const element: HTMLElement | null = document.getElementById("app");
    if (element) element.classList.remove(this.panoramicViewClass);
    const mars3dContainerDiv = document.getElementById("mars3dContainer");
    if (mars3dContainerDiv) {
      mars3dContainerDiv.style.width = "";
      mars3dContainerDiv.style.height = "";
    }
  }

  /**
   * events
   * 事件监听
   * @param  { string } event - 事件名 目前只支持enter和leave
   * @param  { Function } fn - 回调函数
   * @returns { any }
   */
  on(event: string, fn: Function): any {
    this.events[event]
      ? this.events[event].push(fn)
      : (this.events[event] = [fn]);
  }

  /**
   * events
   * 事件触发
   * @param  { string } event - 事件名
   * @returns { any }
   */
  emit(event: string | number, ...varparms: any[]): any {
    if (this.events[event] != undefined) {
      this.events[event].forEach((fn: any) => fn(...varparms));
    }
  }

  /**
   * events
   * 事件移除
   * @param  { string } event - 事件名
   * @param  { function } callback - 回调函数
   * @returns { any }
   */
  off(event: string | number, callback: any): any {
    this.events[event] = this.events[event].filter(
      (fn: any) => fn !== callback
    );
  }
}
export default PanoramicView;
