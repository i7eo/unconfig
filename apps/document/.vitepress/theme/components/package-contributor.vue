<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()
const contributors = ref<any[]>([])

onMounted(async () => {
  const result = (await import('@unconfig/github/dist/contributor.json'))
    .default as any
  contributors.value = result[frontmatter.value.packagePath]
})
</script>

<template>
  <section v-if="contributors.length > 0">
    <h2>贡献者</h2>
    <div class="flex flex-wrap gap-4">
      <div
        v-for="contributor of contributors"
        :key="contributor.login"
        class="flex gap-2 items-center"
      >
        <a
          :href="`https://github.com/${contributor.login}`"
          rel="noreferrer"
          target="_blank"
        >
          <img :src="contributor.avatar" class="w-10 h-10 rounded-full" />
        </a>
        {{ contributor.login }}
      </div>
    </div>
  </section>
</template>
