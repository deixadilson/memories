<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });

const user = useSupabaseUser();
const username = computed(() => user.value?.user_metadata.username || 'Usuário');
const isModalOpen = ref(false);

function handleSuccess() {
  console.log('Memória criada, recarregar lista!');
}
</script>

<template>
  <div>
    <section class="page-header">
      <div>  
        <h1>Bem-vindo de volta, {{username}}!</h1>
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
          <span class="count">0</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stats-header">
          <h3>Períodos</h3>
          <Icon name="lucide:clock" class="stat-icon" />
        </div>
        <div class="stat-content">
          <span class="count">0</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stats-header">
          <h3>Pessoas</h3>
          <Icon name="lucide:users" class="stat-icon" />
        </div>
        <div class="stat-content">
          <span class="count">0</span>
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
      <EmptyState
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

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
