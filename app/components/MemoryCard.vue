<script setup lang="ts">
import type { Memory } from '~/types/app';

const props = defineProps<{
  memory: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    date_precision?: string;
    category: 'travel' | 'education' | 'family' | 'work' | 'personal' | 'milestone' | 'other';
    image?: string;
    mediaUrls?: string[];
    location?: string | null;
    people?: string[];
  };
  isOwner?: boolean;
}>();

const emit = defineEmits(['edit', 'delete']);

const categoryIcons = {
  travel: 'lucide:plane',
  education: 'lucide:graduation-cap',
  family: 'lucide:heart',
  work: 'lucide:briefcase',
  personal: 'lucide:user',
  milestone: 'lucide:award',
  other: 'lucide:shapes'
};

const formattedDate = computed(() => {
  if (!props.memory.date) return 'Data não informada';
  
  const date = new Date(`${props.memory.date}T00:00:00`);

  switch (props.memory.date_precision) {
    case 'complete':
    case 'today':
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    case 'month_year':
      return date.toLocaleDateString('pt-BR', {
        month: 'long', year: 'numeric'
      });
    case 'year_only':
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric'
      });
    default:
      return props.memory.date;
  }
});

const displayMedia = props.memory.image ? [props.memory.image] : props.memory.mediaUrls;
</script>

<template>
  <div class="card">
    <div v-if="displayMedia && displayMedia.length > 0" class="media">
      <img v-if="displayMedia.length === 1" :src="displayMedia[0]" :alt="memory.title"/>
      <div v-else>
        <div v-for="(url, index) in displayMedia.slice(0, 4)" :key="url">
          <img :src="url" :alt="`${memory.title} ${index + 1}`"/>
          <div v-if="index  === 3 && displayMedia.length > 4">
            +{{displayMedia.length - 4}}
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="card-header">
        <div class="title">
          <h3>{{memory.title}}</h3>
          <p>{{ formattedDate }}</p>
        </div>
        <div class="aside">
          <div :class="`badge ${memory.category}`">
            <Icon :name="categoryIcons[memory.category]"/>
            {{ memory.category }}
          </div>
          <button v-if="isOwner" @click="emit('edit')" class="action-btn" title="Editar">
            <Icon name="lucide:pencil" />
          </button>
          <button v-if="isOwner" @click="emit('delete')" class="action-btn" title="Excluir">
            <Icon name="lucide:trash-2" />
          </button>
        </div>
      </div>
      <p class="description">{{ memory.description }}</p>
      <div v-if="memory.location || memory.people" class="card-footer">
        <div v-if="memory.location" class="location">
          <Icon name="lucide:map-pin" class="icon" alt="Location" />
          {{ memory.location }}
        </div>
        <div v-if="memory.people && memory.people.length > 0" class="people">
          <Icon name="lucide:user" class="icon" alt="People"/>
          {{ memory.people.join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  color: hsl(var(--card-foreground));
  padding: 1.5rem;
}
.media {
  margin-bottom: 1rem;
  width: 100%;
  height: 12rem;
  border-radius: var(--radius);
  overflow: hidden;
}
.media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .5s;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
}
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
}
.title {
  flex: 1 1 0%;
}
.title h3 {
  color: hsl(var(--foreground));
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: .5rem;
}
.title p {
  color: hsl(var(--muted-foreground));
  font-size: .875rem;
  line-height: 1.25rem;
  font-weight: 500;
}
.aside {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.badge {
  display: flex;
  align-items: center;
  gap: .25rem;
  color: hsl(var(--foreground));
  font-size: .75rem;
  line-height: 1rem;
  font-weight: 600;
  padding: .125rem .625rem;
  border-radius: 9999px;
}
.badge.travel {
  background-color: hsl(var(--gold));
}
.badge.family {
  background-color: hsl(var(--gold));
}
.badge.work {
  background-color: hsl(var(--silver));
}
.badge.personal {
  background-color: hsl(var(--pink-light));
}
.badge.milestone {
  background-color: hsl(var(--beige-dark));
}
img.icon {
  width: .75rem;
  height: .75rem;
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
.description {
  color: hsl(var(--foreground) / .8);
  line-height: 1.625;
  margin-top: 1rem;
}
.card-footer {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  padding-top: .5rem;
  border-top: 1px solid hsl(var(--border) / .3);
  margin-top: 1rem;
}
.location, .people {
  display: flex;
  align-items: center;
  gap: .25rem;
  color: hsl(var(--muted-foreground));
  font-size: .875rem;
  line-height: 1.25rem;
}
.location .iconify {
  width: 1rem; height: 1rem;
  color: hsl(var(--gold));
}
</style>
