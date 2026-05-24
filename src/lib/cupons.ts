import Cupom from "@/models/Cupom";

interface ResultadoCupom {
  cupom: any | null;
  desconto: number;
  erro: string | null;
}

export async function validarECacularCupom(
  cupomCodigo: string | null | undefined,
  totalProdutos: number,
  freteValor: number,
): Promise<ResultadoCupom> {
  if (!cupomCodigo) {
    return {
      cupom: null,
      desconto: 0,
      erro: null,
    };
  }

  const codigo = String(cupomCodigo).trim().toUpperCase();

  if (!codigo || codigo.length > 40) {
    return {
      cupom: null,
      desconto: 0,
      erro: "Cupom inválido",
    };
  }

  const cupom: any = await Cupom.findOne({
    where: {
      codigo,
    },
  });

  if (!cupom) {
    return {
      cupom: null,
      desconto: 0,
      erro: "Cupom não encontrado",
    };
  }

  if (!cupom.ativo) {
    return {
      cupom: null,
      desconto: 0,
      erro: "Cupom inativo",
    };
  }

  if (
    cupom.data_expiracao &&
    new Date(cupom.data_expiracao).getTime() < Date.now()
  ) {
    return {
      cupom: null,
      desconto: 0,
      erro: "Cupom expirado",
    };
  }

  if (
    cupom.uso_maximo !== null &&
    cupom.uso_maximo !== undefined &&
    Number(cupom.usos_atual || 0) >= Number(cupom.uso_maximo)
  ) {
    return {
      cupom: null,
      desconto: 0,
      erro: "Cupom esgotado",
    };
  }

  if (Number(totalProdutos) < Number(cupom.valor_minimo_pedido || 0)) {
    return {
      cupom: null,
      desconto: 0,
      erro: `Pedido mínimo para este cupom é ${Number(
        cupom.valor_minimo_pedido,
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}`,
    };
  }

  let desconto = 0;

  if (cupom.tipo === "percentual") {
    desconto = (Number(totalProdutos) * Number(cupom.valor)) / 100;
  }

  if (cupom.tipo === "fixo") {
    desconto = Number(cupom.valor);
  }

  if (cupom.tipo === "frete_gratis") {
    desconto = Number(freteValor || 0);
  }

  const totalComFrete = Number(totalProdutos || 0) + Number(freteValor || 0);

  if (desconto > totalComFrete) {
    desconto = totalComFrete;
  }

  if (desconto < 0) {
    desconto = 0;
  }

  return {
    cupom,
    desconto: Number(desconto.toFixed(2)),
    erro: null,
  };
}
