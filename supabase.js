const SUPABASE_URL = 'https://kawspxlxbncaihbnoetc.supabase.co'; // ← ВАШ URL ЗДЕСЬ
const SUPABASE_ANON_KEY = 'sb_publishable_GKuQlutuoP8MBcr19dlCSw_JSDqASMj'; // ← ВАШ КЛЮЧ ЗДЕСЬ

// ========== СОЗДАЕМ КЛИЕНТ ==========
console.log('🔄 Подключаемся к Supabase...');

try {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY
  );
  console.log('✅ Supabase подключен! URL:', SUPABASE_URL);
} catch (error) {
  console.error('❌ Ошибка подключения к Supabase:', error);
}
