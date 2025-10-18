<script setup lang="ts">
const isModalOpen = ref(false);

function handleSuccess() {
  //fetchData();
}
</script>

<template>
  <div class="tab-content">
    <EmptyState
      icon="lucide:list"
      title="Nenhuma lista criada"
      message="Crie listas para organizar seus amigos e controlar a visibilidade das memórias."
      >
      <button @click="isModalOpen = true" class="btn primary">
        <Icon name="lucide:plus" />
        Criar Primeira Lista
      </button>
    </EmptyState>
    <Modal :is-open="isModalOpen" title="Criar Lista de Amigos" @close="isModalOpen = false">
      <UserListForm @close="isModalOpen = false" @success="handleSuccess"/>
    </Modal>
  </div>
</template>
