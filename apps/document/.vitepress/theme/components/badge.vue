<script setup lang="ts">
defineProps<{
  text?: string
  type?: 'info' | 'tip' | 'warning' | 'danger'
}>()
</script>

<template>
  <span class="VPBadge" :class="type ?? 'tip'">
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
.VPBadge {
  display: inline-block;
  padding: 0 8px;
  margin-left: 2px;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  border: 1px solid transparent;
  border-radius: 10px;
  transform: translateY(-2px);
}

h1 .VPBadge,
h2 .VPBadge,
h3 .VPBadge,
h4 .VPBadge,
h5 .VPBadge,
h6 .VPBadge {
  vertical-align: top;
}

h2 .VPBadge {
  line-height: 20px;
  border-radius: 11px;
}

.VPBadge.info {
  color: var(--vp-badge-info-text);
  background-color: var(--vp-badge-info-bg);
  border-color: var(--vp-badge-info-border);
}

.VPBadge.tip {
  color: var(--vp-badge-tip-text);
  background-color: var(--vp-badge-tip-bg);
  border-color: var(--vp-badge-tip-border);
}

.VPBadge.warning {
  color: var(--vp-badge-warning-text);
  background-color: var(--vp-badge-warning-bg);
  border-color: var(--vp-badge-warning-border);
}

.VPBadge.danger {
  color: var(--vp-badge-danger-text);
  background-color: var(--vp-badge-danger-bg);
  border-color: var(--vp-badge-danger-border);
}
</style>
