<template>
    <button title="Celá obrazovka" @click="toggleLock">
        {{ locked ? '⇲' : '⛶' }}
    </button>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const p = defineProps<{
    root: HTMLElement | undefined
}>()

const canRotate = ref(false)
const locked = ref((screen.orientation.type?.startsWith('portrait') && screen.availHeight < screen.availWidth) || (screen.orientation.type?.startsWith('landscape') && screen.availWidth < screen.availHeight))

onMounted(() => {
    if ((screen.orientation as any).lock && window.DeviceOrientationEvent)
        window.addEventListener('deviceorientation', orientationChange)
})

function orientationChange(_: DeviceOrientationEvent) {
    canRotate.value = true
    window.removeEventListener('deviceorientation', orientationChange)
}

function toggleLock() {
    if (locked.value) {
        if (screen.orientation.unlock) {
            screen.orientation.unlock()
        }
        document.exitFullscreen()
        locked.value = false
    }
    else {
        if (p.root) {
            p.root.requestFullscreen({ navigationUI: 'hide' }).then(() => {
                (screen.orientation as any).lock(screen.orientation.type)
                locked.value = true
            })
        }
    }
}
</script>