<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Plus, Trash2, User, Cpu, Rss } from "lucide-vue-next";
import { ref } from "vue";
import { toast } from "vue-sonner";

const store = useUserStore();

const newFeedUrl = ref("");

const addFeed = () => {
  if (!newFeedUrl.value) return;

  if (store.subscribe_feed_url.includes(newFeedUrl.value)) {
    toast.error("该订阅源已存在");
    return;
  }

  store.subscribe_feed_url.push(newFeedUrl.value);
  newFeedUrl.value = "";
  store.save();
  toast.success("订阅源添加成功");
};

const removeFeed = (index: number) => {
  const url = store.subscribe_feed_url[index];
  toast(`确定要删除订阅源吗？`, {
    description: url,
    action: {
      label: "确认删除",
      onClick: () => {
        store.subscribe_feed_url.splice(index, 1);
        store.save();
        toast.success("已成功删除订阅源");
      },
    },
  });
};

// Automatic saving for all state changes
store.$subscribe(
  () => {
    store.save();
  },
  { deep: true }
);
</script>

<template>
  <div class="h-full w-full overflow-y-auto bg-background">
    <div
      class="container max-w-2xl py-12 px-6 space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">设置</h1>
        <p class="text-sm text-muted-foreground">
          管理您的账户设置和 AI 配置。
        </p>
      </div>

      <form @submit.prevent class="space-y-12">
        <FieldGroup>
          <FieldSet>
            <div class="flex items-center gap-1.5">
              <User class="w-4 h-4 text-muted-foreground" />
              <span class="text-lg font-bold tracking-tight flex items-center"
                >用户信息</span
              >
            </div>
            <FieldGroup class="mt-1">
              <Field>
                <FieldLabel for="settings-name">Name</FieldLabel>
                <Input
                  id="settings-name"
                  v-model="store.user.name"
                  placeholder="您的姓名"
                />
              </Field>
              <Field>
                <FieldLabel for="settings-email">Email</FieldLabel>
                <Input
                  id="settings-email"
                  v-model="store.user.email"
                  type="email"
                  placeholder="您的邮箱"
                />
              </Field>
              <Field>
                <FieldLabel for="settings-avatar">头像链接</FieldLabel>
                <Input
                  id="settings-avatar"
                  v-model="store.user.avatar"
                  placeholder="https://..."
                />
                <FieldDescription> 仅支持直接图片链接。 </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <div class="flex items-center gap-1.5">
              <Cpu class="w-4 h-4 text-muted-foreground" />
              <span class="text-lg font-bold tracking-tight">AI配置</span>
            </div>
            <FieldGroup class="mt-1">
              <Field>
                <FieldLabel for="settings-model">模型</FieldLabel>
                <Input
                  id="settings-model"
                  v-model="store.ai_config.model"
                  placeholder="gpt-4o"
                />
              </Field>
              <Field>
                <FieldLabel for="settings-endpoint">接口地址</FieldLabel>
                <Input
                  id="settings-endpoint"
                  v-model="store.ai_config.end_point"
                  placeholder="https://api.openai.com/v1"
                />
              </Field>
              <Field>
                <FieldLabel for="settings-api-key">API Key</FieldLabel>
                <Input
                  id="settings-api-key"
                  v-model="store.ai_config.api_key"
                  type="password"
                  placeholder="sk-..."
                />
                <FieldDescription>
                  您的 API Key 已加密并存储在本地。
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <div class="flex items-center gap-1.5">
              <Rss class="w-4 h-4 text-muted-foreground" />
              <span class="text-lg font-bold tracking-tight">订阅源</span>
            </div>
            <FieldGroup class="mt-1">
              <div class="flex gap-2">
                <Input
                  v-model="newFeedUrl"
                  placeholder="输入订阅源链接..."
                  @keyup.enter="addFeed"
                />
                <Button
                  @click="addFeed"
                  variant="secondary"
                  size="sm"
                  class="shrink-0"
                >
                  <Plus class="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>

              <div class="space-y-2 mt-2">
                <div
                  v-for="(url, index) in store.subscribe_feed_url"
                  :key="url"
                  class="flex items-center justify-between p-3 rounded-md border bg-muted/30 group/item transition-colors hover:bg-muted/50"
                >
                  <span class="text-sm truncate pr-4">{{ url }}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="removeFeed(index)"
                    class="h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
                <div
                  v-if="store.subscribe_feed_url.length === 0"
                  class="py-8 text-center border border-dashed rounded-md bg-muted/10"
                >
                  <p class="text-xs text-muted-foreground italic">
                    暂无订阅源。
                  </p>
                </div>
              </div>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>

      <div
        class="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/60 pt-4"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.h-full::-webkit-scrollbar {
  width: 4px;
}
.h-full::-webkit-scrollbar-track {
  background: transparent;
}
.h-full::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 10px;
}
</style>
