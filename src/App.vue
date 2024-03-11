<template>
  <MukButton size="large" type="primary" @click="handleOpenUserDialog"
    >我是测试组件</MukButton
  >
  <MukButton size="large" type="primary" @click="handleOpenUserDialog2"
    >我是测试组件2</MukButton
  >

  <BimCutscenes ref="cutscenes"></BimCutscenes>
  <MapModali ref="mapModali"></MapModali>

  <BimBackgroundPlate> CHBIM 云平台 </BimBackgroundPlate>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
let { proxy }: { proxy: any } = getCurrentInstance() as any;
const cutscenes: any = ref(null);
const mapModali: any = ref(null);
const bimBackgroundPlate: any = ref(null);

const handleOpenUserDialog = () => {
  proxy.$loading.continuation();
};
const handleOpenUserDialog2 = () => {
  proxy.$mapModali.show("111");
};
</script>

<style scoped></style>
