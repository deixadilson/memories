<script setup lang="ts">
import type { Profile, FriendshipStatus } from '~/types/app';

defineProps<{
  profile: Profile;
  status: FriendshipStatus | 'self';
  stats: {
    memories: number;
    followers: number;
    following: number;
  };
}>();

const emit = defineEmits(['action']);
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
        <button v-if="status === 'not_friends'" @click="emit('action', 'follow')" class="btn primary">
          <Icon name="lucide:user-plus" /> Seguir
        </button>
        <button v-if="status === 'following' || status === 'mutual'" @click="emit('action', 'unfollow')" class="btn secondary">
          <Icon name="lucide:check" /> Seguindo
        </button>
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
  margin-right: 0.25rem;
}
.bio {
  margin: 0.5rem auto 1rem;
  color: hsl(var(--muted-foreground));
}
.actions .btn { gap: 0.5rem; }

@media (min-width: 768px) {
  .profile-header {
    flex-direction: row;
    text-align: left;
  }
  .avatar-container { margin-right: 2rem; margin-bottom: 0; }
  .stats {
    justify-content: flex-start;
  }
  .bio { margin-left: 0; }
}
</style>
