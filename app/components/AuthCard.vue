<!-- app/components/AuthCard.vue -->
<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="card-header">
        <h1><NuxtLink to="/">Memórias</NuxtLink></h1>
        <p>{{ msg }}</p>
      </div>
      <div class="card-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-image: linear-gradient(to bottom right, hsl(36 44% 98%) , hsl(40 25% 92%) , hsl(350 30% 95%));
}
.auth-card {
  color: hsl(var(--card-foreground));
  width: 100%;
  max-width: 28rem;
  border-radius: var(--radius);
  background-color: hsl(var(--card));
  box-shadow: 0 1px 2px 0 hsl(var(--card));
}
.card-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}
h1 {
  font-size: 1.875rem;
  line-height: 2.25rem;
  letter-spacing: -.025em;
  text-align: center;
  color: transparent;
  background-image: linear-gradient(to right, hsl(var(--gold)), hsl(var(--pink-light)));
  background-clip: text;
}
.auth-card p {
  font-size: .875rem;
  line-height: 1.25rem;
  text-align: center;
  color: hsl(var(--muted-foreground));
  margin-top: .25rem;
}
.card-content {
  padding: 1.5rem;
  padding-top: 0;
}

:deep(.form-group:not(:first-child)) {
  margin-top: 1rem;
}
:deep(label) {
  font-size: .875rem;
  line-height: 1;
  font-weight: 500;
}
:deep(input) {
  margin-top: .5rem;
}
:deep(input:focus) {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 2px hsl(var(--ring) / .5);
}
:deep(button) {
  width: 100%;
  margin-top: 1.5rem;
}
:deep(.switch-page) {
  color: hsl(var(--muted-foreground));
  font-size: .875rem;
  line-height: 1.25rem;
  text-align: center;
  margin-top: 1.5rem;
}
:deep(.switch-page a:hover) {
  color: hsl(var(--foreground));
}
</style>