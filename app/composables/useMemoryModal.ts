import { toast } from 'vue-sonner';
import type { Database } from '~/types/supabase';
import type { UserModalState, MemoryWithAuthor, CommentWithProfile, Like } from '~/types/app';

export const useMemoryModal = () => {
  const state = useState<UserModalState>('memory-modal-state', () => ({
    isOpen: false,
    memory: null,
    likes: [],
    comments: [],
    currentIndex: -1,
    liking: false,
    list: [],
  }));

  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  const _fetchDetails = async (memory: MemoryWithAuthor) => {
    state.value.memory = memory;
    state.value.likes = [];
    state.value.comments = [];

    const [likesRes, commentsRes] = await Promise.all([
      client.from('likes').select('*').eq('memory_id', memory.id),
      client.from('comments').select('*, profiles(*)').eq('memory_id', memory.id).order('created_at', { ascending: true }),
    ]);

    state.value.likes = likesRes.data || [];
    state.value.comments = (commentsRes.data as CommentWithProfile[]) || [];
  };

  const open = (memories: MemoryWithAuthor[], startIndex: number) => {
    if (!memories[startIndex]) return;
    state.value.list = memories;
    state.value.currentIndex = startIndex;
    state.value.isOpen = true;
    _fetchDetails(memories[startIndex]);
  };

  const close = () => {
    state.value.isOpen = false;
    setTimeout(() => {
      state.value.list = [];
      state.value.currentIndex = -1;
      state.value.memory = null;
    }, 300);
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? state.value.currentIndex - 1 : state.value.currentIndex + 1;
    const nextMemory = state.value.list[newIndex];
    if (nextMemory) {
      state.value.currentIndex = newIndex;
      _fetchDetails(nextMemory);
    }
  };

  const toggleLike = async () => {
    if (!user.value || !state.value.memory || state.value.liking) return;

    try {
      state.value.liking = true;

      const { id: memoryId } = state.value.memory;
      const { sub: userId } = user.value;
      const existingLike = state.value.likes.find(l => l.user_id === userId);

      if (existingLike) {
        state.value.likes = state.value.likes.filter(l => l.user_id !== userId);
        const { error } = await client.from('likes').delete().match({ user_id: userId, memory_id: memoryId });
        if (error) {
          toast.error("Erro ao descurtir.");
          state.value.likes.push(existingLike);
        }
      } else {
        const newLike: Like = { user_id: userId, memory_id: memoryId, created_at: new Date().toISOString() };
        state.value.likes.push(newLike);
        const { error } = await client.from('likes').insert({ user_id: userId, memory_id: memoryId });
        if (error) {
          toast.error("Erro ao curtir.");
          state.value.likes = state.value.likes.filter(l => l.user_id !== userId);
        }
      }
    } catch (e) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      state.value.liking = false;
    }
  };

  const postComment = async (content: string) => {
    if (!user.value || !state.value.memory) return;

    const { data, error } = await client
      .from('comments')
      .insert({
        user_id: user.value.sub,
        memory_id: state.value.memory.id,
        content: content.trim(),
      })
      .select('*, profiles(*)')
      .single();
    
    if (error) {
      toast.error("Erro ao comentar.");
    }
    else {
      state.value.comments.push(data as CommentWithProfile);
    }
  };

  return {
    state: state,
    open,
    close,
    navigate,
    toggleLike,
    postComment,
  };
};