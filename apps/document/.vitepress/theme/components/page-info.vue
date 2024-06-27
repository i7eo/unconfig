<script setup lang="ts">
// import { computed, ref } from 'vue'
// import { useData } from 'vitepress'
// import { getDate, getFromNow } from '../utils'
import { author as _author } from '../../../package.json'

defineProps<{
  readTime: string
  words: string
}>()
// const author = ref(_author)
// const { frontmatter, page } = useData()

// if (frontmatter.value?.author) author.value = frontmatter.value?.author

// const lastUpdatedDate = computed(() => new Date(page.value.lastUpdated || new Date()))
// const isoDatetime = computed(() => lastUpdatedDate.value.toISOString())
// const timeFormNow = getFromNow(isoDatetime.value)
</script>

<template>
  <div>
    <section
      class="border-b-1 border-b-solid mb-[12px] mt-[24px] flex w-full max-w-[85%] flex-wrap gap-[12px] border-[var(--vp-c-divider)] pb-[12px]"
    >
      <!-- <div class="flex items-center gap-[4px]">
        <octicon:feed-person-16 />
        作者:<span>
          {{ author }}
        </span>
      </div> -->
      <!-- <div v-if="publishedTime" class="flex items-center gap-[4px]">
        <eos-icons:modified-date />
        发表于:<span>{{ publishedTime }}</span>
      </div> -->
      <!-- <div class="flex items-center gap-[4px]">
        <radix-icons:update />
        更新于:<span>{{ timeFormNow }}</span>
      </div> -->
      <div class="flex items-center gap-[4px]">
        <!-- <bi:file-earmark-word-fill /> -->
        <b clas="mb-4">📝</b>
        字数统计:<span>{{ words }} 字</span>
      </div>
      <div class="flex items-center gap-[4px]">
        <!-- <ooui:clock /> -->
        <b clas="mb-4">⏳</b>
        阅读时长:<span>{{ readTime }} 分钟</span>
      </div>
    </section>
  </div>
</template>
