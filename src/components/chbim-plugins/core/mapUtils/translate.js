import JSEncrypt from "jsencrypt";

export default GenerateBrowserFingerprint = (
  pubKey,
  appid = "cccc_web_browser_client"
) => {
  // // 获取用户代理
  // let userAgent = navigator.userAgent;

  // // 获取屏幕分辨率
  // let screenResolution = window.screen.width + "x" + window.screen.height;

  // // 获取颜色深度
  // let colorDepth = window.screen.colorDepth;

  // // 获取系统字体列表
  // let fontList = JSON.stringify(window.navigator.fonts);

  // // 获取语言
  // let language = navigator.language || navigator.userLanguage;

  // // 使用HTML5 Canvas指纹
  // let canvas = document.createElement("canvas");
  // let ctx = canvas.getContext("2d");
  // ctx.font = "32px Arial";
  // ctx.fillText("Hello, world!", 10, 50);
  // let canvasFingerprint = canvas.toDataURL();

  // let encryptor = new JSEncrypt(); // 创建加密对象实例
  // encryptor.setPublicKey(pubKey);
  // let rsaPassWord = JSON.stringify({
  //   userAgent: userAgent,
  //   screenResolution: screenResolution,
  //   colorDepth: colorDepth,
  //   fontList: fontList,
  //   language: language,
  //   canvasFingerprint: canvasFingerprint,
  //   appid: appid,
  // });

  // 返回一个包含所有信息的JSON字符串
  return "";
};
