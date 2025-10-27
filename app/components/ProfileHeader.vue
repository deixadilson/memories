<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import type { Profile, FriendshipStatus } from '~/types/app';

defineProps<{
  profile: Profile;
  status: FriendshipStatus | 'self';
  stats: {
    memories: number;
    followers: number;
    following: number;
  };
  loading: boolean;
}>();

const emit = defineEmits(['action']);

const isMenuOpen = ref(false);
const menu = ref(null);
onClickOutside(menu, () => isMenuOpen.value = false);
</script>

<template>
  <div class="profile-header">
    <div class="avatar-container">
      <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Avatar" class="avatar-image" />
      <div v-else class="avatar-fallback">
        <span>{{ profile.username.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
    <div class="info-container">
      <h1>{{ profile.username }}</h1>
      <div class="stats">
        <div class="stat-item"><strong>{{ stats.memories }}</strong> Memórias</div>
        <div class="stat-item"><strong>{{ stats.followers }}</strong> Seguidores</div>
        <div class="stat-item"><strong>{{ stats.following }}</strong> Seguindo</div>
      </div>
      <p v-if="profile.biography" class="bio">{{ profile.biography }}</p>
      <div class="actions">
        <NuxtLink v-if="status === 'self'" to="/dashboard/profile" class="btn secondary">
          <Icon name="lucide:pencil" /> Editar Perfil
        </NuxtLink>
        <button v-else-if="status === 'not_friends'" @click="emit('action', 'follow')" class="btn primary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          <Icon v-else name="lucide:user-plus" /> Seguir
        </button>
        <button v-else-if="status === 'follower_only'" @click="emit('action', 'follow')" class="btn primary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          <Icon v-else name="lucide:repeat" /> Seguir de Volta
        </button>
        <button v-else-if="status === 'following' || 'mutual'" class="btn secondary" disabled>
          <Icon name="lucide:user-check" /> Seguindo
        </button>
        <button v-else-if="status === 'request_sent'" class="btn secondary" disabled>
          <Icon name="lucide:clock" /> Solicitado
        </button>
        <div v-else-if="status === 'request_received'" class="action-group">
          <button @click="emit('action', 'accept')" class="btn primary" :disabled="loading">
            <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
            Aceitar
          </button>
          <button @click="emit('action', 'reject')" class="btn secondary" :disabled="loading">
            Rejeitar
          </button>
        </div>
        <button v-else-if="status === 'blocked'" @click="emit('action', 'unblock')" class="btn secondary" :disabled="loading">
          <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
          Desbloquear
        </button>

        <div v-if="status !== 'self' && status !== 'blocked'" class="more-options" ref="menu">
          <button @click="isMenuOpen = !isMenuOpen" class="menu-btn" title="Mais opções">
            <Icon name="lucide:more-vertical" />
          </button>
          <div v-if="isMenuOpen" class="dropdown-content">
            <button v-if="status === 'following'" @click="emit('action', 'unfollow'); isMenuOpen = false;">
              <Icon name="lucide:user-minus" /> Deixar de seguir
            </button>
            <button v-if="status === 'request_sent'" @click="emit('action', 'cancel_request'); isMenuOpen = false;">
              <Icon name="lucide:user-x" /> Cancelar solicitação
            </button>
            <button @click="emit('action', 'block'); isMenuOpen = false;" class="destructive">
              <Icon name="lucide:shield-x" /> Bloquear usuário
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex; flex-direction: column; align-items: center;
  padding: 2rem;
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  margin-bottom: 2rem;
}
.avatar-container {
  width: 6rem; height: 6rem;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 4px solid hsl(var(--gold));
}
.avatar-image {
  width: 100%; height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background-color: hsl(var(--gold));
  color: hsl(var(--primary-foreground));
  font-size: 3rem; font-weight: 600;
}
.info-container {
  justify-items: center;
}
.info-container h1 { font-size: 2rem; font-weight: 700; }
.stats {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  color: hsl(var(--muted-foreground));
}
.stat-item strong {
  color: hsl(var(--foreground));
  font-weight: 600;
  margin-right: .25rem;
}
.bio {
  margin: 0.5rem auto 1rem;
  color: hsl(var(--muted-foreground));
}
.actions .btn { gap: .5rem; }
.actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.action-group {
  display: flex;
  gap: 0.5rem;
}
.more-options {
  position: relative;
}
.menu-btn {
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  cursor: pointer;
  border-radius: var(--radius);
}
.menu-btn:hover {
  background-color: hsl(var(--muted));
}
.dropdown-content {
  position: absolute;
  right: 0;
  top: calc(100% + .5rem);
  width: max-content;
  padding: 0.5rem;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  z-index: 10;
}
.dropdown-content button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    text-align: left;
  }
  .avatar-container { margin-right: 2rem; margin-bottom: 0; }
  .info-container {
    justify-items: left;
  }
  .stats {
    justify-content: flex-start;
  }
  .bio { margin-left: 0; }
}
</style>
