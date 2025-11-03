<script setup lang="ts">
  import { config } from 'zod';
  import { pt } from 'zod/locales';

  if (import.meta.client) {
    config(pt());
  }
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
