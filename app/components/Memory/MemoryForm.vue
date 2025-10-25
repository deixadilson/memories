<script setup lang="ts">
import imageCompression from 'browser-image-compression';
import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { Memory, MemoryInsert, DatePrecision, MemoryFormData } from '~/types/app';

const props = defineProps<{ initialData?: Memory | null }>();
const emit = defineEmits(['close', 'success']);

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

const loading = ref(false);
const datePrecision = ref<DatePrecision>('complete');
const selectedFiles = ref<File[]>([]);

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
  }
});

const isEditMode = computed(() => !!props.initialData);

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files);
  }
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

  const newMemoryId = isEditMode.value ? props.initialData!.id : crypto.randomUUID();
  let mediaUrls: string[] = isEditMode.value ? props.initialData!.media_urls || [] : [];

  if (selectedFiles.value.length > 0) {
    const compressionOptions = {
      maxSizeMB: .5,
      maxWidthOrHeight: 1040,
      useWebWorker: true,
    };

    const uploadPromises = selectedFiles.value.map(async (file) => {
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
      const filePath = `${user.value!.sub}/${newMemoryId}/${uniqueFileName}`;

      return client.storage.from('memories-media').upload(filePath, fileToUpload);

    });

    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(res => res.error);
    if (failedUploads.length > 0) {
      toast.error(`Falha no upload de ${failedUploads.length} arquivo(s).`);
      loading.value = false;
      return;
    }
    
    const newUrls = results.map(res => client.storage.from('memories-media').getPublicUrl(res.data!.path).data.publicUrl);
    mediaUrls = [...mediaUrls, ...newUrls];
  }

  const dataToSubmit: Omit<MemoryInsert, 'user_id' | 'id'> = {
    ...memoryData.value,
    date: finalDate,
    date_precision: datePrecision.value,
    media_urls: mediaUrls.length > 0 ? mediaUrls : null,
    updated_at: new Date().toISOString(),
  };

  if (isEditMode.value) {
    const { error } = await client
      .from('memories')
      .update(dataToSubmit)
      .eq('id', props.initialData!.id);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Memória atualizada com sucesso!');
      emit('success');
      emit('close');
    }
  } else {
    const { error } = await client.from('memories').insert({
      id: newMemoryId,
      user_id: user.value.sub,
      ...memoryData.value,
      date: finalDate,
      date_precision: datePrecision.value,
      media_urls: mediaUrls.length > 0 ? mediaUrls : null,
    } as MemoryInsert);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Memória criada com sucesso!');
      emit('success');
      emit('close');
    }
  }

  loading.value = false;
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
      <label for="media">Mídias</label>
      <label for="media" class="file-input-label">
        <Icon name="lucide:upload" />
        <span>Selecionar arquivos</span>
      </label>
      <input id="media" type="file" accept="image/*" multiple @change="onFileChange" class="hidden" />
      <div v-if="selectedFiles.length > 0" class="file-preview">
        <span v-for="file in selectedFiles" :key="file.name">{{ file.name }}</span>
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
    <button class="btn primary" type="submit" :disabled="loading">
      <Icon v-if="loading" name="lucide:loader-circle" class="spinner"/>
      {{ loading ? (isEditMode ? 'Salvando...' : 'Criando...') : (isEditMode ? 'Salvar Alterações' : 'Criar Memória') }}
    </button>
  </form>
</template>

<style scoped>
.form-group:not(:first-child) { margin-top: 1rem; }
label { font-size: .875rem; font-weight: 500; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem; }
.btn { width: 100%; margin-top: 1.5rem; }

.info-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: hsl(var(--muted));
  border-radius: calc(var(--radius) - 2px);
  color: hsl(var(--muted-foreground));
  margin-top: 1rem;
}
.file-input-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px dashed hsl(var(--input));
  border-radius: calc(var(--radius) - 2px);
  cursor: pointer;
  margin-top: 0.5rem;
}
.file-input-label:hover {
  background-color: hsl(var(--muted));
}
.hidden { display: none; }
.file-preview { margin-top: 0.5rem; font-size: 0.8rem; color: hsl(var(--muted-foreground)); }
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
  opacity: 0;
  width: 0;
  height: 0;
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
