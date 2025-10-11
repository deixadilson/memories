<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  message: string;
}>();
</script>

<template>
  <div class="container">
    <Icon :name="icon" class="icon" />
    <h3>{{title}}</h3>
    <p>{{message}}</p>
    <slot />
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  padding: 3rem 0;
  border-radius: var(--radius);
  background-color: hsl(var(--muted));
}
.icon {
  width: 4rem;
  height: 4rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}
h3 {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: .5rem;
}
p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}
</style>
