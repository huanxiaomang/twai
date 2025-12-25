<script setup lang="ts">
import { ref, computed } from "vue";
import type { TweetItem } from "@/types";
import { useUserStore } from "@/stores/user";
import { format, parseISO, isToday, isYesterday, isSameYear } from "date-fns";
import {
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Download,
  Check,
} from "lucide-vue-next";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import MentionLink from "@/components/MentionLink.vue";

const props = defineProps<{
  item: TweetItem;
  isSelected?: boolean;
}>();

const store = useUserStore();
const isFolded = ref(true);
const isCopied = ref(false);
const maxChars = 800;

const isStarred = computed(() => {
  const feedId = store.curr_feed?.feed_id;
  return feedId && store.starred_items[feedId]?.includes(props.item.tw_id);
});

const shouldFold = computed(() => (props.item.content?.length || 0) > maxChars);

const displayContent = computed(() => {
  // Determine which content to show based on translation setting
  let content: string;
  if (!store.auto_translate_chinese && props.item.is_translated) {
    // Show original if translation is disabled and item is translated
    content = props.item.originText || props.item.content;
  } else {
    // Otherwise show the (possibly translated) content
    content = props.item.content;
  }

  if (isFolded.value && shouldFold.value) {
    return content?.substring(0, maxChars) + "...";
  }
  return content;
});

const parsedContentParts = computed(() => {
  const text = displayContent.value || "";
  const parts = [];
  const regex = /(@\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }
    parts.push({
      type: "mention",
      content: match[0],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  return parts;
});

const formattedDate = computed(() => {
  try {
    const date = parseISO(props.item.date_published);
    const now = new Date();

    if (isToday(date)) {
      return `今天 ${format(date, "HH:mm")}`;
    }
    if (isYesterday(date)) {
      return `昨天 ${format(date, "HH:mm")}`;
    }
    if (isSameYear(date, now)) {
      return format(date, "MM-dd HH:mm");
    }
    return format(date, "yyyy-MM-dd HH:mm");
  } catch (e) {
    return props.item.date_published;
  }
});

const toggleStar = (e: Event) => {
  e.stopPropagation();
  store.toggleStarred(props.item);
};

const openTwitter = (e: Event) => {
  e.stopPropagation();
  if (props.item.url) {
    window.open(props.item.url, "_blank");
  }
};

const copyToClipboard = async (e: Event) => {
  e.stopPropagation();
  // Copy the currently displayed content
  const text = displayContent.value || "";
  try {
    await navigator.clipboard.writeText(text);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};

const showPrompt = ref(false);
const dontShowAgain = ref(false);
const pendingVideoUrl = ref("");

const handleVideoDownload = (url: string) => {
  if (!store.show_video_download_prompt) {
    executeVideoDownload(url);
    return;
  }
  pendingVideoUrl.value = url;
  showPrompt.value = true;
};

const executeVideoDownload = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    window.open("https://savetwitter.net/en", "_blank");
  } catch (err) {
    console.error("Failed to copy URL:", err);
  }
};

const confirmDownload = () => {
  if (dontShowAgain.value) {
    store.setVideoDownloadPrompt(false);
  }
  showPrompt.value = false;
  executeVideoDownload(pendingVideoUrl.value);
};
</script>

<template>
  <div
    :id="`post-${item.tw_id}`"
    :class="
      cn(
        'group flex gap-3 p-4 sm:p-5 transition-all duration-300 border-b last:border-b-0 hover:bg-muted/20',
        isSelected && 'bg-primary/5 ring-1 ring-inset ring-primary/10'
      )
    "
  >
    <!-- Left: Avatar -->
    <div class="shrink-0 pt-1">
      <div class="block transition-transform hover:scale-105 active:scale-95">
        <Avatar class="h-10 w-10 border border-border/50 shadow-sm">
          <AvatarImage
            v-if="item.author.author_favicon"
            :src="item.author.author_favicon"
            :alt="item.author.author_name"
          />
          <AvatarFallback class="text-[10px] font-bold">{{
            (item.author.author_name || "TW").substring(0, 2).toUpperCase()
          }}</AvatarFallback>
        </Avatar>
      </div>
    </div>

    <!-- Right: Content Card -->
    <div class="flex-1 min-w-0 space-y-2">
      <!-- Header -->
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 flex items-center gap-1.5 flex-wrap">
          <span
            class="font-bold text-[15px] text-foreground truncate hover:underline decoration-1 underline-offset-2"
          >
            {{ item.author.author_name || "未知作者" }}
          </span>
          <span
            v-if="item.is_rt"
            class="text-[10px] bg-muted px-1 rounded text-muted-foreground"
          >
            转发自 {{ item.authors?.[0]?.name }}
          </span>
          <span class="text-muted-foreground/60 text-xs">·</span>
          <span class="text-xs text-muted-foreground/70 whitespace-nowrap">
            {{ formattedDate }}
          </span>
        </div>

        <div class="flex items-center gap-0.5 shrink-0 -mr-2 -mt-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  @click="copyToClipboard"
                >
                  <Check v-if="isCopied" class="h-4 w-4 text-green-500" />
                  <Copy v-else class="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ isCopied ? "已复制" : "复制内容" }}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 rounded-full transition-colors"
                  :class="
                    isStarred
                      ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10'
                      : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10'
                  "
                  @click="toggleStar"
                >
                  <Star :class="cn('h-4 w-4', isStarred && 'fill-current')" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{{ isStarred ? "取消收藏" : "添加收藏" }}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
              >
                <MoreHorizontal class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="openTwitter">
                <ExternalLink class="mr-2 h-4 w-4" />
                <span>在 Twitter 查看</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="copyToClipboard">
                <Copy class="mr-2 h-4 w-4" />
                <span>复制内容</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Body -->
      <div
        class="text-[15px] text-foreground/90 leading-normal tracking-normal wrap-break-word font-normal"
      >
        <template v-for="(part, index) in parsedContentParts" :key="index">
          <span v-if="part.type === 'text'">{{ part.content }}</span>
          <MentionLink v-else :username="part.content" :with-at="true" />
        </template>
      </div>

      <!-- Fold Toggle -->
      <Button
        v-if="shouldFold"
        variant="ghost"
        size="sm"
        @click="isFolded = !isFolded"
        class="h-7 px-2 text-[13px] text-primary hover:bg-primary/10 -ml-2 font-semibold"
      >
        <component
          :is="isFolded ? ChevronDown : ChevronUp"
          class="mr-1 h-3.5 w-3.5"
        />
        {{ isFolded ? "展开全文" : "收起" }}
      </Button>

      <!-- Media -->
      <div
        v-if="item.media && item.media.length > 0"
        class="grid gap-2 mt-3 rounded-2xl overflow-hidden border border-border/40 bg-muted/10"
        :class="{
          'grid-cols-2': item.media.length >= 2,
        }"
      >
        <div
          v-for="(m, idx) in item.media"
          :key="idx"
          class="relative group/media overflow-hidden group"
          :class="{
            'aspect-square': item.media.length >= 2,
            'aspect-auto': item.media.length === 1,
          }"
        >
          <img
            :src="m.url"
            class="w-full h-full object-cover max-h-[512px]"
            loading="lazy"
          />
          <div
            v-if="m.type === 'video'"
            class="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors"
          >
            <!-- Video Download Button -->
            <Button
              variant="secondary"
              size="sm"
              class="absolute bottom-2 right-2 h-8 gap-1.5 bg-background/80 backdrop-blur-md hover:bg-background shadow-sm border-none"
              @click.stop="handleVideoDownload(item.url)"
            >
              <Download class="h-3.5 w-3.5" />
              <span class="text-[11px] font-bold">下载视频</span>
            </Button>
          </div>

          <!-- Image Badge -->
          <div
            v-if="m.type === 'image'"
            class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-background/60 backdrop-blur-md text-[10px] font-bold pointer-events-none select-none text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            仅图片
          </div>
        </div>
      </div>

      <!-- Footer: Tags -->
      <div v-if="item.tags?.length" class="flex flex-wrap gap-2 pt-1">
        <Badge
          v-for="tag in item.tags"
          :key="tag"
          variant="secondary"
          class="text-[11px] font-medium bg-muted/40 text-muted-foreground/80 hover:bg-muted/60 hover:text-primary transition-all border-none px-2 py-0"
        >
          #{{ tag }}
        </Badge>
      </div>
    </div>
  </div>

  <!-- Video Download Prompt Dialog -->
  <div
    v-if="showPrompt"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    @click="showPrompt = false"
  >
    <div
      class="w-full max-w-[320px] bg-background rounded-2xl shadow-2xl border p-6 space-y-4 animate-in zoom-in-95 duration-200"
      @click.stop
    >
      <div class="space-y-2">
        <h3 class="text-base font-bold">下载提示</h3>
        <p class="text-sm text-muted-foreground leading-relaxed">
          本网站暂不支持视频下载。我们将为您复制 URL，您可以跳转至
          <span class="text-primary font-medium">savetwitter.net</span> 下载。
        </p>
      </div>

      <div class="flex items-center gap-2 py-1">
        <input
          type="checkbox"
          id="dontShowAgain"
          v-model="dontShowAgain"
          class="h-4 w-4 rounded border-muted-foreground/30 text-primary focus:ring-primary"
        />
        <label
          for="dontShowAgain"
          class="text-xs text-muted-foreground cursor-pointer select-none"
        >
          不再提醒
        </label>
      </div>

      <div class="flex gap-2">
        <Button
          variant="outline"
          class="flex-1 h-10 rounded-xl"
          @click="showPrompt = false"
        >
          取消
        </Button>
        <Button
          class="flex-1 h-10 rounded-xl font-bold"
          @click="confirmDownload"
        >
          确定
        </Button>
      </div>
    </div>
  </div>
</template>
