import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import PDFDocument from "pdfkit";

import Pedido from "@/models/Pedido";
import PedidoItem from "@/models/PedidoItem";
import Produto from "@/models/Produto";
import Endereco from "@/models/Endereco";
import Cupom from "@/models/Cupom";
import User from "@/models/User";

import { verificarToken } from "@/lib/auth";
import { expirarPedidosPendentes } from "@/lib/pedidos";

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor || 0));
}

function formatarStatus(status: string) {
  const nomes: Record<string, string> = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pago",
    preparando: "Preparando",
    enviado: "Enviado",
    entregue: "Entregue",
    cancelado: "Cancelado",
    expirado: "Expirado",
    processando_pix: "Processando PIX",
  };

  return nomes[status] || status;
}

function textoSeguro(valor: any) {
  return String(valor || "").trim();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    await expirarPedidosPendentes();

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        erro: "Não autenticado",
      });
    }

    const userToken: any = verificarToken(token);

    if (!userToken?.id) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    const pedidoId = Number(req.query.pedidoId);

    if (!pedidoId || Number.isNaN(pedidoId) || !Number.isInteger(pedidoId)) {
      return res.status(400).json({
        erro: "Pedido inválido",
      });
    }

    const pedido: any = await Pedido.findOne({
      where: {
        id: pedidoId,
        user_id: userToken.id,
      },

      include: [
        {
          model: User,
          as: "user",
          required: false,
          attributes: ["id", "nome", "email", "cpf", "numero_telefone"],
        },
        {
          model: Endereco,
          as: "endereco",
          required: false,
        },
        {
          model: Cupom,
          as: "cupom",
          required: false,
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    const itens: any[] = await PedidoItem.findAll({
      where: {
        pedido_id: pedido.id,
      },

      include: [
        {
          model: Produto,
          as: "produto",
          required: false,
        },
      ],

      order: [["id", "ASC"]],
    });

    const nomeArquivo = `recibo-pedido-${pedido.id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${nomeArquivo}"`,
    );

    const doc = new PDFDocument({
      size: "A4",
      margin: 45,
    });

    doc.pipe(res);

    const larguraPagina = doc.page.width;
    const margem = 45;

    // Cabeçalho
    doc.fontSize(22).fillColor("#111111").text("LG TRAMBICAGENS", margem, 45, {
      align: "left",
    });

    doc
      .fontSize(10)
      .fillColor("#666666")
      .text("Recibo / Comprovante de pedido", margem, 72);

    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Emitido em: ${new Date().toLocaleString("pt-BR")}`, margem, 88);

    doc
      .moveTo(margem, 112)
      .lineTo(larguraPagina - margem, 112)
      .strokeColor("#dddddd")
      .stroke();

    // Dados do pedido
    doc.moveDown(2);

    doc
      .fontSize(16)
      .fillColor("#111111")
      .text(`Pedido #${pedido.id}`, margem, 130);

    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(`Status: ${formatarStatus(pedido.status)}`, margem, 155)
      .text(
        `Data do pedido: ${new Date(pedido.createdAt).toLocaleString("pt-BR")}`,
      );

    if (pedido.expiresAt && pedido.status === "aguardando_pagamento") {
      doc.text(
        `Expira em: ${new Date(pedido.expiresAt).toLocaleString("pt-BR")}`,
      );
    }

    doc.moveDown();

    // Cliente
    doc.fontSize(14).fillColor("#111111").text("Cliente", {
      underline: true,
    });

    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(`Nome: ${textoSeguro(pedido.user?.nome) || "Não informado"}`)
      .text(`Email: ${textoSeguro(pedido.user?.email) || "Não informado"}`);

    if (pedido.user?.cpf) {
      doc.text(`CPF: ${pedido.user.cpf}`);
    }

    if (pedido.user?.numero_telefone) {
      doc.text(`Telefone: ${pedido.user.numero_telefone}`);
    }

    doc.moveDown();

    // Endereço
    doc.fontSize(14).fillColor("#111111").text("Entrega", {
      underline: true,
    });

    if (pedido.endereco) {
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(
          `${pedido.endereco.rua}, ${pedido.endereco.numero} - ${pedido.endereco.bairro}`,
        )
        .text(`${pedido.endereco.cidade}/${pedido.endereco.estado}`)
        .text(`CEP: ${pedido.endereco.cep || "Não informado"}`);

      if (pedido.endereco.complemento) {
        doc.text(`Complemento: ${pedido.endereco.complemento}`);
      }
    } else {
      doc.fontSize(11).fillColor("#333333").text("Endereço não informado.");
    }

    doc.moveDown();

    // Itens
    doc.fontSize(14).fillColor("#111111").text("Produtos", {
      underline: true,
    });

    doc.moveDown(0.5);

    const inicioTabelaY = doc.y;

    doc
      .fontSize(10)
      .fillColor("#111111")
      .text("Produto", margem, inicioTabelaY)
      .text("Qtd", 330, inicioTabelaY)
      .text("Unitário", 380, inicioTabelaY)
      .text("Subtotal", 465, inicioTabelaY);

    doc
      .moveTo(margem, inicioTabelaY + 15)
      .lineTo(larguraPagina - margem, inicioTabelaY + 15)
      .strokeColor("#dddddd")
      .stroke();

    doc.y = inicioTabelaY + 24;

    for (const item of itens) {
      const nomeProduto = textoSeguro(item.produto?.nome) || "Produto removido";
      const quantidade = Number(item.quantidade || 0);
      const precoUnitario = Number(item.preco_unitario || 0);
      const subtotal = quantidade * precoUnitario;

      const yAtual = doc.y;

      if (yAtual > 720) {
        doc.addPage();
        doc.y = 55;
      }

      doc.fontSize(10).fillColor("#333333").text(nomeProduto, margem, doc.y, {
        width: 260,
      });

      const yLinha = yAtual;

      doc
        .fontSize(10)
        .text(String(quantidade), 330, yLinha)
        .text(formatarMoeda(precoUnitario), 380, yLinha)
        .text(formatarMoeda(subtotal), 465, yLinha);

      doc.moveDown(0.8);

      if (item.cor || item.tamanho) {
        doc
          .fontSize(9)
          .fillColor("#666666")
          .text(
            `Cor: ${item.cor || "Não informado"} | Tamanho: ${
              item.tamanho || "Não informado"
            }`,
            margem,
          );

        doc.moveDown(0.4);
      }
    }

    doc.moveDown();

    doc
      .moveTo(margem, doc.y)
      .lineTo(larguraPagina - margem, doc.y)
      .strokeColor("#dddddd")
      .stroke();

    doc.moveDown();

    // Resumo financeiro
    const totalProdutos = Number(pedido.total_produtos || 0);
    const freteValor = Number(pedido.frete_valor || 0);
    const descontoValor = Number(pedido.desconto_valor || 0);
    const totalFinal = Number(pedido.total || 0);

    doc.fontSize(14).fillColor("#111111").text("Resumo financeiro", {
      underline: true,
    });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(`Total dos produtos: ${formatarMoeda(totalProdutos)}`)
      .text(
        `Frete: ${formatarMoeda(freteValor)}${
          pedido.frete_tipo ? ` (${pedido.frete_tipo})` : ""
        }`,
      )
      .text(`Desconto: - ${formatarMoeda(descontoValor)}`);

    if (pedido.cupom) {
      doc.text(`Cupom usado: ${pedido.cupom.codigo}`);
    }

    doc.moveDown(0.7);

    doc
      .fontSize(16)
      .fillColor("#111111")
      .text(`Total final: ${formatarMoeda(totalFinal)}`);

    doc.moveDown(2);

    doc
      .fontSize(9)
      .fillColor("#777777")
      .text(
        "Este documento é um recibo gerado automaticamente pelo sistema LG TRAMBICAGENS. Obrigado pela preferência! :)  ",
        {
          align: "center",
        },
      );

    doc.end();
  } catch (err: any) {
    console.error("ERRO GERAR RECIBO:", err);

    if (!res.headersSent) {
      return res.status(500).json({
        erro: err?.message || "Erro ao gerar recibo",
      });
    }

    res.end();
  }
}
