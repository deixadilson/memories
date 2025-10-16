<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });

const isModalOpen = ref(false);

function handleSuccess() {
  console.log('Memória criada, recarregar lista!');
}
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Memórias</h1>
        <p>Preserve momentos especiais da sua jornada.</p>
      </div>
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Nova Memória
      </button>
    </div>
    <EmptyState
      icon="lucide:image"
      title="Nenhuma memória cadastrada"
      message="Comece a preservar os momentos especiais da sua vida."
    >
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Criar Primeira Memória
      </button>
    </EmptyState>
    <Modal
      :is-open="isModalOpen"
      title="Criar Nova Memória"
      @close="isModalOpen = false"
    >
      <MemoryForm @close="isModalOpen = false" @success="handleSuccess" />
    </Modal>
  </div>
</template>
