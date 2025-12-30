<script setup lang="ts">
interface FilterOption {
  label: string;
  value: string;
  icon: string;
}

const props = defineProps<{
  type: 'memories' | 'periods';
  placeholder?: string;
  categories: FilterOption[];
  modelValue: {
    search: string;
    category: string;
    sort: 'newest' | 'oldest' | 'az';
  };
}>();

const emit = defineEmits(['update:modelValue']);

const filters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

type FilterMode = 'idle' | 'searching' | 'filtering';
const activeMode = ref<FilterMode>('idle');
const searchInput = ref<HTMLInputElement | null>(null);

function setCategory(value: string) {
  filters.value = { ...filters.value, category: value };
}

function toggleSort() {
  const newSort = filters.value.sort === 'newest' ? 'oldest' : 'newest';
  filters.value = { ...filters.value, sort: newSort };
}

function setMode(mode: FilterMode) {
  activeMode.value = mode;
  if (mode === 'searching') {
    nextTick(() => searchInput.value?.focus());
  }
}

function resetMode() {
  activeMode.value = 'idle';
}
</script>

<template>
  <div class="list-filters" :class="{ 'mode-searching': activeMode === 'searching', 'mode-filtering': activeMode === 'filtering' }">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="activeMode === 'searching'" key="searching" class="active-mode-container">
        <button class="back-btn" @click="resetMode">
          <Icon name="lucide:chevron-left" />
        </button>
        <div class="search-container is-active">
          <Icon name="lucide:search" class="search-icon" />
          <input
            ref="searchInput"
            type="text"
            v-model="filters.search"
            :placeholder="props.placeholder || 'Buscar...'"
            class="search-input"
          />
        </div>
      </div>

      <div v-else-if="activeMode === 'filtering'" key="filtering" class="active-mode-container">
        <div class="categories-container is-wrapped">
          <button class="back-btn inline-back" @click="resetMode">
            <Icon name="lucide:chevron-left" />
          </button>
          <button
            class="category-chip"
            :class="{ active: filters.category === 'all' }"
            @click="setCategory('all')"
          >
            Todos
          </button>
          <button
            v-for="cat in props.categories"
            :key="cat.value"
            class="category-chip"
            :class="{ active: filters.category === cat.value }"
            @click="setCategory(cat.value)"
          >
            <Icon :name="cat.icon" class="chip-icon" />
            {{ cat.label }}
          </button>
        </div>
      </div>

      <div v-else key="idle" class="filters-content">
        <div class="search-section">
          <div class="search-container desktop-only">
            <Icon name="lucide:search" class="search-icon" />
            <input
              type="text"
              v-model="filters.search"
              :placeholder="props.placeholder || 'Buscar...'"
              class="search-input"
            />
          </div>
          <button class="mobile-trigger-btn mobile-only" @click="setMode('searching')">
            <Icon name="lucide:search" />
            Buscar
          </button>
        </div>

        <div class="filters-divider desktop-only"></div>

        <div class="categories-section">
          <div class="categories-container desktop-only">
            <button
              class="category-chip"
              :class="{ active: filters.category === 'all' }"
              @click="setCategory('all')"
            >
              Todos
            </button>
            <button
              v-for="cat in props.categories"
              :key="cat.value"
              class="category-chip"
              :class="{ active: filters.category === cat.value }"
              @click="setCategory(cat.value)"
            >
              <Icon :name="cat.icon" class="chip-icon" />
              {{ cat.label }}
            </button>
          </div>
          <button class="mobile-trigger-btn mobile-only" @click="setMode('filtering')">
            <Icon name="lucide:filter" />
            Filtrar
          </button>
        </div>

        <div class="filters-divider desktop-only"></div>

        <div class="sort-section">
          <button class="sort-toggle-btn mobile-only same-size" @click="toggleSort">
            <Icon :name="filters.sort === 'newest' ? 'lucide:arrow-down' : 'lucide:arrow-up'" class="sort-icon" />
            Ordenar
          </button>
          <button class="sort-toggle-btn desktop-only" @click="toggleSort">
            <Icon :name="filters.sort === 'newest' ? 'lucide:arrow-down' : 'lucide:arrow-up'" class="sort-icon" />
            {{ filters.sort === 'newest' ? 'Mais recentes' : 'Mais antigos' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.list-filters {
  margin-bottom: 2rem;
  width: 100%;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
}

.filters-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 1rem;
}

.active-mode-container {
  display: flex;
  align-items: center;
  gap: .75rem;
  width: 100%;
}

.search-section {
  flex: 0 0 200px;
}

.categories-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.categories-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  flex-wrap: wrap;
}

.sort-section {
  flex: 0 0 auto;
}

.search-container {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: .75rem;
  top: 50%;
  transform: translateY(-50%);
  color: hsl(var(--muted-foreground));
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

.search-input {
  padding-left: 2.25rem;
  height: 2.5rem;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border) / .8);
  border-radius: .5rem;
  font-size: .75rem;
  line-height: 1rem;
  width: 100%;
}

.filters-divider {
  width: 1px;
  height: 1.5rem;
  background-color: hsl(var(--border) / .5);
  flex-shrink: 0;
}

.categories-container {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.category-chip {
  gap: .25rem;
  padding: .25rem .75rem;
  height: 1.5rem;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border) / .8);
  border-radius: 999px;
  font-size: .75rem;
  line-height: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  white-space: nowrap;
  transition: all .2s ease;
  cursor: pointer;
}

.category-chip:hover {
  background-color: hsl(var(--muted));
}

.category-chip.active {
  background-color: hsl(var(--gold));
  border-color: hsl(var(--gold));
  color: hsl(var(--primary-foreground));
  font-weight: 500;
}

.chip-icon {
  width: .9rem;
  height: .9rem;
}

.sort-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  height: 2.5rem;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border) / .8);
  border-radius: .5rem;
  font-size: .875rem;
  color: hsl(var(--foreground));
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}

.sort-toggle-btn:hover {
  background-color: hsl(var(--muted));
}

.sort-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--muted-foreground));
}

.mobile-only {
  display: none;
}

.back-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: hsl(var(--foreground));
  cursor: pointer;
  padding: 0;
}

.back-btn .lucide {
  width: 1.5rem;
  height: 1.5rem;
}

@media (max-width: 768px) {
  .filters-content {
    gap: .5rem;
  }

  .mobile-only {
    display: flex;
  }

  .desktop-only {
    display: none !important;
  }

  .search-section, .categories-section, .sort-section {
    flex: 1;
    min-width: 0;
  }

  .mobile-trigger-btn, .sort-toggle-btn.mobile-only {
    width: 100%;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    background-color: hsl(var(--background));
    border: 1px solid hsl(var(--border) / .8);
    border-radius: .5rem;
    font-size: .875rem;
    color: hsl(var(--foreground));
    cursor: pointer;
    padding: 0;
  }

  .is-wrapped {
    flex: 1;
    flex-wrap: wrap;
    gap: .5rem;
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all .25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
