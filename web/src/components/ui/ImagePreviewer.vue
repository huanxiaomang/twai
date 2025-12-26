<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps<{
  urls: string[];
  modelValue: boolean;
  startIndex?: number;
}>();
const emit = defineEmits(['update:modelValue']);

const show = ref(props.modelValue);
const current = ref(props.startIndex || 0);

watch(() => props.modelValue, v => (show.value = v));
watch(show, v => emit('update:modelValue', v));
watch(() => props.startIndex, i => { if (i != null) current.value = i; });

function close() {
  show.value = false;
}
function next() {
  current.value = (current.value + 1) % props.urls.length;
}
function prev() {
  current.value = (current.value - 1 + props.urls.length) % props.urls.length;
}

function handleKey(e: KeyboardEvent) {
  if (!show.value) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
}

const largeImageUrls = computed(() => props.urls.map((url) => {
    const urlObj = new URL(url);
    urlObj.searchParams.set('name', 'large');
    return urlObj.toString();
}));


onMounted(() => window.addEventListener('keydown', handleKey));
onUnmounted(() => window.removeEventListener('keydown', handleKey));
</script>

<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="show" class="image-previewer-overlay" @click="close">
        <div class="image-previewer-bar">
          <span>{{ (current ?? 0) + 1 }} / {{ urls.length }}</span>
        </div>
        <img :src="largeImageUrls[current]" class="image-previewer-img" alt="预览图片"/>
        <button v-if="urls.length > 1" class="image-previewer-arrow left" @click="prev">‹</button>
        <button v-if="urls.length > 1" class="image-previewer-arrow right" @click="next">›</button>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.image-previewer-overlay {
  position: fixed;
  z-index: 2000;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadein .2s;
}
.image-previewer-bar {
  position: absolute;
  top: 24px;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 15px;
  z-index: 2001;
}
.image-previewer-close {
  position: absolute;
  left: 36px; top: 0;
  color: #fff;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  z-index: 2002;
}
.image-previewer-img {
  max-width: 85vw;
  max-height: 80vh;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px #1118;
  background: #222;
}
.image-previewer-arrow {
  position: absolute;
  top: 50%;
  width: 38px;
  height: 38px;
  background: rgba(30,30,30,0.35);
  border: none;
  color: #fff;
  font-size: 36px;
  line-height: 1;
  transform: translateY(-50%);
  z-index: 2003;
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
}
.image-previewer-arrow.left { left: 2vw; }
.image-previewer-arrow.right { right: 2vw; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

