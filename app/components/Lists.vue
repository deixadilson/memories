<script setup lang="ts">
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { UserList, UserWithStatus, UserListWithMembers } from '~/types/app';

const props = defineProps<{ followers: UserWithStatus[] }>();

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(true);
const lists = ref<UserList[]>([]);
const isModalOpen = ref(false);
const editingList = ref<UserList | null>(null);
const isConfirmModalOpen = ref(false);
const isManageModalOpen = ref(false);
const listToManage = ref<UserListWithMembers | null>(null);
const listToDelete = ref<UserList | null>(null);

async function fetchLists() {
  if (!user.value) return;
  loading.value = true;
  const { data, error } = await client
    .from('user_lists')
    .select('*')
    .eq('owner_id', user.value.sub)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast.error("Erro ao carregar as listas.");
  } else {
    lists.value = data;
  }
  loading.value = false;
}

onMounted(fetchLists);

const followersWithMembership = computed(() => {
  if (!listToManage.value) return [];
  const memberIds = new Set(listToManage.value.user_list_members.map(m => m.member_id));
  return props.followers.map(f => ({
    ...f,
    isMemberList: memberIds.has(f.id),
  }));
});

async function handleManageMembers(list: UserList) {
  const { data, error } = await client
    .from('user_lists')
    .select('*, user_list_members(*)')
    .eq('id', list.id)
    .single();

  if (error) { toast.error("Erro ao carregar detalhes da lista."); }
  else {
    listToManage.value = data;
    isManageModalOpen.value = true;
  }
}

function handleMemberUpdate({ followerId, isMember }: { followerId: string; isMember: boolean }) {
  if (!listToManage.value) return;
  if (isMember) {
    listToManage.value.user_list_members.push({ list_id: listToManage.value.id, member_id: followerId });
  } else {
    listToManage.value.user_list_members = listToManage.value.user_list_members.filter(m => m.member_id !== followerId);
  }
}

async function confirmDelete() {
  if (!listToDelete.value) return;
  const { error } = await client.from('user_lists').delete().eq('id', listToDelete.value.id);
  if (error) {
    toast.error(error.message);
  } else {
    toast.success('Lista excluída com sucesso.');
    fetchLists();
  }
  closeConfirmModal();
}

function openCreateModal() {
  editingList.value = null;
  isModalOpen.value = true;
}

function handleEdit(list: UserList) {
  editingList.value = list;
  isModalOpen.value = true;
}

function promptDelete(list: UserList) {
  listToDelete.value = list;
  isConfirmModalOpen.value = true;
}

function handleSuccess() {
  fetchLists();
}

function closeModal() {
  isModalOpen.value = false;
  editingList.value = null;
}

function closeConfirmModal() {
  isConfirmModalOpen.value = false;
  listToDelete.value = null;
}
</script>

<template>
  <div>
    <div v-if="loading" class="loading-state">
      <Icon name="lucide:loader-circle" class="spinner"/> Carregando listas...
    </div>
    
    <div v-else-if="lists.length > 0">
      <div class="lists-grid">
        <ListCard
          v-for="list in lists"
          :key="list.id"
          :list="list"
          @edit="handleEdit(list)"
          @delete="promptDelete(list)"
          @manage="handleManageMembers(list)"
        />
      </div>
      <div class="footer">
        <button @click="openCreateModal" class="btn primary">
          <Icon name="lucide:plus" />
          Nova Lista
        </button>
      </div>
    </div>
    
    <EmptyState v-else
      icon="lucide:list"
      title="Nenhuma lista criada"
      message="Crie listas para organizar seus amigos e controlar a visibilidade das memórias."
    >
      <button @click="openCreateModal" class="btn primary">
        <Icon name="lucide:plus" />
        Criar Primeira Lista
      </button>
    </EmptyState>

    <Modal
      :is-open="isModalOpen"
      :is-top-modal="true"
      :title="editingList ? 'Editar Lista' : 'Criar Nova Lista'"
      @close="closeModal"
    >
      <ListForm
        :initial-data="editingList"
        @close="closeModal"
        @success="handleSuccess"
      />
    </Modal>

    <ManageMembersModal
      :is-open="isManageModalOpen"
      :list="listToManage"
      :followers="followersWithMembership"
      @close="isManageModalOpen = false"
      @member-update="handleMemberUpdate"
    />

    <ConfirmModal
      :is-open="isConfirmModalOpen"
      title="Confirmar exclusão"
      message="Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita."
      @cancel="closeConfirmModal"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.loading-state {
  text-align: center;
  padding: 2rem;
  color: hsl(var(--muted-foreground));
}
.lists-grid {
  display: grid;
  gap: 1.5rem;
}
.footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}


@media (min-width: 768px) {
  .lists-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 1024px) {
  .lists-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
