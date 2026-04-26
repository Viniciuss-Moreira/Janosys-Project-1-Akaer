// Componente para exibir as peças relacionadas a uma norma
// não sabia onde colocar isso, então tirei as peças do Home.tsx e coloquei nesse helper pra facilitar a organização e deixar a exibição de peças centralizado em um arquivo só

export interface Peca {
  nome: string;
  categoria: string;
  subcategoria: string;
  normasVinculadas: string[];
}

const CHAVE_PECAS_STORAGE = "biblioteca_pecas";

export const PECAS_BASE: Peca[] = [
  { nome: "Tubo", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Usinado", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Chapa", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: [] },
  { nome: "Extrudado", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Fundido", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tratamento Superficial", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Teste", categoria: "PEÇA", subcategoria: "METÁLICA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Material Composto", categoria: "PEÇA", subcategoria: "NÃO METÁLICA", normasVinculadas: ["FAR 25.571", "ISO 9001:2015"] },
  { nome: "Tubo com Acessório", categoria: "CONJUNTO", subcategoria: "INSTALAÇÃO DE ACESSÓRIOS", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Soldagem", categoria: "CONJUNTO", subcategoria: "UNIÃO DE PEÇAS", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Proteção", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Bota", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: [] },
  { nome: "Conector", categoria: "CONJUNTO", subcategoria: "CABLAGEM", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Conjunto Estrutural", categoria: "INSTALAÇÃO", subcategoria: "ESTRUTURA", normasVinculadas: ["FAR 25.571"] },
  { nome: "Válvula Hidromecânica", categoria: "INSTALAÇÃO", subcategoria: "HIDROMECÂNICOS", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Chicote Elétrico Principal", categoria: "INSTALAÇÃO", subcategoria: "ELÉTRICA", normasVinculadas: ["RBAC 25.1309"] },
  { nome: "Selante", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Metalização", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Rebite", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Parafuso", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Arruela", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Inserto", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: [] },
  { nome: "Frenagem", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Shim", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["FAR 25.571"] },
  { nome: "Primer", categoria: "INSTALAÇÃO", subcategoria: "GERAL", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Corpo de Prova de Vibração", categoria: "INSTALAÇÃO", subcategoria: "TESTE", normasVinculadas: ["FAR 25.571"] },
  { nome: "Nota de Desenho Padrão", categoria: "GERAL", subcategoria: "BASIC NOTES", normasVinculadas: ["ISO 9001:2015"] },
  { nome: "Plaqueta de Identificação", categoria: "GERAL", subcategoria: "IDENTIFICAÇÃO", normasVinculadas: ["ISO 9001:2015"] },
];

function ehPeca(valor: unknown): valor is Peca {
  if (!valor || typeof valor !== "object") return false;
  const peca = valor as Partial<Peca>;
  return (
    typeof peca.nome === "string" &&
    typeof peca.categoria === "string" &&
    typeof peca.subcategoria === "string" &&
    Array.isArray(peca.normasVinculadas) &&
    peca.normasVinculadas.every((normaId) => typeof normaId === "string")
  );
}

export function carregarPecas(): Peca[] {
  const pecasSalvas = localStorage.getItem(CHAVE_PECAS_STORAGE);
  if (!pecasSalvas) return PECAS_BASE;

  try {
    const parsed = JSON.parse(pecasSalvas);
    if (!Array.isArray(parsed) || !parsed.every(ehPeca)) return PECAS_BASE;
    return parsed;
  } catch {
    return PECAS_BASE;
  }
}

export function salvarPecas(pecas: Peca[]): void {
  localStorage.setItem(CHAVE_PECAS_STORAGE, JSON.stringify(pecas));
}

export function listarPecasRelacionadas(pecas: Peca[], normaId: string): Peca[] {
  return pecas
    .filter((peca) => peca.normasVinculadas.includes(normaId))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
