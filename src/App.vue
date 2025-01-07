<script setup lang="ts">
import { useTemplateRef } from 'vue';

const video = useTemplateRef<HTMLVideoElement>('video');
navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
  if(video.value) {
    video.value.srcObject = stream;
    video.value.play();
  }
}).catch(err => {
  alert(err);
})
</script>

<template>
  <div>
    <video ref="video">
    </video>
    <button @click=""></button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
