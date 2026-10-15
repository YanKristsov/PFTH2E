<script setup lang="ts">
defineProps<{
  ariaLabel?: string
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="btn btn-ghost desktop:hidden"
    :aria-label="ariaLabel || 'Открыть меню'"
    aria-expanded="false"
    aria-controls="mobile-menu"
    @click="$emit('click')"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>
</template>