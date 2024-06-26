import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", //自定义主机名
    port: 8991, //自定义端口
    //   // 是否开启 https
    https: false,
  },
  build: {
    outDir: "chbim-plugins", //输出文件名称
    lib: {
      entry: path.resolve(__dirname, "./src/components/chbim-plugins/index.js"), //指定组件编译入口文件
      name: "chbim-plugins",
      fileName: "chbim-plugins",
      minify: "terser", // 使用terser进行混淆
      terserOptions: {
        compress: {
          // 自定义压缩选项
          drop_console: true, // 移除console语句
          drop_debugger: true, // 移除debugger语句
        },
        mangle: {
          // 自定义变量名混淆
          toplevel: true,
          properties: {
            regex: /^_/,
          },
        },
      },
    }, //库编译模式配置
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
      },
    }, // rollup打包配置
  },
});
