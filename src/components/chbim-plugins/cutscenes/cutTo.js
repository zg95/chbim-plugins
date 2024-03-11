import LoadingComponent from "./index.vue";

const cutscenes = {
  install: function (Vue) {
    // 创建一个Vue的子类组件
    console.log(Vue);

    const LoadingConstructor = Vue.extend(LoadingComponent);

    // 创建一个该子类的实例,并挂载到一个元素上
    const instance = new LoadingConstructor();

    // 将这个实例挂载到动态创建的元素上,并将元素添加到全局结构中
    instance.$mount(document.createElement("div"));
    document.body.appendChild(instance.$el);

    // 在Vue的原型链上注册方法，控制组件
    Vue.prototype.$cutscenes = {
      continuation: () => {
        instance.continuation();
      },
    };
    // 用于window中可以直接使用
    window.$cutscenes = Vue.prototype.$cutscenes;
  },
};

export default cutscenes;
