<script setup lang="ts" generic="T extends { id: string | number }">
const props = defineProps<{
  items: T[];
  columnsDesktop?: number;
  columnsTablet?: number;
  gap?: string;
}>();

const desktopCols = computed(() => props.columnsDesktop || 3);
const tabletCols = computed(() => props.columnsTablet || 2);

const windowWidth = ref(1024);

if (process.client) {
  const updateWidth = () => {
    windowWidth.value = window.innerWidth;
  };
  onMounted(() => {
    windowWidth.value = window.innerWidth;
    window.addEventListener('resize', updateWidth);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
  });
}

const columnCount = computed(() => {
  if (windowWidth.value >= 1024) return desktopCols.value;
  if (windowWidth.value >= 768) return tabletCols.value;
  return 1;
});

const columns = computed(() => {
  const cols: T[][] = Array.from({ length: columnCount.value }, () => []);
  props.items.forEach((item, index) => {
    const colIndex = index % columnCount.value;
    if (cols[colIndex]) {
      cols[colIndex].push(item);
    }
  });
  return cols;
});
</script>

<template>
  <div class="masonry-grid" :style="{ gap: props.gap || '1.5rem' }">
    <div 
      v-for="(column, colIndex) in columns" 
      :key="colIndex" 
      class="masonry-column"
      :style="{ gap: props.gap || '1.5rem' }"
    >
      <div v-for="(item, index) in column" :key="item.id" class="masonry-item">
        <slot :item="item" :index="props.items.indexOf(item)"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.masonry-grid {
  display: flex;
  width: 100%;
  align-items: flex-start;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.masonry-item {
  width: 100%;
}
</style>
