<script lang="ts">
export default {
  name: "BimCutscenes",
};
</script>

<template>
  <div class="mask js-mask">
    <div class="mask__slice js-mask__slice"></div>
    <div class="mask__slice js-mask__slice"></div>
    <div class="mask__slice js-mask__slice"></div>
    <div class="mask__inner">
      <figure class="logo logo--mask">
        <p class="js-logo" style="color: #fff">{{ text }}</p>
      </figure>
      <div class="mask-line js-mask-line">
        <div class="mask-line__inner js-mask-line"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Transition from "./js/script";
import { onMounted, ref } from "vue";
/**
 *
 * @param text '配置文本'
 */
defineProps({
  text: {
    type: String,
    default: "CHBIM云平台",
  },
});
const transition = ref(null as any);
const init = () => {
  if (transition.value === null) transition.value = new Transition();
};
const continuation = () => {
  init();
  transition.value.continuation();
};

onMounted(() => {
  init();
});

defineExpose({
  continuation,
});
</script>
