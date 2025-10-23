<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Period, Memory } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const user = useSupabaseUser();

const loading = ref(true);
const period = ref<Period | null>(null);
const memories = ref<Memory[]>([]);

async function fetchData() {
  if (!user.value) return;
  loading.value = true;
  
  const periodId = route.params.id as string;

  // 1. Busca os detalhes do período
  const { data: periodData, error: periodError } = await client
    .from('periods')
    .select('*')
    .eq('id', periodId)
    .single();

  if (periodError || !periodData) {
    toast.error('Período não encontrado.');
    return navigateTo('/dashboard/periods');
  }
  period.value = periodData;

  // 2. Busca as memórias que estão dentro do intervalo de datas do período
  const query = client
    .from('memories')
    .select('*')
    .eq('user_id', user.value.sub)
    .gte('date', periodData.start_date);
    
  if (periodData.end_date) {
    query.lte('date', periodData.end_date);
  }

  const { data: memoriesData, error: memoriesError } = await query.order('date', { ascending: false });

  if (memoriesError) {
    toast.error('Erro ao buscar as memórias deste período.');
  } else {
    memories.value = memoriesData;
  }
  
  loading.value = false;
}

onMounted(fetchData);
</script>

<template>
  <div>
    <NuxtLink to="/dashboard/periods" class="back-link">
      <Icon name="lucide:arrow-left" />
      Voltar aos Períodos
    </NuxtLink>

    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-circle" class="spinner"/> Carregando...
    </div>
    
    <div v-else-if="period">
      <PeriodDetailCard :period="period" />
      
      <h2 class="section-title">Memórias deste período ({{ memories.length }})</h2>
      
      <div v-if="memories.length > 0" class="memories-grid">
        <MemoryCard v-for="memory in memories" :key="memory.id" :memory="memory" />
      </div>
      <EmptyState v-else
        icon="lucide:image-off"
        title="Nenhuma memória neste período"
        message="Você ainda não adicionou memórias que aconteceram durante este período da sua vida."
      />
    </div>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: .5rem 1rem;
  font-size: .875rem;
  line-height: 1.25rem;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  border-radius: calc(var(--radius) - 2px);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(.4, 0, .2, 1);
  transition-duration: .15s;
}
.back-link:hover {
  color: hsl(var(--foreground));
  background-color: hsl(var(--accent));
}
.loading-state { text-align: center; padding: 4rem; }
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
}
.memories-grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .memories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .memories-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
