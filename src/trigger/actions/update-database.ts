import { createClient } from "@supabase/supabase-js";

export async function updateDatabase(config: {
  operation?: string;
  table?: string;
  filter?: string;
  data?: string;
}) {
  const { operation = "update", table, filter: filterStr, data: dataStr } = config;

  if (!table) {
    return { error: "Tabela não configurada" };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { error: "Supabase não configurado" };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    let filterObj: Record<string, any> = {};
    let dataObj: Record<string, any> = {};

    if (filterStr) {
      try { filterObj = JSON.parse(filterStr); } catch { /* ignore */ }
    }
    if (dataStr) {
      try { dataObj = JSON.parse(dataStr); } catch { /* ignore */ }
    }

    let query: any;

    switch (operation) {
      case "select":
        query = supabase.from(table).select("*");
        for (const [key, value] of Object.entries(filterObj)) {
          query = query.eq(key, value);
        }
        break;

      case "insert":
        query = supabase.from(table).insert(dataObj).select();
        break;

      case "update":
        query = supabase.from(table).update(dataObj);
        for (const [key, value] of Object.entries(filterObj)) {
          query = query.eq(key, value);
        }
        break;

      case "delete":
        query = supabase.from(table).delete();
        for (const [key, value] of Object.entries(filterObj)) {
          query = query.eq(key, value);
        }
        break;

      default:
        return { error: `Operação desconhecida: ${operation}` };
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, operation, table, data };
  } catch (err: any) {
    return { error: err.message };
  }
}
