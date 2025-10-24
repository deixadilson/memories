<script setup lang="ts">
import type { CommentWithProfile } from '~/types/app';

const props = defineProps<{
  comment: CommentWithProfile;
}>();

const formattedDate = computed(() => {
  return new Date(props.comment.created_at!).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
</script>

<template>
  <div class="comment-item">
    <img :src="comment.profiles?.avatar_url!" alt="Avatar" class="avatar" />
    <div class="comment-content">
      <div class="header">
        <span class="username">{{ comment.profiles?.username }}</span>
        <span class="date">{{ formattedDate }}</span>
      </div>
      <p class="content">{{ comment.content }}</p>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid hsl(var(--border));
}
.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.comment-content {
  display: flex;
  flex-direction: column;
}
.header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.username {
  font-weight: 600;
  font-size: 0.875rem;
}
.date {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}
.content {
  font-size: 0.875rem;
  line-height: 1.6;
  color: hsl(var(--foreground) / .9);
  white-space: pre-wrap;
}
</style>
