<script setup lang="ts">
import type { PeriodWithVisibility } from '~/types/app';

const props = defineProps<{
  period: PeriodWithVisibility;
  isOwner?: boolean;
}>();
const emit = defineEmits(['edit', 'delete']);

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
  <div class="card">
    <div class="card-header">
      <div class="title-group">
        <div class="icon-wrapper">
          <Icon :name="periodIcons[period.type]" class="icon" />
        </div>
        <div>
          <h3>{{ period.title }}</h3>
          <p class="date">{{ formattedDate }}</p>
        </div>
      </div>
      <div v-if="isOwner" class="actions">
        <button @click.stop="emit('edit')" class="action-btn" title="Editar">
          <Icon name="lucide:pencil" />
        </button>
        <button @click.stop="emit('delete')" class="action-btn" title="Excluir">
          <Icon name="lucide:trash-2" />
        </button>
      </div>
    </div>
    <div class="card-body">
      <p v-if="period.location" class="location">
        <Icon name="lucide:map-pin"/>
        {{ period.location }}
      </p>
      <p v-if="period.description" class="description">{{ period.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  box-shadow: var(--shadow-soft);
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.title-group {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.icon-wrapper {
  background-color: hsl(var(--gold) / .1);
  padding: .5rem;
  border-radius: var(--radius);
}
.icon {
  width: 1.25rem; height: 1.25rem;
  color: hsl(var(--gold));
}
h3 {
  font-weight: 600;
  font-size: 1.125rem;
  line-height: 1.75rem;
}
.date, .location {
  font-size: .875rem;
  line-height: 1.25rem;
  color: hsl(var(--muted-foreground));
}
.actions {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.action-btn {
  width: 2rem; height: 2rem;
  padding: 0.25rem;
}
.action-btn:last-child {
  color: hsl(var(--destructive));
}
.action-btn:hover {
  background-color: hsl(var(--accent));
}
.action-btn .iconify {
  width: 1rem; height: 1rem;
}
.location {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .75rem;
}
.location .iconify {
  width: 1rem; height: 1rem;
  color: hsl(var(--gold));
}
.description {
  font-size: .875rem;
  line-height: 1.25rem;
  color: hsl(var(--foreground) / .8);
}
</style>
