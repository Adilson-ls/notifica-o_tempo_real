const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validar variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('⚠️  SUPABASE_URL ou SUPABASE_ANON_KEY não estão configuradas');
    console.warn('    Copie .env.example para .env e preencha com suas credenciais Supabase');
}

// Criar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'placeholder_key'
);

module.exports = supabase;
