<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import type { Profile, FriendshipStatus } from '~/types/app';

const props = defineProps<{
  user: Profile;
  status: FriendshipStatus;
  actingUserId: string | null;
}>();

const emit = defineEmits(['action']);

const loading = computed(() => props.actingUserId === props.user.id);
const isMenuOpen = ref(false);
const menu = ref(null);
onClickOutside(menu, () => isMenuOpen.value = false);
</script>

<template>
  <div class="user-item">
    <div class="user-info">
      <div class="avatar-container">
        <img
          v-if="user.avatar_url"
          :src="user.avatar_url"
          alt="Avatar"
          class="avatar-image"
        />
        <div v-else class="avatar-fallback">
          <span>{{ user.username.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
      <div>
        <NuxtLink :to="`/${user.username}`" class="username-link">
          <p class="username">{{ user.username }}</p>
        </NuxtLink>
        <p v-if="status in(['follower_only','mutual'])" class="status-text">Segue você</p>
        <p v-if="status === 'blocked'" class="status-text">Bloqueado</p>
      </div>
    </div>
    <div class="actions-container">
      <div class="main-action">
        <button v-if="status === 'not_friends'" @click="emit('action', 'follow')" class="btn primary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          <Icon v-else name="lucide:user-plus" /> Seguir
        </button>
        <button v-else-if="status === 'follower_only'" @click="emit('action', 'follow')" class="btn primary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          <Icon v-else name="lucide:repeat" /> Seguir de Volta
        </button>
        <div v-else-if="status === 'request_received'" class="action-group" :disabled="loading">
          <button @click="emit('action', 'accept')" class="btn primary">
            <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
            <Icon v-else name="lucide:user-check" /> Aceitar
          </button>
          <button @click="emit('action', 'reject')" class="btn secondary" :disabled="loading">
            <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
            <Icon v-else name="lucide:user-x" /> Rejeitar
          </button>
        </div>
        <button v-else-if="status === 'blocked'" @click="emit('action', 'unblock')" class="btn secondary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          <Icon v-else name="lucide:circle-off" /> Desbloquear
        </button>
        <button v-else-if="status === 'request_sent'" class="btn secondary" disabled>
          <Icon name="lucide:clock"/> Solicitado
        </button>
        <button v-else-if="status === 'following'" class="btn secondary" disabled>
          <Icon name="lucide:user-check" /> Seguindo
        </button>
      </div>
      <div class="more-options" ref="menu">
        <button v-if="status !== 'blocked'" @click="isMenuOpen = !isMenuOpen" class="menu-btn" title="Mais opções">
          <Icon name="lucide:more-vertical" />
        </button>
        <div v-if="isMenuOpen" class="dropdown-content">
          <button v-if="status === 'following'" @click="emit('action', 'unfollow'); isMenuOpen = false;">
            <Icon name="lucide:user-minus" /> Deixar de seguir
          </button>
          <button v-if="status === 'request_sent'" @click="emit('action', 'cancel_request'); isMenuOpen = false;">
            <Icon name="lucide:user-x" /> Cancelar solicitação
          </button>
          <button @click="emit('action', 'block'); isMenuOpen = false;">
            <Icon name="lucide:shield-x" /> Bloquear usuário
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}
.user-item:hover {
  background-color: hsl(var(--background));
}
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.avatar-container {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--gold));
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}
.username {
  font-weight: 500;
}
.username-link {
  text-decoration: none;
  color: inherit;
}
.username-link:hover .username {
  color: hsl(var(--foreground));
}
.status-text {
  font-size: .75rem;
  color: hsl(var(--muted-foreground));
}
.action-group { display: flex; gap: .5rem; }
.actions-container {
  display: flex; align-items: center; gap: .5rem;
}
.destructive {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}
.destructive:hover {
  background-color: hsl(var(--destructive) / .9);
}
.more-options { position: relative; }
.menu-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
}
.menu-btn:hover { background-color: hsl(var(--muted)); }
.dropdown-content {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: max-content;
  padding: 0.5rem;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 10;
}
.dropdown-content button {
  display: flex; align-items: center; justify-content: flex-start; gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: calc(var(--radius) - 4px);
}
.dropdown-content button:hover {
  background-color: hsl(var(--muted));
}
.dropdown-content .iconify {
  color: hsl(var(--destructive));
}
</style>
