<script setup lang="ts">
  import { version } from '../../package.json';
</script>

<template>
  <div class="p-2">
    <h1 class="text-2xl">Hello world</h1>
    <p>template</p>
    <p>{{ version }}</p>
  </div>
</template>
