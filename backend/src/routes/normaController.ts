import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
// 🔍 GET /normas
export const listarNormas = async (req: Request, res: Response) => {
  try {
    const normas = await prisma.norma.findMany({
      include: {
        tipoNorma: true,
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        notas: {
          include: {
            nota: true,
          },
        },
        referenciasOrigem: {
          include: {
            destino: true,
          },
        },
      },
      orderBy: { id: "desc" }
    });

    res.json(normas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar normas" });
  }
};

// ➕ POST
export const criarNorma = async (req: Request, res: Response) => {
  try {
    const novaNorma = await prisma.norma.create({
      data: req.body,
      include: {
        tipoNorma: true,
        subcategoria: {
          include: { categoria: true },
        },
        notas: { include: { nota: true } },
        referenciasOrigem: { include: { destino: true } },
      },
    });

    res.status(201).json(novaNorma);
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(400).json({ erro: "Referência inválida" });
    }

    res.status(500).json({ erro: "Erro ao criar norma" });
  }
};

// ❌ DELETE
export const deletarNorma = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.norma.delete({
      where: { id },
    });

    res.json({ mensagem: "Norma deletada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao deletar norma" });
  }
};