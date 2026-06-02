import type { NextApiRequest, NextApiResponse } from "next";

import "@/models";

import User from "@/models/User";
import { verificarToken } from "@/lib/auth";
import { Op } from "sequelize";
import { enviarCodigoEmail } from "@/lib/email";

function limparCPF(cpf: string) {
  return String(cpf || "").replace(/\D/g, "");
}

function limparTelefone(telefone: string) {
  return String(telefone || "").replace(/\D/g, "");
}

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarNome(nome: string) {
  const nomeLimpo = String(nome || "").trim();

  if (nomeLimpo.length < 3) return false;
  if (nomeLimpo.length > 80) return false;

  return /^[a-zA-ZÀ-ÿ\s]+$/.test(nomeLimpo);
}

function validarCPF(cpf: string) {
  cpf = limparCPF(cpf);

  if (!cpf) return true;

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito1 = 11 - (soma % 11);

  if (digito1 >= 10) digito1 = 0;

  if (digito1 !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  let digito2 = 11 - (soma % 11);

  if (digito2 >= 10) digito2 = 0;

  if (digito2 !== Number(cpf[10])) return false;

  return true;
}

function validarTelefone(telefone: string) {
  const telefoneLimpo = limparTelefone(telefone);

  if (!telefoneLimpo) return true;

  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11;
}

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
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

    const { nome, email, cpf, numero_telefone } = req.body;

    const nomeLimpo = String(nome || "").trim();
    const emailLimpo = String(email || "")
      .trim()
      .toLowerCase();
    const cpfLimpo = limparCPF(cpf || "");
    const telefoneLimpo = limparTelefone(numero_telefone || "");

    if (!validarNome(nomeLimpo)) {
      return res.status(400).json({
        erro: "Nome inválido. Use apenas letras e pelo menos 3 caracteres.",
      });
    }

    if (!emailLimpo || !validarEmail(emailLimpo)) {
      return res.status(400).json({
        erro: "Email inválido.",
      });
    }

    if (!validarCPF(cpfLimpo)) {
      return res.status(400).json({
        erro: "CPF inválido.",
      });
    }

    if (!validarTelefone(telefoneLimpo)) {
      return res.status(400).json({
        erro: "Telefone inválido. Use DDD + número.",
      });
    }

    const usuario: any = await User.findByPk(userToken.id);

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      });
    }

    const emailAtual = String(usuario.email || "")
      .trim()
      .toLowerCase();

    const emailExiste = await User.findOne({
      where: {
        email: emailLimpo,
        id: {
          [Op.ne]: usuario.id,
        },
      },
    });

    if (emailExiste) {
      return res.status(400).json({
        erro: "Este email já está em uso.",
      });
    }

    if (cpfLimpo) {
      const cpfExiste = await User.findOne({
        where: {
          cpf: cpfLimpo,
          id: {
            [Op.ne]: usuario.id,
          },
        },
      });

      if (cpfExiste) {
        return res.status(400).json({
          erro: "Este CPF já está em uso.",
        });
      }
    }

    if (telefoneLimpo) {
      const telefoneExiste = await User.findOne({
        where: {
          numero_telefone: telefoneLimpo,
          id: {
            [Op.ne]: usuario.id,
          },
        },
      });

      if (telefoneExiste) {
        return res.status(400).json({
          erro: "Este telefone já está em uso.",
        });
      }
    }

    if (emailLimpo !== emailAtual) {
      const codigo = gerarCodigo();

      await usuario.update({
        nome: nomeLimpo,
        cpf: cpfLimpo || null,
        numero_telefone: telefoneLimpo || null,

        email_pendente: emailLimpo,
        codigo_verificacao: codigo,
      });

      await enviarCodigoEmail(emailLimpo, codigo);

      return res.status(200).json({
        sucesso: true,
        emailAlterado: true,
        mensagem:
          "Dados atualizados. Enviamos um código para o novo email. Confirme para concluir a alteração.",
      });
    }

    await usuario.update({
      nome: nomeLimpo,
      cpf: cpfLimpo || null,
      numero_telefone: telefoneLimpo || null,
    });

    return res.status(200).json({
      sucesso: true,
      emailAlterado: false,
      mensagem: "Informações atualizadas com sucesso.",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        numero_telefone: usuario.numero_telefone,
        acesso: usuario.acesso,
      },
    });
  } catch (err: any) {
    console.error("ERRO AO ATUALIZAR PERFIL:", err);

    return res.status(500).json({
      erro: err?.message || "Erro ao atualizar perfil",
    });
  }
}
