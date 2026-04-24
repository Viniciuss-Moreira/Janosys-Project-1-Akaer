import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import "../components/Sidebar";
import "../styles/Normas.css";

interface Norma {
  id: string;                    // identificador (string única)
  codigo: string;
  titulo: string;
  organizacao: string;           // orgao
  categoria: string;             // virá de subcategoria.categoria.descricao
  subcategoria: string;          // subcategoria.descricao
  item: string;                  // ainda não mapeado no schema (pode adicionar depois)
  tipo: string;                  // tipoNorma.descricao
  revisao: string;
  status: string;                // "Vigente" se status=true, "Revogada" se false
  notas: string[];
  referencias: string[];
  nomePdf?: string;
  urlPdf?: string;               // base64 ou URL real
  imagens?: string[];            // base64 ou URLs
}

interface ToastMsg {
  id: number;
  tipo: "erro" | "sucesso";
  mensagem: string;
}

interface ConfirmacaoState {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
}

const converterParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.readAsDataURL(arquivo);
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = (erro) => reject(erro);
  });
};

const ORGANIZACOES = [
  "ANAC", "FAA", "EASA", "ICAO", "DoD", "SAE", "ISO", "AKAER",
];

const CATEGORIAS = ["Peça", "Conjunto", "Instalação", "Geral"];

const SUBCATEGORIAS: Record<string, string[]> = {
  Peça: ["Metálica", "Não Metálica"],
  Conjunto: ["Instalação de Acessórios", "União de Peças", "Cablagem"],
  Instalação: ["Estrutura", "Hidromecânicos", "Elétrica", "Geral", "Teste"],
  Geral: ["Basic Notes", "Identificação"],
};

const ITENS_POR_SUBCATEGORIA: Record<string, string[]> = {
  Metálica: ["Tubo", "Usinado", "Chapa", "Extrudado", "Fundido", "Tratamento Superficial", "Teste"],
  "Instalação de Acessórios": ["Tubo com Acessório"],
  "União de Peças": ["Soldagem"],
  Cablagem: ["Proteção", "Bota", "Conector"],
  Geral: ["Selante", "Metalização", "Rebite", "Parafuso", "Arruela", "Inserto", "Frenagem", "Shim", "Primer"],
};

const STATUS_OPCOES = ["Vigente", "Revogada"];

const ORG_ORIGENS: Record<string, string> = {
  ANAC: "🇧🇷", FAA: "🇺🇸", EASA: "🇪🇺", ICAO: "🌐",
  DoD: "🇺🇸", SAE: "🇺🇸", ISO: "🌐", AKAER: "🇧🇷",
};

const CAT_ICONES: Record<string, string> = {
  Peça: "fa-gear",
  Conjunto: "fa-gears",
  Instalação: "fa-screwdriver-wrench",
  Geral: "fa-layer-group",
};

const FORM_INICIAL: Partial<Norma> = {
  id: "",
  codigo: "",
  titulo: "",
  organizacao: ORGANIZACOES[0],
  categoria: CATEGORIAS[0],
  subcategoria: SUBCATEGORIAS[CATEGORIAS[0]][0],
  item: "",
  tipo: "Pública",
  revisao: "",
  status: "Vigente",
  notas: [""],
  referencias: [""],
};

function ToastContainer({ toasts, onRemover }: { toasts: ToastMsg[]; onRemover: (id: number) => void; }) {
  return (
    <div className="toast-container">
      {toasts.map((toastAtual) => (
        <div key={toastAtual.id} className={`toast toast-${toastAtual.tipo}`}>
          <i className={`fas ${toastAtual.tipo === "sucesso" ? "fa-check-circle" : "fa-circle-exclamation"}`}></i>
          <span>{toastAtual.mensagem}</span>
          <button className="toast-close" onClick={() => onRemover(toastAtual.id)}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
      ))}
    </div>
  );
}

// ... (ModalConfirmacao, PdfViewer, ImageLightbox, NormaCardItem permanecem iguais — não alterei para manter a UI)

export default function Biblioteca() {
  const [normas, setNormas] = useState<Norma[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar normas do backend real
  useEffect(() => {
    const carregarNormas = async () => {
      try {
        const res = await fetch("http://localhost:3000/normas");
        if (!res.ok) throw new Error("Erro ao carregar normas");

        const data = await res.json();

        const normasFormatadas: Norma[] = data.map((norma: any) => ({
          id: norma.identificador,
          codigo: norma.identificador,
          titulo: norma.titulo,
          organizacao: norma.orgao,
          categoria: norma.subcategoria?.categoria?.descricao || "",
          subcategoria: norma.subcategoria?.descricao || "",
          item: "", // campo não existe ainda no schema Prisma — adicione se necessário
          tipo: norma.tipoNorma?.descricao || "Pública",
          revisao: norma.revisao || "",
          status: norma.status ? "Vigente" : "Revogada",
          notas: norma.notas?.map((n: any) => n.nota.descricao) || [],
          referencias: norma.referenciasOrigem?.map((r: any) => r.destino.identificador) || [],
          nomePdf: norma.urlPdf ? "pdf-anexado.pdf" : undefined, // ajuste conforme seu backend
          urlPdf: norma.urlPdf,
          imagens: norma.imagemUrl ? [norma.imagemUrl] : [], // ajuste se tiver múltiplas imagens
        }));

        setNormas(normasFormatadas);
      } catch (erro) {
        console.error(erro);
        // adicionarToast("erro", "Erro ao carregar normas do servidor.");
      } finally {
        setLoading(false);
      }
    };

    carregarNormas();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [stepModal, setStepModal] = useState(1);
  const [normaVisualizar, setNormaVisualizar] = useState<Norma | null>(null);
  const [erroCampos, setErroCampos] = useState<Partial<Record<keyof Norma, string>>>({});

  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [filtroItem, setFiltroItem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [pdfAberto, setPdfAberto] = useState<{ url: string; nome: string } | null>(null);
  const [imagemAbertaIdx, setImagemAbertaIdx] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const adicionarToast = useCallback((tipo: ToastMsg["tipo"], mensagem: string) => {
    const idToast = Date.now();
    setToasts((prev) => [...prev, { id: idToast, tipo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== idToast)), 4000);
  }, []);

  const removerToast = (idToastParaRemover: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== idToastParaRemover));

  const [confirmacao, setConfirmacao] = useState<ConfirmacaoState>({
    visivel: false,
    titulo: "",
    mensagem: "",
    onConfirmar: () => {},
  });

  const pedirConfirmacao = (titulo: string, mensagem: string, onConfirmar: () => void) => {
    setConfirmacao({ visivel: true, titulo, mensagem, onConfirmar });
  };

  const fecharConfirmacao = () => setConfirmacao((prev) => ({ ...prev, visivel: false }));

  const [form, setForm] = useState<Partial<Norma>>(FORM_INICIAL);
  const updateForm = (campo: keyof Norma, valor: unknown) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erroCampos[campo]) {
      setErroCampos((prev) => ({ ...prev, [campo]: undefined }));
    }
  };

  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null);
  const [arquivosImagens, setArquivosImagens] = useState<File[]>([]);

  const handlePdfChange = (evento: ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files?.[0]) setArquivoPdf(evento.target.files[0]);
  };

  const handleImgChange = (evento: ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files) {
      setArquivosImagens((prev) => [...prev, ...Array.from(evento.target.files!)]);
    }
  };

  // ... (filtros, limparFiltros, handleMudancaCategoriaFiltro, etc. permanecem iguais)

  const normasFiltradas = normas.filter((normaAtual) => {
    const termoMinusculo = termoPesquisa.toLowerCase();
    const matchBusca = normaAtual.id.toLowerCase().includes(termoMinusculo) ||
                       normaAtual.codigo.toLowerCase().includes(termoMinusculo) ||
                       normaAtual.titulo.toLowerCase().includes(termoMinusculo);

    const matchCategoria = filtroCategoria === "Todas" || normaAtual.categoria === filtroCategoria;
    const matchSubcategoria = !filtroSubcategoria || normaAtual.subcategoria === filtroSubcategoria;
    const matchItem = !filtroItem || normaAtual.item === filtroItem;
    const matchStatus = filtroStatus === "Todos" || normaAtual.status === filtroStatus;

    return matchBusca && matchCategoria && matchSubcategoria && matchItem && matchStatus;
  });

  const abrirModalCadastro = () => {
    setStepModal(1);
    setErroCampos({});
    setForm(FORM_INICIAL);
    setArquivoPdf(null);
    setArquivosImagens([]);
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
    setForm(FORM_INICIAL);
    setArquivoPdf(null);
    setArquivosImagens([]);
    setErroCampos({});
  };

  const handleProximoPasso = () => {
    const erros: typeof erroCampos = {};
    if (!form.id?.trim()) erros.id = "Campo obrigatório";
    if (!form.titulo?.trim()) erros.titulo = "Campo obrigatório";

    if (Object.keys(erros).length > 0) {
      setErroCampos(erros);
      adicionarToast("erro", "Preencha os campos obrigatórios.");
      return;
    }
    setStepModal((prev) => prev + 1);
  };

  // === SALVAR NO BACKEND REAL ===
  const handleSave = async () => {
    try {
      let stringBase64Pdf: string | undefined = undefined;
      if (arquivoPdf) {
        if (arquivoPdf.size > 3 * 1024 * 1024) {
          adicionarToast("erro", "PDF muito grande (máx 3MB).");
          return;
        }
        stringBase64Pdf = await converterParaBase64(arquivoPdf);
      }

      const stringsBase64Imagens = await Promise.all(
        arquivosImagens.map(async (arq) => {
          if (arq.size > 2 * 1024 * 1024) throw new Error(`Imagem ${arq.name} excede 2MB.`);
          return await converterParaBase64(arq);
        })
      );

      // Mapeamento para o schema Prisma
      const payload = {
        identificador: form.id!.trim(),
        titulo: form.titulo!.trim(),
        orgao: form.organizacao,
        revisao: form.revisao || null,
        status: form.status === "Vigente",
        urlPdf: stringBase64Pdf || null,
        // imagemUrl: stringsBase64Imagens[0] || null, // se for apenas uma imagem
        tipoNorma: { connectOrCreate: { where: { descricao: form.tipo }, create: { descricao: form.tipo } } },
        subcategoria: {
          connectOrCreate: {
            where: { descricao: form.subcategoria },
            create: {
              descricao: form.subcategoria!,
              categoria: {
                connectOrCreate: {
                  where: { descricao: form.categoria },
                  create: { descricao: form.categoria },
                },
              },
            },
          },
        },
        notas: {
          create: (form.notas || [])
            .filter((n) => n.trim())
            .map((descricao) => ({ nota: { create: { descricao } } })),
        },
        referenciasOrigem: {
          create: (form.referencias || [])
            .filter((r) => r.trim())
            .map((refId) => ({
              destino: { connect: { identificador: refId } }, // assume que já existe ou ajuste
            })),
        },
      };

      const res = await fetch("http://localhost:3000/normas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar norma");

      const novaNormaSalva = await res.json();

      // Atualiza lista local
      const novaNormaFormatada: Norma = {
        id: novaNormaSalva.identificador,
        codigo: novaNormaSalva.identificador,
        titulo: novaNormaSalva.titulo,
        organizacao: novaNormaSalva.orgao,
        categoria: form.categoria!,
        subcategoria: form.subcategoria!,
        item: form.item || "",
        tipo: form.tipo!,
        revisao: novaNormaSalva.revisao || "",
        status: novaNormaSalva.status ? "Vigente" : "Revogada",
        notas: form.notas?.filter((n) => n.trim()) || [],
        referencias: form.referencias?.filter((r) => r.trim()) || [],
        nomePdf: arquivoPdf?.name,
        urlPdf: stringBase64Pdf,
        imagens: stringsBase64Imagens,
      };

      setNormas((prev) => [novaNormaFormatada, ...prev]);
      fecharModal();
      adicionarToast("sucesso", `Norma "${novaNormaFormatada.id}" registrada com sucesso!`);
    } catch (erro: any) {
      console.error(erro);
      adicionarToast("erro", erro.message || "Erro ao salvar norma no servidor.");
    }
  };

  const handleDelete = (idParaExcluir: string) => {
    pedirConfirmacao(
      "Excluir norma",
      `Tem certeza que deseja excluir "${idParaExcluir}"?`,
      async () => {
        try {
          const res = await fetch(`http://localhost:3000/normas/${idParaExcluir}`, { method: "DELETE" });
          if (!res.ok) throw new Error("Erro ao excluir");

          setNormas((prev) => prev.filter((n) => n.id !== idParaExcluir));
          adicionarToast("sucesso", `Norma "${idParaExcluir}" excluída.`);
        } catch (e) {
          adicionarToast("erro", "Erro ao excluir norma.");
        }
        fecharConfirmacao();
      }
    );
  };

  // ... resto do return (JSX) permanece praticamente igual — só troque o useEffect antigo pelo novo

  if (loading) return <div className="page"><p>Carregando normas...</p></div>;

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} onRemover={removerToast} />
      {/* Todo o JSX anterior (header, filtros, lista de cards, modais, etc.) permanece idêntico */}
      {/* Apenas certifique-se de que onDelete e onView usam as funções atualizadas */}
    </div>
  );
}