1 // ========== НАСТРОЙКИ SUPABASE ==========
2 // ЗАМЕНИ ЭТИ ДАННЫЕ НА СВОИ С SUPABASE.COM!
3 
4 const SUPABASE_URL = 'https://kawspxlxbncaihbnoetc.supabase.co'; // ← СТРОКА 4: ВСТАВЬТЕ ВАШ URL
5 const SUPABASE_ANON_KEY = 'sb_publishable_GKuQlutuoP8MBcr19dlCSw_JSDqASMj'; // ← СТРОКА 5: ВСТАВЬТЕ ВАШ КЛЮЧ
6 
7 // ========== СОЗДАЕМ КЛИЕНТ ==========
8 window.supabaseClient = window.supabase.createClient(
9   SUPABASE_URL, 
10   SUPABASE_ANON_KEY
11 );
