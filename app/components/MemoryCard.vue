<script setup lang="ts">
const props = defineProps<{
  memory: {
    id: string;
    title: string;
    description: string;
    date: string;
    category: 'travel' | 'education' | 'family' | 'work' | 'personal' | 'milestone';
    image?: string;
    mediaUrls?: string[];
    location?: string;
    people?: string[];
  };
  onEdit?: () => void;
}>();
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
          <p>{{memory.date}}</p>
        </div>
        <div class="aside">
          <div :class="`badge ${memory.category}`">
            <img :src="`/icons/${memory.category}.svg`" class="icon"/>
            {{memory.category}}
          </div>
          <button v-if="onEdit" @click="onEdit" className="h-8 w-8 p-0">
            <img :src="`/icons/pen.svg`"/>
          </button>
        </div>
      </div>
      <p class="description">{{memory.description}}</p>
      <div v-if="memory.location || memory.people" class="card-footer" className="flex flex-wrap gap-2 pt-2 border-t border-border/30">
        <div v-if="memory.location" class="location" className="flex items-center gap-1 text-sm text-muted-foreground">
          <img src="/icons/travel.svg" class="icon" alt="Location"/>
          {{memory.location}}
        </div>
        <div v-if="memory.people && memory.people.length > 0" class="people" className="flex items-center gap-1 text-sm text-muted-foreground">
          <img src="/icons/personal.svg" class="icon" alt="People"/>
          {{memory.people.join(', ')}}
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
.aside button {
  width: 2rem;
  height: 2rem;
  padding: 0;
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
</style>
