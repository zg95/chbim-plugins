<script lang="ts">
export default {
  name: "MapModali",
};
</script>

<template>
  <div id="modal-container" :class="animation" @click="hide">
    <div class="modal-background">
      <div
        class="modal"
        @click="
          (ev) => {
            ev.stopPropagation();
          }
        "
      >
        <p
          style="white-space: pre-line; line-height: 1; margin: 0; color: #fff"
          v-html="text"
        ></p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
defineProps({
  // text: {
  //   type: String,
  //   default: "CHBIM云平台",
  // },
});
const animation = ref("" as any);
const text = ref("" as any);
const show = (content) => {
  text.value = content;
  animation.value = "five";
};

const hide = () => {
  animation.value = animation.value + " out";
};

onMounted(() => {});

defineExpose({
  text,
  show,
  hide,
});
</script>
