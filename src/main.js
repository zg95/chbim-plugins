import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { ChbimPlugins } from "./components/chbim-plugins"; //导入

const app = createApp(App);
app.use(ChbimPlugins); //注册
app.mount("#app");
