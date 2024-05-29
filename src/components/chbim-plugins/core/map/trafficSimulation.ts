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
  private beginDate: string;
  private endDate: string;

  constructor(map: any) {
    if ((window as any).mars3d) {
      this._map = map;
      this.beginDate = "";
      this.endDate = "";
    }
  }
}
