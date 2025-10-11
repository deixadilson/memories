<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });
</script>
<template>
  <div class="page-header">
    <div>
      <h1>Períodos de Vida</h1>
      <p>Organize sua história em capítulos significativos.</p>
    </div>
    <button class="btn primary">
      <Icon name="lucide:plus" />
      Novo Período
    </button>
  </div>
  <EmptyState
    icon="lucide:calendar"
    title="Nenhum período cadastrado"
    message="Comece organizando sua vida em capítulos significativos."
  >
    <button class="btn primary">
      <Icon name="lucide:plus" />
      Criar Primeiro Período
    </button>
  </EmptyState>
</template>
