<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    username?: string;
    className?: string;
    withAt?: boolean;
  }>(),
  {
    withAt: false,
  }
);

const cleanUsername = computed(() => {
  if (!props.username) return "未知作者";
  return props.username.startsWith("@")
    ? props.username.substring(1)
    : props.username;
});

const url = computed(() => `https://x.com/${cleanUsername.value}`);
</script>

<template>
  <a
    :href="url"
    target="_blank"
    @click.stop
    :class="
      cn(
        'text-primary cursor-pointer font-medium hover:underline decoration-primary/30 underline-offset-4 transition-all',
        className
      )
    "
  >
    <template v-if="withAt">@</template>{{ cleanUsername }}
  </a>
</template>
