<script setup lang="ts">
import type { ScrollAreaRootProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { ref, watch } from "vue";
import { ScrollAreaCorner, ScrollAreaRoot, ScrollAreaViewport } from "reka-ui";
import { cn } from "@/lib/utils";
import ScrollBar from "./ScrollBar.vue";

const props = defineProps<
  ScrollAreaRootProps & { class?: HTMLAttributes["class"] }
>();
const emit = defineEmits<{
  (e: "scroll-area-viewport-ref", el: HTMLElement): void;
}>();

const delegatedProps = reactiveOmit(props, "class");
const viewportRef = ref<any>();

watch(viewportRef, (val) => {
  if (val?.$el) {
    emit("scroll-area-viewport-ref", val.$el);
  } else if (val instanceof HTMLElement) {
    emit("scroll-area-viewport-ref", val);
  }
});
</script>

<template>
  <ScrollAreaRoot
    data-slot="scroll-area"
    v-bind="delegatedProps"
    :class="cn('relative', props.class)"
  >
    <ScrollAreaViewport
      ref="viewportRef"
      data-slot="scroll-area-viewport"
      class="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 scroll-smooth"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
