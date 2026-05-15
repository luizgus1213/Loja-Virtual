import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styles from "./perfil.module.css";
import Cropper from "react-easy-crop";
import validarCPF from "@/lib/validarCPF";
import { getCroppedImg } from "@/lib/cropImage";
import CaixaEndereco from "@/components/CaixaEndereco";

export default function Perfil() {
  const router = useRouter();
  const [imagemSrc, setImagemSrc] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tela, setTela] = useState<
    | "menu"
    | "editar"
    | "seguranca"
    | "cartoes"
    | "enderecos"
    | "privacidade"
    | "comunicacoes"
    | "outros"
  >("menu");
  const [foto, setFoto] = useState<File | null>(null);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    descricao: "",
  });

  const pegarIniciais = (nome: string) => {
    if (!nome) return "?";

    const partes = nome.trim().split(" ");

    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }

    return (partes[0][0] + partes[1][0]).toUpperCase();
  };
  const carregarUsuario = async () => {
    try {
      const res = await axios.get("/api/auth/me", {
        withCredentials: true,
      });

      setUser(res.data);
      if (!res.data.email_verificado && res.data.codigo_verificacao) {
        router.push("/verificar-email");
        return;
      }

      setForm({
        nome: res.data.nome || "",
        email: res.data.email || "",
        telefone: res.data.numero_telefone || "",
        cpf: res.data.cpf || "",
        descricao: res.data.descricao || "",
      });
    } catch {
      setUser(null);
    }
  };

  const enviarFoto = async () => {
    if (!foto || !imagemSrc || !croppedAreaPixels) {
      return alert("Selecione uma imagem");
    }

    try {
      const croppedBlob = await getCroppedImg(imagemSrc, croppedAreaPixels);

      if (!croppedBlob) {
        return alert("Erro ao cortar imagem");
      }

      const arquivoFinal = new File([croppedBlob], "perfil.jpg", {
        type: "image/jpeg",
      });

      const formData = new FormData();

      formData.append("foto", arquivoFinal);

      await axios.post("/api/user/uploadFoto", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      alert("Foto atualizada!");

      setImagemSrc(null);

      carregarUsuario();
    } catch (err) {
      console.log(err);
      alert("Erro ao enviar foto");
    }
  };
  useEffect(() => {
    carregarUsuario();
  }, []);
  const alterarSenha = async () => {
    try {
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        return alert("Preencha tudo");
      }

      if (novaSenha.length < 6) {
        return alert("Nova senha muito curta");
      }

      if (novaSenha !== confirmarSenha) {
        return alert("As senhas não coincidem");
      }

      await axios.post(
        "/api/user/alterar-senha",
        {
          senhaAtual,
          novaSenha,
        },
        {
          withCredentials: true,
        },
      );

      alert("Senha alterada!");

      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      setTela("menu");
    } catch (err: any) {
      alert(err?.response?.data?.erro || "Erro ao alterar senha");
    }
  };
  const salvar = async () => {
    if (form.cpf) {
      const cpfValido = validarCPF(form.cpf);

      if (!cpfValido) {
        return alert("CPF inválido");
      }
    }
    try {
      const res = await axios.post(
        "/api/user/update",
        {
          nome: form.nome,
          email: form.email,
          numero_telefone: form.telefone,
          cpf: form.cpf,
          descricao: form.descricao,
        },
        { withCredentials: true },
      );

      if (res.data.precisaVerificarEmail) {
        alert("Você precisa verificar seu novo e-mail");

        router.push(`/verificar-email?email=${res.data.emailNovo}`);
        return;
      }

      alert("Salvo!");
      setTela("menu");
      carregarUsuario();
    } catch {
      alert("Erro ao salvar");
    }
  };

  if (!user) {
    return <h1 className={styles.naoLogado}>Você precisa estar logado</h1>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.botaoVoltar}
          onClick={() => {
            if (tela !== "menu") {
              setTela("menu");
            } else {
              router.push("/");
            }
          }}
        >
          {" "}
          <span className={styles.seta}>‹ </span>
          Voltar
        </button>
      </div>

      <div className={styles.card}>
        {tela === "menu" && (
          <>
            <div className={styles.topoHorizontal}>
              <img
                src={
                  user.foto_perfil?.link
                    ? `/${user.foto_perfil.link}`
                    : "/perfil.png"
                }
                className={styles.fotoTopo}
              />
              <div>
                <h2 className={styles.nome}>{user.nome}</h2>

                <p className={styles.sub}>Conta ativa</p>
              </div>
            </div>

            <div className={styles.lista}>
              <div className={styles.item} onClick={() => setTela("editar")}>
                <div>
                  <strong>Informações do seu perfil</strong>
                  <p>Não validado</p>
                </div>
                <span>›</span>
              </div>

              <div className={styles.lista}>
                <div
                  className={styles.item}
                  onClick={() => setTela("seguranca")}
                >
                  <strong>Segurança</strong>
                  <p>Não validado</p>
                  <span>›</span>
                </div>
              </div>

              <div className={styles.item} onClick={() => setTela("outros")}>
                <strong>Outros</strong>
                <span>›</span>
              </div>

              <div className={styles.item} onClick={() => setTela("cartoes")}>
                <strong>Cartões</strong>
                <span>›</span>
              </div>

              <div className={styles.item} onClick={() => setTela("enderecos")}>
                <strong>Endereços</strong>
                <span>›</span>
              </div>

              <div
                className={styles.item}
                onClick={() => setTela("privacidade")}
              >
                <strong>Privacidade</strong>
                <span>›</span>
              </div>

              <div
                className={styles.item}
                onClick={() => setTela("comunicacoes")}
              >
                <strong>Comunicações</strong>
                <span>›</span>
              </div>
            </div>
          </>
        )}
        {tela === "seguranca" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Segurança</h2>

            <div className={styles.bloco}>
              <label>Senha atual</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />

              <label>Nova senha</label>
              <input
                type="password"
                placeholder="Nova senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />

              <label>Confirmar senha</label>
              <input
                type="password"
                placeholder="Confirme a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>

            <button className={styles.botaoSalvar} onClick={alterarSenha}>
              Atualizar senha
            </button>
          </div>
        )}
        {tela === "cartoes" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Cartões</h2>

            <div className={styles.bloco}>
              <p>Nenhum cartão cadastrado.</p>
            </div>

            <button className={styles.botaoSalvar}>Adicionar cartão</button>
          </div>
        )}

        {tela === "enderecos" && (
          <>
            {user.enderecos.map((endereco: any) => (
              <CaixaEndereco
                key={endereco.id}
                endereco={endereco}
                modo="atualizar"
                carregarUsuario={carregarUsuario}
              />
            ))}
            <CaixaEndereco modo="cadastrar" carregarUsuario={carregarUsuario} />
          </>
        )}
        {tela === "privacidade" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Privacidade</h2>

            <div className={styles.bloco}>
              <label>
                <input type="checkbox" />
                Perfil público
              </label>

              <label>
                <input type="checkbox" />
                Mostrar telefone
              </label>

              <label>
                <input type="checkbox" />
                Mostrar email
              </label>
            </div>
          </div>
        )}
        {tela === "comunicacoes" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Comunicações</h2>

            <div className={styles.bloco}>
              <label>
                <input type="checkbox" />
                Receber promoções
              </label>

              <label>
                <input type="checkbox" />
                Receber emails
              </label>

              <label>
                <input type="checkbox" />
                Receber notificações
              </label>
            </div>
          </div>
        )}
        {tela === "outros" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Em breve</h2>

            <div className={styles.bloco}>
              <p>Essa área ainda está em desenvolvimento.</p>
            </div>
          </div>
        )}
        {tela === "editar" && (
          <div className={styles.editarBox}>
            <h2 className={styles.titulo}>Informações do seu perfil</h2>
            <div className={styles.uploadFoto}>
              <input
                type="file"
                accept="image/*"
                ref={inputFotoRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  setFoto(file);

                  const reader = new FileReader();

                  reader.onload = () => {
                    setImagemSrc(reader.result as string);
                  };

                  reader.readAsDataURL(file);
                }}
              />

              <div
                className={styles.avatarEditor}
                onClick={() => inputFotoRef.current?.click()}
              >
                {imagemSrc ? (
                  <img src={imagemSrc} className={styles.avatarImagem} />
                ) : user.foto_perfil?.link ? (
                  <img
                    src={`/${user.foto_perfil.link}`}
                    className={styles.avatarImagem}
                  />
                ) : (
                  <span className={styles.avatarLetras}>
                    {pegarIniciais(user.nome)}
                  </span>
                )}

                <div className={styles.overlayAvatar}>Alterar foto</div>
              </div>

              {imagemSrc && (
                <>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 500,
                      height: 400,
                      background: "#1a1a1a",
                      borderRadius: 25,
                      overflow: "hidden",
                      margin: "20px auto",
                    }}
                  >
                    <Cropper
                      image={imagemSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={(_, croppedPixels) => {
                        setCroppedAreaPixels(croppedPixels);
                      }}
                    />
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className={styles.sliderZoom}
                  />

                  <button
                    className={styles.botaoSalvarFoto}
                    onClick={enviarFoto}
                  >
                    Salvar foto
                  </button>
                </>
              )}
            </div>
            <p className={styles.descricaoTopo}>
              Você pode adicionar, alterar ou corrigir suas informações pessoais
              e os dados da conta.
            </p>

            <div className={styles.bloco}>
              <h3>Dados pessoais</h3>

              <label>Nome de preferência</label>
              <input
                className={styles.fonte}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>

            <div className={styles.bloco}>
              <h3>Dados da conta</h3>

              <label>E-mail</label>

              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <label>Telefone</label>

              <input
                id="telefone"
                type="tel"
                className={styles.fonte}
                placeholder="(31) 99999-9999"
                maxLength={15}
                value={form.telefone}
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, "");

                  if (valor.length > 2) {
                    valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
                  }
                  if (valor.length > 10) {
                    valor = `${valor.slice(0, 10)}-${valor.slice(10, 14)}`;
                  }

                  setForm({ ...form, telefone: valor });
                }}
              />
              <label>CPF</label>

              <input
                type="text"
                placeholder="000.000.000-00"
                maxLength={14}
                value={form.cpf}
                disabled={user.cpf_verificado}
                onChange={(e) => {
                  let valor = e.target.value.replace(/\D/g, "");

                  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
                  valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
                  valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

                  setForm({ ...form, cpf: valor });
                }}
              />

              {user.cpf_verificado ? (
                <p style={{ color: "#22c55e", marginBottom: 15 }}>
                  CPF verificado ✅
                </p>
              ) : (
                <p style={{ color: "#f59e0b", marginBottom: 15 }}>
                  CPF não verificado
                </p>
              )}
              <label>Descrição</label>
              <textarea
                className={styles.fonte}
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </div>

            <button className={styles.botaoSalvar} onClick={salvar}>
              Salvar alterações
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
