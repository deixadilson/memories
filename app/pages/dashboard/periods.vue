<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Period } from '~/types/app';

definePageMeta({ layout: 'dashboard' });

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const isModalOpen = ref(false);
const loading = ref(true);
const periods = ref<Period[]>([]);
const editingPeriod = ref<Period | null>(null);

async function fetchPeriods() {
  if (!user.value) return;
  const { data, error } = await client
    .from('periods')
    .select('*')
    .eq('user_id', user.value.sub)
    .order('start_date', { ascending: false });
  
  if (error) {
    toast.error('Erro ao carregar os períodos.');
  } else {
    periods.value = data;
  }
  loading.value = false;
}

async function deletePeriod(periodId: string) {
  if (confirm('Tem certeza que deseja excluir este período? Esta ação não pode ser desfeita.')) {
    const { error } = await client.from('periods').delete().eq('id', periodId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Período excluído com sucesso.');
      fetchPeriods();
    }
  }
}

function editPeriod(period: Period) {
  editingPeriod.value = period;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingPeriod.value = null;
}

function handleSuccess() {
  fetchPeriods();
}

onMounted(fetchPeriods);
</script>

<template>
  <div class="page-header">
    <div>
      <h1>Períodos de Vida</h1>
      <p>Organize sua história em capítulos significativos.</p>
    </div>
    <button @click="isModalOpen = true" class="btn primary">
      <Icon name="lucide:plus" />
      Novo Período
    </button>
  </div>

  <div v-if="loading" class="loading-state"><Icon name="lucide:loader-circle" class="spinner"/> Carregando...</div>
  <div v-else-if="periods.length > 0" class="periods-grid">
    <PeriodCard
      v-for="period in periods"
      :key="period.id"
      :period="period"
      :is-owner="true"
      @edit="editPeriod(period)"
      @delete="deletePeriod(period.id)"
    />
  </div>
  <EmptyState v-else
    icon="lucide:calendar"
    title="Nenhum período cadastrado"
    message="Comece organizando sua vida em capítulos significativos."
  >
    <button @click="isModalOpen = true" class="btn primary">
      <Icon name="lucide:plus" />
      Criar Primeiro Período
    </button>
  </EmptyState>

  <Modal
    :is-open="isModalOpen"
    :title="editingPeriod ? 'Editar Período' : 'Criar Novo Período'"
    @close="closeModal"
  >
    <PeriodForm :initial-data="editingPeriod" @close="closeModal" @success="handleSuccess" />
  </Modal>
</template>

<style scoped>
.periods-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 2rem;
}
.loading-state { text-align: center; padding: 2rem; color: hsl(var(--muted-foreground)); }

@media (min-width: 768px) {
  .periods-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .periods-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
