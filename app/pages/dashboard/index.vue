<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { MemoryWithAuthor } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();
const { profile } = useProfile();
const { open: openMemoryModal } = useMemoryModal();

const loading = ref(true);
const isModalOpen = ref(false);
const recentMemories = ref<MemoryWithAuthor[]>([]);
const counts = ref({
  memories: 0,
  periods: 0,
  people: 0,
});

async function fetchData() {
  if (!user.value) return;
  loading.value = true;

  const [
    memoriesCountRes,
    periodsCountRes,
    peopleCountRes,
    recentMemoriesRes
  ] = await Promise.all([
    client.from('memories').select('*, profiles(*)', { count: 'exact', head: true }).eq('user_id', user.value.sub),
    client.from('periods').select('*', { count: 'exact', head: true }).eq('user_id', user.value.sub),
    client.from('friendships').select('*', { count: 'exact', head: true }).eq('requester_id', user.value.sub).eq('status', 'accepted'),
    client.from('memories').select('*').eq('user_id', user.value.sub).order('date', { ascending: false }).limit(3)
  ]);

  if (memoriesCountRes.error || periodsCountRes.error || peopleCountRes.error || recentMemoriesRes.error) {
    toast.error('Não foi possível carregar os dados do dashboard.');
  } else {
    counts.value.memories = memoriesCountRes.count ?? 0;
    counts.value.periods = periodsCountRes.count ?? 0;
    counts.value.people = peopleCountRes.count ?? 0;
    recentMemories.value = recentMemoriesRes.data as MemoryWithAuthor[];
  }

  loading.value = false;
}

function handleSuccess() {
  fetchData();
}

onMounted(fetchData);
</script>

<template>
  <div>
    <section class="page-header">
      <div>  
        <h1>Bem-vindo de volta, {{ profile?.username }}!</h1>
        <p>Veja suas memórias e continue construindo sua história de vida.</p>
      </div>
    </section>

    <section class="stats-grid desktop-only">
      <div class="stat-card">
        <div class="stats-header">
          <h3>Memórias</h3>
          <Icon name="lucide:image" class="stat-icon" />
        </div>
        <div class="stat-content">
          <span class="count">{{ counts.memories }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stats-header">
          <h3>Períodos</h3>
          <Icon name="lucide:clock" class="stat-icon" />
        </div>
        <div class="stat-content">
          <span class="count">{{ counts.periods }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stats-header">
          <h3>Pessoas</h3>
          <Icon name="lucide:users" class="stat-icon" />
        </div>
        <div class="stat-content">
          <span class="count">{{ counts.people }}</span>
        </div>
      </div>
    </section>

    <section class="mobile-stats-card mobile-only">
      <div class="stat-item">
        <div class="label">
          <span>Memórias</span>
        </div>
        <span class="count">
          {{ counts.memories }}
          <Icon name="lucide:image" class="stat-icon"/>
        </span>
      </div>
      <div class="stat-item">
        <div class="label">
          <span>Períodos</span>
        </div>
        <span class="count">
          {{ counts.periods }}
          <Icon name="lucide:clock" class="stat-icon"/>
        </span>
      </div>
      <div class="stat-item">
        <div class="label">
          <span>Pessoas</span>
        </div>
        <span class="count">
          {{ counts.people }}
          <Icon name="lucide:users" class="stat-icon"/>
        </span>
      </div>
    </section>

    <section>
      <div class="section-header">
        <h2>Memórias Recentes</h2>
        <button @click="isModalOpen = true" class="btn primary">
          <Icon name="lucide:plus" class="icon"/>
          Nova Memória
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <Icon name="lucide:loader-circle" class="spinner"/> Carregando memórias...
      </div>
      <div v-else-if="recentMemories.length > 0" class="memories-grid">
        <div v-for="(memory, index) in recentMemories" :key="memory.id" @click="openMemoryModal(recentMemories, index)" class="card-wrapper">
          <MemoryCard :memory="memory" />
        </div>
      </div>
      <EmptyState v-else
        icon="lucide:image"
        title="Nenhuma memória ainda"
        message="Comece a registrar suas memórias e construa sua história de vida!"
      >
        <button @click="isModalOpen = true" class="btn primary">
          <Icon name="lucide:plus" class="icon"/>
          Criar Primeira Memória
        </button>
      </EmptyState>
    </section>

    <Modal
      :is-open="isModalOpen"
      title="Criar Nova Memória"
      @close="isModalOpen = false"
    >
      <MemoryForm @close="isModalOpen = false" @success="handleSuccess"/>
    </Modal>
  </div>
</template>

<style scoped>
.mobile-only {
  display: none;
}
.desktop-only {
  display: grid;
}
.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  margin-bottom: 2rem;
}
.stat-card {
  color: hsl(var(--card-foreground));
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  box-shadow: 0 1px 2px 0 hsl(var(--card));
}
.stats-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  padding-bottom: .5rem;
}
h3 {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: -.025em;
  color: hsl(var(--muted-foreground));
}
.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: hsl(var(--silver));
}
.stat-content {
  padding: 1.5rem;
  padding-top: 0;
}
.count {
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-weight: 700;
}
.mobile-stats-card {
  background-color: hsl(var(--card));
  border-radius: var(--radius);
  padding: 1rem;
  justify-content: space-around;
  text-align: center;
  margin-bottom: 2rem;
  border: 1px solid hsl(var(--border));
}
.stat-item .count {
  font-size: 1.75rem;
  font-weight: 700;
  display: block;
  margin-bottom: 0.25rem;
}
.stat-item .label {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: 1rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}
.stat-item .iconify {
  color: hsl(var(--pink-light));
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
h2 {
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
}
.card-wrapper { cursor: pointer; } 
.memories-grid {
  display: grid;
  gap: 1.5rem;
}

@media (max-width: 767px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
  }
}
@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .memories-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .memories-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
