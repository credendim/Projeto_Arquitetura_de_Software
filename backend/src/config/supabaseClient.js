require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// Utilizando a service_key para contornar o RLS com segurança no backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

module.exports = supabase;
