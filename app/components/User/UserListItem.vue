<script setup lang="ts">
import type { Profile, FriendshipStatus } from '~/types/app';

defineProps<{ user: Profile; status: FriendshipStatus; }>();

const emit = defineEmits(['action']);
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
        <p v-if="status === 'follower_only'" class="status-text">Segue você</p>
      </div>
    </div>
    <div class="user-actions">
      <button v-if="status === 'not_friends'" @click="emit('action', 'follow')" class="btn primary">
        <Icon name="lucide:user-plus" /> Seguir
      </button>
      <button v-else-if="status === 'follower_only'" @click="emit('action', 'follow')" class="btn primary">
        <Icon name="lucide:repeat" /> Seguir de Volta
      </button>
      <button v-else-if="status === 'request_sent'" class="btn secondary" disabled>
        <Icon name="lucide:loader-circle" /> Solicitado
      </button>
      <div v-else-if="status === 'request_received'" class="action-group">
        <button @click="emit('action', 'accept')" class="btn primary">Aceitar</button>
        <button @click="emit('action', 'reject')" class="btn secondary">Rejeitar</button>
      </div>
      <button v-else-if="status === 'following' || status === 'mutual'" class="btn secondary">
        <Icon name="lucide:check" /> Seguindo
      </button>
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
.username { font-weight: 500; }
.username-link { text-decoration: none; color: inherit; }
.username-link:hover .username { color: hsl(var(--foreground)); }
.status-text {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}
.user-actions .btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}
.action-group { display: flex; gap: 0.5rem; }
</style>
