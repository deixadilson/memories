<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Period, MemoryWithAuthor } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const route = useRoute();
const user = useSupabaseUser();
const { open: openMemoryModal } = useMemoryModal();

const loading = ref(true);
const period = ref<Period | null>(null);
const memories = ref<MemoryWithAuthor[]>([]);

async function fetchData() {
  if (!user.value) return;
  loading.value = true;
  
  const periodId = route.params.id as string;

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

  const query = client
    .from('memories')
    .select('*, profiles(*)')
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
        <div v-for="(memory, index) in memories" :key="memory.id" @click="openMemoryModal(memories, index)" class="card-wrapper">
          <MemoryCard :memory="memory" />
        </div>
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
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}
.memories-grid {
  display: grid;
  gap: 1.5rem;
}
.card-wrapper { cursor: pointer; }

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
