<script setup lang="ts">
import imageCompression from 'browser-image-compression';
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { MemoryComplete, MemoryInsert, DatePrecision, MemoryFormData, UserList, Profile, Person } from '~/types/app';

const props = defineProps<{
  initialData?: MemoryComplete | null;
  isTagModalOpen: boolean;
  isMediaModalOpen: boolean;
}>();
const emit = defineEmits(['close', 'success', 'update:isMediaModalOpen', 'update:isTagModalOpen']);

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const datePrecision = ref<DatePrecision>('complete');
const filesToUpload = ref<File[]>([]);
const existingMediaUrls = ref<string[]>([]);
const removedMediaUrls = ref<string[]>([]);
const selectedPeopleIds = ref<string[]>([]);
const selectedListIds = ref<string[]>([]);
const following = ref<Profile[]>([]);
const userLists = ref<UserList[]>([]);
const people = ref<Person[]>([]);

const memoryData = ref<MemoryFormData>({
  title: '',
  category: 'personal',
  location: '',
  description: '',
  visibility: 'private',
});

const dateParts = ref({
  complete: '',
  year: new Date().getFullYear().toString(),
  month: (new Date().getMonth()).toString(),
});

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const visibilityOptions = [
  { id: 'private', label: 'Privado', icon: 'lucide:lock' },
  { id: 'friends', label: 'Amigos', icon: 'lucide:users' },
  { id: 'lists', label: 'Listas Específicas', icon: 'lucide:list' },
  { id: 'public', label: 'Público', icon: 'lucide:globe' },
];

onMounted(async () => {
  if (!user.value) return;
  const { data: listData } = await client.from('user_lists').select('*').eq('owner_id', user.value.sub);
  userLists.value = listData || [];
  
  const { data: followingData } = await client
    .from('friendships')
    .select('profiles!receiver_id(*)')
    .eq('requester_id', user.value.sub)
    .eq('status', 'accepted');
  following.value = followingData?.map(f => f.profiles) || [];

  const { data: peopleData } = await client.from('people').select('*').eq('creator_id', user.value.sub);
  people.value = peopleData || [];
});

watchEffect(() => {
  if (props.initialData) {
    const data = props.initialData;
    memoryData.value = {
      title: data.title,
      category: data.category,
      location: data.location || '',
      description: data.description || '',
      visibility: data.visibility,
    };
    datePrecision.value = data.date_precision;
    
    const date = new Date(`${data.date}T00:00:00`);
    if (datePrecision.value === 'complete') {
      dateParts.value.complete = data.date;
    }
    dateParts.value.year = date.getFullYear().toString();
    dateParts.value.month = date.getMonth().toString();
    
    existingMediaUrls.value = props.initialData.media_urls || [];
    selectedPeopleIds.value = props.initialData.memory_user_tags?.map(tag => tag.person_id) || [];
    selectedListIds.value = data.memory_list_visibility?.map(item => item.list_id) || [];
  }
});

const isEditMode = computed(() => !!props.initialData);

function handleMediaSave({ newFiles, keptUrls, removedUrls }: { newFiles: File[], keptUrls: string[], removedUrls: string[] }) {
  filesToUpload.value = newFiles;
  existingMediaUrls.value = keptUrls;
  removedMediaUrls.value = removedUrls;
}

async function handleSubmit() {
  if (!user.value) return;

  loading.value = true;
  let finalDate: string;
  switch (datePrecision.value) {
    case 'today':
      finalDate = new Date().toISOString().split('T')[0]!;
      break;
    case 'month_year':
      const month = parseInt(dateParts.value.month) + 1;
      finalDate = `${dateParts.value.year}-${month.toString().padStart(2, '0')}-01`;
      break;
    case 'year_only':
      finalDate = `${dateParts.value.year}-01-01`;
      break;
    default:
      if (!dateParts.value.complete) {
        toast.error('Por favor, selecione uma data completa.');
        loading.value = false;
        return;
      }
      finalDate = dateParts.value.complete;
      break;
  }
 
  try {
    let memoryId: string;
    let finalMediaUrls: string[] = [];
   
    const dataToSubmit: Omit<MemoryInsert, 'user_id' | 'id'> = {
      ...memoryData.value,
      date: finalDate,
      date_precision: datePrecision.value,
      updated_at: new Date().toISOString(),
    };

    if (isEditMode.value) {
      memoryId = props.initialData!.id;
      finalMediaUrls = [...existingMediaUrls.value];
      const { error } = await client.from('memories')
        .update(dataToSubmit)
        .eq('id', memoryId);
      
      if (error) throw error;
    } else {
      const { data, error } = await client.from('memories')
        .insert({ ...dataToSubmit, user_id: user.value.sub })
        .select('id')
        .single();
      
      if (error || !data) throw error || new Error("Não foi possível criar a memória.");
      memoryId = data.id;
    }

    const allTaggable = [
      ...following.value.map(f => ({ id: f.id, type: 'user' })),
      ...people.value.map(p => ({ id: p.id, type: 'person' })),
    ];
    const tagsToSubmit = selectedPeopleIds.value
      .map(id => allTaggable.find(p => p.id === id))
      .filter(Boolean) as { id: string; type: 'user' | 'person' }[];

    const { error: rpcError } = await client.rpc('tag_people_in_memory', {
      p_memory_id: memoryId,
      tags: tagsToSubmit,
    });
    if (rpcError) throw rpcError;

    await client.from('memory_list_visibility').delete().eq('memory_id', memoryId);
    if (memoryData.value.visibility === 'lists' && selectedListIds.value.length > 0) {
      const listLinks = selectedListIds.value.map(listId => ({ memory_id: memoryId, list_id: listId }));
      await client.from('memory_list_visibility').insert(listLinks);
    }

    if (isEditMode.value && removedMediaUrls.value.length > 0) {
      const { error: deleteError } = await client.functions.invoke('delete-memory-media', {
        body: { memoryId: memoryId, urlsToDelete: removedMediaUrls.value },
      });
      if (deleteError) {
        console.error('Falha ao excluir mídias antigas:', deleteError);
      }
    }

    if (filesToUpload.value.length > 0) {
      const compressionOptions = {
        maxSizeMB: .5,
        maxWidthOrHeight: 1040,
        useWebWorker: true,
      };

      const uploadPromises = filesToUpload.value.map(async file => {
        let fileToUpload = file;

        if (file.type.startsWith('image/')) {
          try {
            fileToUpload = await imageCompression(file, compressionOptions);
          } catch (error) {
            console.error('Falha ao comprimir imagem.', error);
            toast.warning(`Não foi possível otimizar a imagem "${file.name}".`);
          }
        }
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}${Math.floor(Math.random() * 100)}.${fileExt}`;
        const filePath = `${user.value!.sub}/${memoryId}/${uniqueFileName}.${fileExt}`;
        return client.storage.from('memories-media').upload(filePath, file);
      });

      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter(res => res.error);
      if (failedUploads.length > 0) {
        throw new Error(`Falha no upload de ${failedUploads.length} arquivo(s).`);
      }
      
      const newUrls = results.map(res => {
        return client.storage.from('memories-media').getPublicUrl(res.data!.path).data.publicUrl;
      });
      finalMediaUrls.push(...newUrls);
    }

    const { error: finalUpdateError } = await client.from('memories')
      .update({ media_urls: finalMediaUrls.length > 0 ? finalMediaUrls : null })
      .eq('id', memoryId);
    if (finalUpdateError) throw finalUpdateError;

    toast.success(isEditMode.value ? 'Memória atualizada!' : 'Memória criada!');
    emit('success');
    emit('close');

  } catch (error: any) {
    toast.error(error.message);
  } finally {
    loading.value = false;
  }
}

function openMediaModal() {
  emit('update:isMediaModalOpen', true);
}
function openTagModal() {
  emit('update:isTagModalOpen', true);
}
function closeMediaModal() {
  emit('update:isMediaModalOpen', false);
}
function closeTagModal() {
  emit('update:isTagModalOpen', false);
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="title">Título *</label>
      <input id="title" v-model="memoryData.title" type="text" placeholder="Ex: Formatura" required />
    </div>

    <div class="form-group">
      <label for="date_precision">Precisão da Data</label>
      <select id="date_precision" v-model="datePrecision">
        <option value="complete">Data Completa</option>
        <option value="today">Hoje</option>
        <option value="month_year">Ano e Mês</option>
        <option value="year_only">Apenas Ano</option>
      </select>
    </div>

    <div v-if="datePrecision === 'complete'" class="form-group">
      <label for="complete_date">Data Completa</label>
      <input id="complete_date" v-model="dateParts.complete" type="date" />
    </div>

    <div v-if="datePrecision === 'today'" class="info-box">
      <Icon name="lucide:calendar-check" />
      <span>Data de hoje será usada</span>
    </div>

    <div v-if="datePrecision === 'month_year'" class="grid">
      <div>
        <label for="year">Ano</label>
        <input id="year" v-model="dateParts.year" type="number" placeholder="YYYY" />
      </div>
      <div>
        <label for="month">Mês</label>
        <select id="month" v-model="dateParts.month">
          <option v-for="(month, index) in months" :key="month" :value="index">{{ month }}</option>
        </select>
      </div>
    </div>

    <div v-if="datePrecision === 'year_only'" class="form-group">
      <label for="year_only">Ano</label>
      <input id="year_only" v-model="dateParts.year" type="number" placeholder="YYYY" />
    </div>

    <div class="form-group">
      <label for="category">Categoria *</label>
      <select id="category" v-model="memoryData.category" required>
        <option value="personal">Pessoal</option>
        <option value="travel">Viagem</option>
        <option value="education">Educação</option>
        <option value="family">Família</option>
        <option value="work">Trabalho</option>
        <option value="milestone">Marco Histórico</option>
        <option value="other">Outro</option>
      </select>
    </div>

    <div class="form-group">
      <label for="location">Localização</label>
      <input id="location" v-model="memoryData.location" type="text" placeholder="Ex: Rio de Janeiro, Brasil" />
    </div>

    <div class="form-group">
      <label for="description">Descrição</label>
      <textarea id="description" v-model="memoryData.description" rows="3" placeholder="Conte sobre esta memória..."></textarea>
    </div>

    <div class="form-group">
      <label>Mídias</label>
      <button type="button" @click="openMediaModal" class="btn secondary">
        <Icon name="lucide:images" />
        Gerenciar Mídias
      </button>
      <div v-if="filesToUpload.length > 0" class="media-preview">
        {{ filesToUpload.length }} mídia(s) selecionada(s).
      </div>
    </div>

    <div class="form-group">
      <label>Pessoas</label>
      <button type="button" @click="openTagModal" class="btn secondary">
        <Icon name="lucide:at-sign" /> Marcar Pessoas
      </button>
      <div v-if="selectedPeopleIds.length > 0" class="tags-preview">
        Marcado com {{ selectedPeopleIds.length }} pessoa(s).
      </div>
    </div>

    <div class="form-group">
      <label>Visibilidade</label>
      <div class="radio-group">
        <label v-for="option in visibilityOptions" :key="option.id" class="radio-label">
          <input type="radio" :value="option.id" v-model="memoryData.visibility" name="visibility"/>
          <span class="custom-radio"></span>
          <Icon :name="option.icon" class="icon"/>
          <span>{{ option.label }}</span>
        </label>
      </div>
    </div>

    <div v-if="memoryData.visibility === 'lists'">
      <ListSelector :lists="userLists" v-model="selectedListIds" />
    </div>

    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Memória') }}
    </button>
  </form>

  <ManageMediaModal
    :is-open="isMediaModalOpen"
    :existing-media-urls="initialData?.media_urls || []"
    @close="closeMediaModal"
    @save="handleMediaSave"
  />

  <TagPeopleModal
    :is-open="isTagModalOpen"
    :following="following"
    :people="people"
    v-model="selectedPeopleIds"
    @close="closeTagModal"
  />
</template>

<style scoped>
.form-group:not(:first-child) {
  margin-top: 1rem;
}
label {
  font-size: .875rem; font-weight: 500;
}
.grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
  margin-top: 1rem;
}
.btn {
  width: 100%; margin-top: 1.5rem;
}
.form-group .btn {
  margin-top: .5rem;
}
.info-box {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem;
  background-color: hsl(var(--muted));
  border-radius: calc(var(--radius) - 2px);
  color: hsl(var(--muted-foreground));
  margin-top: 1rem;
}
.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .75rem;
  border: 1px dashed hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
  margin-top: .5rem;
}
.file-input-label:hover {
  background-color: hsl(var(--muted));
}
.hidden { display: none; }
.media-preview, .tags-preview {
  margin-top: .25rem;
  font-size: .8rem;
  color: hsl(var(--muted-foreground));
}
.file-preview span { display: block; }
.radio-group {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-weight: normal;
  cursor: pointer;
  margin-bottom: 0;
}
.radio-label .icon {
  width: 1rem;
  height: 1rem;
}
.radio-label input[type="radio"] {
  position: absolute;
  width: 0; height: 0;
  opacity: 0;
}
.custom-radio {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid hsl(var(--input));
  border-radius: 50%;
  transition: all .2s ease;
}
.custom-radio::after {
  content: "";
  display: block;
  width: .75rem;
  height: .75rem;
  border-radius: 50%;
  background-color: hsl(var(--gold));
  transform: scale(0);
  transition: transform .2s ease;
}
.radio-label input:checked + .custom-radio {
  border-color: hsl(var(--gold));
}
.radio-label input:checked + .custom-radio::after {
  transform: scale(1);
}
</style>
