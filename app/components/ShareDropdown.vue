<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { toast } from 'vue-sonner';
import type { Memory } from '~/types/app';

const props = defineProps<{ memory: Memory }>();
const isOpen = ref(false);
const dropdown = ref(null);
onClickOutside(dropdown, () => isOpen.value = false);

const memoryLink = computed(() => `${window.location.origin}/memories/${props.memory.id}`);
const shareText = computed(() => `Veja esta memória: ${props.memory.title}`);

function copyLink() {
  navigator.clipboard.writeText(memoryLink.value);
  toast.success('Link copiado para a área de transferência!');
  isOpen.value = false;
}
</script>

<template>
  <div class="share-container" ref="dropdown">
    <button @click="isOpen = !isOpen" class="action-btn">
      <Icon name="lucide:share-2" /> Compartilhar
    </button>
    <div v-if="isOpen" class="dropdown-content">
      <button @click="copyLink"><Icon name="lucide:link"/><span>Copiar link</span></button>
      <button @click="copyLink"><Icon name="lucide:repeat"/> Repostar</button>
      <button :to="`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + memoryLink)}`" target="_blank"><Icon name="lucide:message-circle"/>WhatsApp</button>
      <button :to="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memoryLink)}`" target="_blank"><Icon name="lucide:facebook"/>Facebook</button>
      <button :to="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memoryLink)}`" target="_blank"><Icon name="lucide:twitter"/>Twitter</button>
    </div>
  </div>
</template>

<style scoped>
.share-container {
  position: relative;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  height: 2.25rem;
  padding: 0 .75rem;
  border: none;
  cursor: pointer;
  color: hsl(var(--muted-foreground));
  background: none;
  font-weight: 500;
  border-radius: var(--radius);
}
.action-btn:hover {
  color: hsl(var(--accent-foreground));
  background-color: hsl(var(--muted));
}
.action-btn .iconify {
  width: 1rem;
  height: 1rem;
}
.dropdown-content {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: max-content;
  min-width: 10rem;
  padding: 0.25rem;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  z-index: 50;
  animation: enter 0.2s ease-out;
}
.dropdown-content > button,
.dropdown-content > a {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  text-align: left;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: calc(var(--radius) - 4px);
}
.dropdown-content > button:hover,
.dropdown-content > a:hover {
  background-color: hsl(var(--muted));
  color: hsl(var(--accent-foreground));
}
</style>
