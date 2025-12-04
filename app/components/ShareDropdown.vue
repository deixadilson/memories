<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { toast } from 'vue-sonner';
import type { MemoryWithAuthor } from '~/types/app';

const props = defineProps<{ memory: MemoryWithAuthor }>();

const isOpen = ref(false);
const dropdown = ref(null);
const user = useSupabaseUser();
const { profile: loggedInUserProfile } = useProfile();

const isOwner = computed(() => user.value?.sub === props.memory.user_id);

const memoryLink = computed(() => {
  const username = Array.isArray(props.memory.profiles) 
  ? props.memory.profiles[0]?.username 
  : props.memory.profiles?.username;
  return `${window.location.origin}/@${username}/memory/${props.memory.id}`;
});

const shareText = computed(() => {
  const sharerName = loggedInUserProfile.value?.full_name || loggedInUserProfile.value?.username || 'Alguém';
  const authorProfile = Array.isArray(props.memory.profiles) ? props.memory.profiles[0] : props.memory.profiles;
  const authorName = authorProfile?.full_name || authorProfile?.username || 'um usuário';
  const text = `${sharerName} quer compartilhar uma memória de ${authorName} com você: ${props.memory.title}.`;
  return text;
});

onClickOutside(dropdown, () => isOpen.value = false);

function copyLink() {
  navigator.clipboard.writeText(memoryLink.value);
  toast.success('Link copiado para a área de transferência!');
  isOpen.value = false;
}

function repostMemory() {
  if (props.memory.visibility !== 'public') {
    toast.error("Apenas memórias públicas podem ser repostadas.");
    return;
  }
  if (isOwner.value) {
    toast.error("Você não pode repostar sua própria memória.");
    return;
  }
  toast.info('A funcionalidade de repostar ainda não foi implementada.');
  isOpen.value = false;
}

function openShareWindow(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
  isOpen.value = false;
}

function shareToWhatsApp() {
  const url = `https://wa.me/?text=${encodeURIComponent(shareText.value + ' ' + memoryLink.value)}`;
  openShareWindow(url);
}

function shareToFacebook() {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memoryLink.value)}`;
  openShareWindow(url);
}

function shareToTwitter() {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(memoryLink.value)}`;
  openShareWindow(url);
}
</script>

<template>
  <div class="share-container" ref="dropdown">
    <button @click="isOpen = !isOpen" class="action-btn">
      <Icon name="lucide:share-2" /> Compartilhar
    </button>
    <div v-if="isOpen" class="dropdown-content">
      <button @click="copyLink"><Icon name="lucide:link"/><span>Copiar link</span></button>
      <button @click="repostMemory"><Icon name="lucide:repeat"/> Repostar</button>
      <button @click="shareToWhatsApp"><Icon name="mdi:whatsapp"/> WhatsApp</button>
      <button @click="shareToFacebook"><Icon name="lucide:facebook"/> Facebook</button>
      <button @click="shareToTwitter"><Icon name="lucide:twitter"/> Twitter</button>
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
.dropdown-content > button {
  display: flex;
  justify-content: left;
  width: 100%;
}
.dropdown-content > button:hover {
  background-color: hsl(var(--muted));
  color: hsl(var(--accent-foreground));
}
</style>
