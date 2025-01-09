<template>
    <div>
        <h3>{{ p.title }}</h3>
        <p v-for="line in p.content.split('\n')">{{ line }}</p>
        <button type="button" @click="e('close')">{{ p.button || 'OK' }}</button>
    </div>
</template>

<script setup lang="ts">
const p = defineProps<{
    title: string,
    content: string,
    button?: string
}>()

const e = defineEmits<{
    close: []
}>()
</script>