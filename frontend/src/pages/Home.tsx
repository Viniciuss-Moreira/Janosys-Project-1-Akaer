import { useEffect, useState } from "react";
import "../styles/Normas.css";
import "../styles/Home.css";

interface Norma {
  id: string;
  codigo: string;
  titulo: string;
  organizacao: string;
  categoria: string;
  subcategoria: string;
  item: string;
  tipo: string;
  status: string;
  notas: string[];
  referencias: string[];
  nomePdf?: string;
  urlPdf?: string;
  imagens?: string[];
}

interface Peca {
  nome: string;
  categoria: string;
  subcategoria: string;
  normasVinculadas: string[];
}

const ORG_ORIGENS: Record<string, string> = {
  ANAC: "🇧🇷",
  FAA: "🇺🇸",
  EASA: "🇪🇺",
  ICAO: "🌐",
  DoD: "🇺🇸",
  SAE: "🇺🇸",
  ISO: "🌐",
  AKAER: "🇧🇷",
};

const CATEGORIAS_DEF = {
  PEÇA: { icone: "fa-gear", tema: "theme-tipo-peca" },
  CONJUNTO: { icone: "fa-wrench", tema: "theme-tipo-conjunto" },
  INSTALAÇÃO: { icone: "fa-screwdriver-wrench", tema: "theme-tipo-instalacao" },
  GERAL: { icone: "fa-circle-notch", tema: "theme-tipo-geral" },
} as const;

type CategoriaRaiz = keyof typeof CATEGORIAS_DEF;

const ESTRUTURA_PASTAS: Record<CategoriaRaiz, string[]> = {
  PEÇA: ["METÁLICA", "NÃO METÁLICA"],
  CONJUNTO: ["INSTALAÇÃO DE ACESSÓRIOS", "UNIÃO DE PEÇAS", "CABLAGEM"],
  INSTALAÇÃO: ["ESTRUTURA", "HIDROMECÂNICOS", "ELÉTRICA", "GERAL", "TESTE"],
  GERAL: ["BASIC NOTES", "IDENTIFICAÇÃO"],
};

export default function Home() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [normas, setNormas] = useState<Norma[]>([]);

  const [pecaVisualizar, setPecaVisualizar] = useState<Peca | null>(null);
  const [normaDetalheVisualizar, setNormaDetalheVisualizar] =
    useState<Norma | null>(null);

  const [navCategoria, setNavCategoria] = useState<CategoriaRaiz | null>(null);
  const [navSubcategoria, setNavSubcategoria] = useState<string | null>(null);

  // 🔥 BUSCA BACKEND
  useEffect(() => {
    fetch("http://localhost:3000/pecas")
      .then((res) => res.json())
      .then((data) => setPecas(data))
      .catch((err) => console.error(err));

    fetch("http://localhost:3000/normas")
      .then((res) => res.json())
      .then((data) => setNormas(data))
      .catch((err) => console.error(err));
  }, []);

  const pecasDaSubcategoria = pecas.filter(
    (pecaAtual) =>
      pecaAtual.categoria === navCategoria &&
      pecaAtual.subcategoria === navSubcategoria,
  );

  const resetNavegacao = () => {
    setNavCategoria(null);
    setNavSubcategoria(null);
  };

  const renderPecaCard = (peca: Peca, index: number) => {
    const configCategoria = CATEGORIAS_DEF[peca.categoria as CategoriaRaiz];

    return (
      <div key={index} className={`peca-card ${configCategoria.tema}`}>
        <div className="peca-card-header">
          <div className={`peca-icon-wrapper ${configCategoria.tema}`}>
            <i className={`fas ${configCategoria.icone}`}></i>
          </div>
          <div className="peca-info">
            <h3>{peca.nome}</h3>
          </div>
        </div>

        <div className="peca-card-body">
          <div className="peca-badges">
            <span className={`badge ${configCategoria.tema}`}>
              <i className={`fas ${configCategoria.icone} badge-icon`}></i>
              {peca.categoria}
            </span>

            <span className="badge theme-subcategoria">
              <i className="fas fa-folder"></i> {peca.subcategoria}
            </span>
          </div>
        </div>

        <div className="peca-card-footer">
          <span className="normas-count">
            <i className="fas fa-file-shield"></i>{" "}
            {peca.normasVinculadas.length} Normas
          </span>

          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setPecaVisualizar(peca)}
          >
            <i className="fas fa-eye"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <main className="page">
        <div className="page-header pecas-header">
          <h1 className="page-title">
            <i className="fas fa-book-bookmark"></i> Catálogo de Componentes
          </h1>
        </div>

        <div className="breadcrumbs">
          <div
            className={`breadcrumb-item ${!navCategoria ? "active" : ""}`}
            onClick={resetNavegacao}
          >
            <i className="fas fa-home"></i> Início
          </div>

          {navCategoria && (
            <>
              <i className="fas fa-chevron-right breadcrumb-separator"></i>
              <div
                className={`breadcrumb-item ${!navSubcategoria ? "active" : ""}`}
                onClick={() => setNavSubcategoria(null)}
              >
                <i className={`fas ${CATEGORIAS_DEF[navCategoria].icone}`}></i>
                {navCategoria}
              </div>
            </>
          )}
        </div>

        <div className="conteudo-dinamico">
          {!navCategoria && (
            <div className="folder-grid">
              {(Object.keys(CATEGORIAS_DEF) as CategoriaRaiz[]).map(
                (categoriaRaiz) => (
                  <div
                    key={categoriaRaiz}
                    className={`folder-card ${CATEGORIAS_DEF[categoriaRaiz].tema}`}
                    onClick={() => setNavCategoria(categoriaRaiz)}
                  >
                    <div className="folder-icon">
                      <i
                        className={`fas ${CATEGORIAS_DEF[categoriaRaiz].icone}`}
                      ></i>
                    </div>
                    <div className="folder-info">
                      <span className="folder-title">{categoriaRaiz}</span>
                      <span className="folder-subtitle">
                        {ESTRUTURA_PASTAS[categoriaRaiz].length} subcategorias
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {navCategoria && !navSubcategoria && (
            <div className="folder-grid">
              {ESTRUTURA_PASTAS[navCategoria].map((subcategoria) => {
                const qtdItens = pecas.filter(
                  (p) =>
                    p.categoria === navCategoria &&
                    p.subcategoria === subcategoria,
                ).length;

                return (
                  <div
                    key={subcategoria}
                    className={`folder-card ${CATEGORIAS_DEF[navCategoria].tema}`}
                    onClick={() => setNavSubcategoria(subcategoria)}
                  >
                    <div className="folder-icon">
                      <i
                        className={`fas ${
                          qtdItens > 0 ? "fa-folder-open" : "fa-folder"
                        }`}
                      ></i>
                    </div>
                    <div className="folder-info">
                      <span className="folder-title">{subcategoria}</span>
                      <span className="folder-subtitle">
                        {qtdItens === 0
                          ? "Vazia"
                          : `${qtdItens} ${
                              qtdItens === 1 ? "item" : "itens"
                            }`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {navCategoria && navSubcategoria && (
            <div className="pecas-lista">
              {pecasDaSubcategoria.length > 0 ? (
                pecasDaSubcategoria.map(renderPecaCard)
              ) : (
                <div className="empty-state empty-state-full">
                  <i className="fas fa-box-open"></i>
                  <p>Nenhuma peça cadastrada nesta subcategoria.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL PEÇA */}
        {pecaVisualizar && (
          <div
            className="modal-overlay"
            onClick={() => setPecaVisualizar(null)}
          >
            <div
              className="modal modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <i className="fas fa-cube"></i> Detalhes do Componente
                </h2>
                <button
                  className="btn-close"
                  onClick={() => setPecaVisualizar(null)}
                >
                  <i className="fas fa-xmark"></i>
                </button>
              </div>

              <div className="view-details">
                <div className="view-item">
                  <span className="view-label">Nome</span>
                  <span className="view-value">
                    {pecaVisualizar.nome}
                  </span>
                </div>

                <div className="vinculos-section">
                  <h4 className="vinculos-header">
                    Normativas Aplicáveis
                  </h4>

                  {pecaVisualizar.normasVinculadas.length > 0 ? (
                    <div className="vinculos-lista">
                      {pecaVisualizar.normasVinculadas.map((id) => {
                        const norma = normas.find((n) => n.id === id);
                        if (!norma) return null;

                        return (
                          <div key={id} className="vinculo-norma-card">
                            <span>{norma.id}</span>

                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() =>
                                setNormaDetalheVisualizar(norma)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state compact">
                      <p>Nenhuma normativa vinculada.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setPecaVisualizar(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL NORMA */}
        {normaDetalheVisualizar && (
          <div
            className="modal-overlay"
            onClick={() => setNormaDetalheVisualizar(null)}
          >
            <div
              className="modal modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Detalhes da Norma</h2>
              </div>

              <div className="view-details">
                <div className="view-item">
                  <span className="view-label">ID</span>
                  <span className="view-value">
                    {normaDetalheVisualizar.id}
                  </span>
                </div>

                <div className="view-item">
                  <span className="view-label">Título</span>
                  <span className="view-value">
                    {normaDetalheVisualizar.titulo}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => setNormaDetalheVisualizar(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
