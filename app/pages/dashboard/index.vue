<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Memory } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const username = computed(() => user.value?.user_metadata.username || 'Usuário');

const loading = ref(true);
const isModalOpen = ref(false);
const recentMemories = ref<Memory[]>([]);
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
    client.from('memories').select('*', { count: 'exact', head: true }).eq('user_id', user.value.sub),
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
    recentMemories.value = recentMemoriesRes.data as Memory[];
  }

  loading.value = false;
}

async function deleteMemory(memoryId: string) {
  if (confirm('Tem certeza que deseja excluir esta memória?')) {
    const { error } = await client.from('memories').delete().eq('id', memoryId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Memória excluída com sucesso.');
      fetchData();
    }
  }
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
        <h1>Bem-vindo de volta, {{ username }}!</h1>
        <p>Veja suas memórias e continue construindo sua história de vida.</p>
      </div>
    </section>

    <section class="stats-grid">
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
        <MemoryCard
          v-for="memory in recentMemories"
          :key="memory.id"
          :memory="memory"
          @delete="deleteMemory(memory.id)"
        />
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

.loading-state { text-align: center; padding: 2rem; color: hsl(var(--muted-foreground)); }
.memories-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .memories-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .memories-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
