<script setup lang="ts">
import type { Period } from '~/types/app';

const props = defineProps<{
  period: Period;
}>();

const periodIcons = {
  residence: 'lucide:home',
  work: 'lucide:briefcase',
  education: 'lucide:graduation-cap',
  relationship: 'lucide:users',
  travel: 'lucide:plane',
  project: 'lucide:lightbulb',
  other: 'lucide:calendar',
};

const formattedDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric', timeZone: 'UTC' };
  const startDate = new Date(props.period.start_date).toLocaleDateString('pt-BR', options);
  const endDate = props.period.end_date
    ? new Date(props.period.end_date).toLocaleDateString('pt-BR', options)
    : 'Presente';
  return `${startDate} - ${endDate}`;
});
</script>

<template>
  <div class="detail-card">
    <div class="icon-wrapper">
      <Icon :name="periodIcons[period.type]" class="icon" />
    </div>
    <div class="content">
      <h2>{{ period.title }}</h2>
      <div class="meta">
        <span><Icon name="lucide:calendar" /> {{ formattedDate }}</span>
        <span v-if="period.location"><Icon name="lucide:map-pin" /> {{ period.location }}</span>
      </div>
      <p v-if="period.description" class="description">{{ period.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.detail-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background-image: var(--gradient-card);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
}
.icon-wrapper {
  background-color: hsl(var(--gold) / .1);
  padding: .75rem;
  border-radius: var(--radius);
}
.icon {
  width: 2rem; height: 2rem;
  color: hsl(var(--gold));
}
.content {
  flex: 1 1 0%;
}
h2 {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
  margin-bottom: .5rem;
}
.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}
.meta span {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.meta .iconify {
  width: 1rem; height: 1rem;
}
.description {
  color: hsl(var(--foreground) / .8);
}
</style>
