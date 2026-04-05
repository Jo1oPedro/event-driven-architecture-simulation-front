<script setup lang="ts">
const emit = defineEmits<{
  save: [],
  clear: []
}>()
</script>

<template>
  <div class="flex gap-2 p-3 bg-base-200 rounded-lg shadow-md">
    <button class="btn btn-sm btn-primary" @click="emit('save')">
      Save
    </button>
    <button class="btn btn-sm btn-error btn-outline" @click="emit('clear')">
      Clear
    </button>
    <button class="btn btn-sm btn-accent" disabled>
      Simulate
    </button>
  </div>
</template>

<style scoped>

</style>
