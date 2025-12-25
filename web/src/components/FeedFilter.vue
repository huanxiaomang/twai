<script setup lang="ts">
import { ref, computed, type Ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Tag } from "@/components/ui/tag";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/stores/user";
import { cn } from "@/lib/utils";
import {
  DateFormatter,
  getLocalTimeZone,
  today,
  parseDate,
  type DateValue,
} from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const store = useUserStore();
const emit = defineEmits(["wrap-change"]);

const containerRef = ref<HTMLElement | null>(null);
const timeSectionRef = ref<HTMLElement | null>(null);
const tagsSectionRef = ref<HTMLElement | null>(null);
const isWrapped = ref(false);

useResizeObserver(containerRef, () => {
  if (timeSectionRef.value && tagsSectionRef.value) {
    const wrapped =
      Math.abs(
        timeSectionRef.value.offsetTop - tagsSectionRef.value.offsetTop
      ) > 10;
    if (isWrapped.value !== wrapped) {
      isWrapped.value = wrapped;
      emit("wrap-change", wrapped);
    }
  }
});

const activeMode = ref<"tabs" | "picker">("tabs");

const tags = computed(() =>
  store.tagsInfo.map((t) => ({
    id: t.tag_id,
    label: t.tag_name,
    count: t.tag_count,
  }))
);

const selectedTags = computed({
  get: () => store.curr_tags,
  set: (val) => store.setCurrTags(val),
});

const isAllSelected = computed(
  () => tags.value.length > 0 && selectedTags.value.length === tags.value.length
);

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedTags.value = [];
  } else {
    selectedTags.value = tags.value.map((t) => t.id);
  }
};

const toggleTag = (tagId: string) => {
  const newTags = [...selectedTags.value];
  const index = newTags.indexOf(tagId);
  if (index === -1) {
    newTags.push(tagId);
  } else {
    newTags.splice(index, 1);
  }
  selectedTags.value = newTags;
};

const isTagActive = (tagId: string) => selectedTags.value.includes(tagId);

// Date Picker Logic
const defaultPlaceholder = today(getLocalTimeZone());
const date = ref() as Ref<DateValue>;
const df = new DateFormatter("zh-CN", {
  dateStyle: "long",
});

// Sync with store
watch(
  () => store.date_range,
  (newVal) => {
    if (["all", "starred", "last_day", "last_week"].includes(newVal)) {
      activeMode.value = "tabs";
    } else if (newVal) {
      activeMode.value = "picker";
      try {
        date.value = parseDate(newVal);
      } catch (e) {
        console.error("Failed to parse date:", newVal);
      }
    }
  },
  { immediate: true }
);

const handleTabChange = (val: string | number) => {
  activeMode.value = "tabs";
  store.setDateRange(val as any);
};

const handleDateChange = (val: DateValue | undefined) => {
  if (val) {
    activeMode.value = "picker";
    const dateStr = val.toString();
    store.setDateRange(dateStr);
  }
};
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 bg-background border-b"
  >
    <!-- Time Range Section -->
    <div ref="timeSectionRef" class="flex items-center gap-3 shrink-0">
      <span class="text-xs font-medium text-muted-foreground">筛选</span>
      <div class="flex items-center gap-3">
        <!-- Tabs -->
        <div
          :class="
            cn(
              'transition-opacity duration-200 hover:opacity-100',
              activeMode === 'tabs' ? 'opacity-100' : 'opacity-60'
            )
          "
        >
          <Tabs
            :model-value="activeMode === 'tabs' ? store.date_range : ''"
            @update:model-value="handleTabChange"
            class="h-8 mb-[-4px]"
          >
            <TabsList class="h-7 p-0.5 bg-muted/50">
              <TabsTrigger
                value="all"
                class="h-6 px-3 text-filter data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
                >全部</TabsTrigger
              >
              <TabsTrigger
                value="starred"
                class="h-6 px-3 text-filter data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                收藏
              </TabsTrigger>
              <TabsTrigger
                value="last_day"
                class="h-6 px-3 text-filter data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                最近一天
                <span class="text-blue-500 text-[12px] font-bold ml-[-2px]"
                  >AI</span
                >
              </TabsTrigger>
              <!-- <TabsTrigger
                value="last_week"
                class="h-6 px-3 text-filter data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                最近一周
                <span class="text-blue-500 text-[12px] font-bold ml-[-2px]"
                  >AI</span
                >
              </TabsTrigger> -->
            </TabsList>
          </Tabs>
        </div>

        <!-- Date Picker -->
        <div
          :class="
            cn(
              'transition-opacity duration-200 hover:opacity-100',
              activeMode === 'picker' ? 'opacity-100' : 'opacity-30'
            )
          "
        >
          <Popover v-slot="{ close }">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="sm"
                :class="
                  cn(
                    'h-7 justify-start text-left font-normal text-filter px-2 gap-2 min-w-[120px]',
                    !date && 'text-muted-foreground'
                  )
                "
              >
                <CalendarIcon class="w-3 h-3" />
                {{
                  date ? df.format(date.toDate(getLocalTimeZone())) : "选择日期"
                }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <Calendar
                v-model="date"
                locale="zh-CN"
                :default-placeholder="defaultPlaceholder"
                layout="month-and-year"
                initial-focus
                @update:model-value="
                  (val) => {
                    handleDateChange(val);
                    close();
                  }
                "
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>

    <Separator
      v-if="!isWrapped"
      orientation="vertical"
      class="h-4 hidden md:block"
    />

    <!-- Tags Section -->
    <div ref="tagsSectionRef" class="flex items-center gap-2 shrink-0">
      <span class="text-xs font-medium text-muted-foreground">标签</span>
      <div class="flex flex-wrap items-center gap-3">
        <Tag
          v-for="tag in tags"
          :key="tag.id"
          :active="isTagActive(tag.id)"
          @click="toggleTag(tag.id)"
        >
          {{ tag.label }}
          <template v-if="tag.count > 0" #badge>
            <Badge
              variant="secondary"
              class="h-3.5 min-w-[14px] px-1 text-[9px] flex items-center justify-center rounded-full border-background shadow-sm translate-x-1 -translate-y-1"
            >
              {{ tag.count }}
            </Badge>
          </template>
        </Tag>
        <button
          @click="toggleAll"
          class="text-filter text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-1"
        >
          {{ isAllSelected ? "取消全部" : "选择全部" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
