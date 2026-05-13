// Конфигурация Supabase
const SUPABASE_URL = 'https://kawspxlxbncaihbnoetc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthd3NweGx4Ym5jYWloYm5vZXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MDkyMTIsImV4cCI6MjA4MjE4NTIxMn0.ULXwvlG8rl6iMO6MLgG0CbE08flNT-eqethEQgRX0n4';

// Подключение к Supabase
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
