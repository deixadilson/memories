<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });

const isModalOpen = ref(false);

function handleSuccess() {
  // Aqui você pode adicionar a lógica para recarregar a lista de períodos
  console.log('Período criado, recarregar lista!');
}
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
  <EmptyState
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
    title="Criar Novo Período"
    @close="isModalOpen = false"
  >
    <PeriodForm @close="isModalOpen = false" @success="handleSuccess" />
  </Modal>
</template>
