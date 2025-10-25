<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';

const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();
const { profile } = useProfile();

const isOpen = ref(false);
const dropdown = ref(null);

onClickOutside(dropdown, () => isOpen.value = false);

const firstLetter = computed(() => profile.value?.username.charAt(0).toUpperCase() || '?');

const handleLogout = async () => {
  await client.auth.signOut();
  router.push('/user/login');
};
</script>

<template>
  <div class="user-menu" ref="dropdown">
    <template v-if="profile">
      <button @click="isOpen = !isOpen" class="avatar-button">
        <img
          v-if="profile.avatar_url"
          :src="profile.avatar_url"
          alt="Avatar"
          class="avatar-image"
        />
        <span v-else class="avatar-initial">{{ firstLetter }}</span>
      </button>

      <div v-if="isOpen" class="dropdown-content">
        <div class="dropdown-header">
          <p class="username">{{ profile.username }}</p>
          <p class="email">{{ user?.email }}</p>
        </div>
        <div class="dropdown-divider"></div>
        <NuxtLink to="/dashboard/profile" class="dropdown-item" @click="isOpen=false">
          Perfil
        </NuxtLink>
        <button @click="handleLogout" class="dropdown-item">
          Sair
        </button>
      </div>
    </template>
    <div v-else class="avatar-button skeleton"></div>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}
.avatar-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  width: 2.25rem;
  height: 2.25rem;
  font-weight: 500;
  padding: .5rem 1rem;
  white-space: nowrap;
  background-color: hsl(var(--gold));
  border-radius: 9999px;
  overflow: hidden;
  padding: 0;
}
.avatar-button span {
  color: hsl(var(--primary-foreground));
  background-color: hsl(var(--gold));
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dropdown-content {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 8rem;
  width: 14rem;
  color: hsl(var(--popover-foreground));
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / .1), 0 2px 4px -2px rgb(0 0 0 / .1);
  padding: .25rem;
  z-index: 50;
  animation: enter 0.2s ease-out;
}
.avatar-initial {
  color: hsl(var(--primary-foreground));
  font-size: 1rem;
  line-height: 1;
}
.dropdown-header {
  padding: .5rem;
}
.username {
  font-size: .875rem;
  line-height: 1.25rem;
  font-weight: 500;
}
.email {
  font-size: .75rem;
  line-height: 1rem;
  color: hsl(var(--muted-foreground));
  margin-top: .25rem;
}
.dropdown-divider {
  height: 1px;
  background-color: hsl(var(--muted));
  margin: .25rem;
}
.dropdown-item {
  display: block;
  padding: 0.375rem .5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  cursor: pointer;
}
.dropdown-item:hover {
  background-color: hsl(var(--beige) / .5);
}
.skeleton {
  background-color: hsl(var(--muted));
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
