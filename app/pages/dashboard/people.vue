<script setup lang="ts">
definePageMeta({ layout: 'dashboard' });
</script>
<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>Pessoas</h1>
        <p>Gerencie as pessoas importantes da sua vida.</p>
      </div>
      <button class="btn primary">
        <Icon name="lucide:plus" />
        Adicionar Pessoa
      </button>
    </div>
    <EmptyState
      icon="lucide:users"
      title="Nenhuma pessoa cadastrada"
      message="Adicione pessoas importantes da sua vida."
    >
      <button class="btn primary">
        <Icon name="lucide:plus" />
        Adicionar Primeira Pessoa
      </button>
    </EmptyState>
  </div>
</template>
