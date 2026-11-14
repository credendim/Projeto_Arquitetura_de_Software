const supabase = require("../config/supabaseClient"); // Arquivo que conecta usando o .env[cite: 3]

async function salvarFilmeCompleto(dados) {
  const { atores, ...dadosDoFilme } = dados;

  const { data: filmeSalvo, error: erroFilme } = await supabase
    .from("filme")
    .insert([dadosDoFilme])
    .select()
    .single();

  if (erroFilme) {
    const duplicado = erroFilme.code === "23505"; // chave única violada: o filme já existe
    const erro = new Error(
      duplicado
        ? "Este filme já está na sua lista"
        : `Erro ao salvar filme: ${erroFilme.message}`,
    );
    erro.status = duplicado ? 409 : 500;
    throw erro;
  }

  try {
    await salvarElenco(filmeSalvo.idfilme, atores);
  } catch (erro) {
    // Desfaz o filme para não ficar salvo sem elenco
    await supabase.from("elenco").delete().eq("idfilme", filmeSalvo.idfilme);
    await supabase.from("filme").delete().eq("idfilme", filmeSalvo.idfilme);
    throw erro;
  }

  return filmeSalvo;
}

async function salvarElenco(idFilme, atores) {
  if (!atores || atores.length === 0) return;

  const atoresParaSalvar = atores.map((a) => ({
    nome: a.nome,
    foto: a.foto,
    perfil: a.perfil,
    id_tmdb: a.id_tmdb,
  }));

  const { data: atoresNoBanco, error: erroAtor } = await supabase
    .from("ator")
    .upsert(atoresParaSalvar, { onConflict: "id_tmdb" })
    .select();

  if (erroAtor) throw new Error(`Erro ao salvar atores: ${erroAtor.message}`);

  const elencoParaSalvar = atoresNoBanco.map((atorSalvo) => {
    const atorOriginal = atores.find((a) => a.id_tmdb === atorSalvo.id_tmdb);
    return {
      idfilme: idFilme,
      idator: atorSalvo.idator,
      personagem: atorOriginal?.personagem,
    };
  });

  const { error: erroElenco } = await supabase
    .from("elenco")
    .insert(elencoParaSalvar);

  if (erroElenco)
    throw new Error(`Erro ao vincular elenco: ${erroElenco.message}`);
}

async function listarFilmesBanco() {
  const { data, error } = await supabase
    .from("filme")
    .select("idfilme, titulo, duracao, capa, is_favorito, is_assistido");

  console.log("LISTAR FILMES ->", { error, qtd: data?.length });
  if (error) throw error;
  return data;
}

async function buscarFilmePorId(id) {
  const idFilme = Number(id);

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    throw new Error("ID de filme inválido");
  }

  const { data, error } = await supabase
    .from("filme")
    .select(
      `
      *,
      elenco (
        idpersonagem,
        personagem,
        ator (
          idator,
          nome,
          foto,
          perfil
        )
      )
    `,
    )
    .eq("idfilme", idFilme)
    .order("idpersonagem", { referencedTable: "elenco", ascending: true })
    .maybeSingle();

  console.log("BUSCAR FILME ->", { idFilme, error, encontrado: !!data });
  if (error) throw error;

  return data; // objeto do filme com elenco, ou null se não existir
}

async function deletarFilme(id) {
  const idFilme = Number(id);

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    throw new Error("ID de filme inválido");
  }

  // 1. DELETAR O ELENCO (tabela filha, que tem FK para filme)
  const { error: erroElenco } = await supabase
    .from("elenco")
    .delete()
    .eq("idfilme", idFilme);

  if (erroElenco) {
    throw new Error(`Erro ao deletar elenco: ${erroElenco.message}`);
  }

  // 2. DELETAR O FILME
  const { data: filmeDeletado, error: erroFilme } = await supabase
    .from("filme")
    .delete()
    .eq("idfilme", idFilme)
    .select()
    .maybeSingle();

  console.log("DELETAR FILME ->", {
    idFilme,
    erroFilme,
    deletado: !!filmeDeletado,
  });

  if (erroFilme) {
    throw new Error(`Erro ao deletar filme: ${erroFilme.message}`);
  }

  return filmeDeletado;
}

async function atualizarFavorito(id, isFavorito) {
  const idFilme = Number(id);

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    throw new Error("ID de filme inválido");
  }

  if (typeof isFavorito !== "boolean") {
    throw new Error("is_favorito deve ser true ou false");
  }

  const { data, error } = await supabase
    .from("filme")
    .update({ is_favorito: isFavorito })
    .eq("idfilme", idFilme)
    .select("idfilme, titulo, is_favorito")
    .maybeSingle();

  console.log("ATUALIZAR FAVORITO ->", {
    idFilme,
    isFavorito,
    error,
    atualizado: !!data,
  });
  if (error) throw new Error(`Erro ao atualizar favorito: ${error.message}`);

  return data; // filme atualizado, ou null se o id não existir
}

async function atualizarAssistido(id, isAssistido) {
  const idFilme = Number(id);

  if (!Number.isInteger(idFilme) || idFilme <= 0) {
    throw new Error("ID de filme inválido");
  }

  if (typeof isAssistido !== "boolean") {
    throw new Error("is_assistido deve ser true ou false");
  }

  const { data, error } = await supabase
    .from("filme")
    .update({ is_assistido: isAssistido })
    .eq("idfilme", idFilme)
    .select("idfilme, titulo, is_assistido")
    .maybeSingle();

  console.log("ATUALIZAR ASSISTIDO ->", {
    idFilme,
    isAssistido,
    error,
    atualizado: !!data,
  });
  if (error) throw new Error(`Erro ao atualizar assistido: ${error.message}`);

  return data; // filme atualizado, ou null se o id não existir
}

module.exports = {
  salvarFilmeCompleto,
  listarFilmesBanco,
  buscarFilmePorId,
  deletarFilme,
  atualizarFavorito,
  atualizarAssistido,
};
