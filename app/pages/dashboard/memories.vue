<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });
</script>
<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Memórias</h1>
        <p>Preserve momentos especiais da sua jornada.</p>
      </div>
      <button class="btn primary">
        <Icon name="lucide:plus" />
        Nova Memória
      </button>
    </div>
    <EmptyState
      icon="lucide:image"
      title="Nenhuma memória cadastrada"
      message="Comece a preservar os momentos especiais da sua vida."
    >
      <button class="btn primary">
        <Icon name="lucide:plus" />
        Criar Primeira Memória
      </button>
    </EmptyState>
  </div>
</template>
