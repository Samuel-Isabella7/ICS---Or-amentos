import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { hashSenha, tokenDe } from './auth.util';
import { DadosService } from './dados.service';

export interface Acesso {
  usuario: string;
  salt: string;
  hash: string;
}

// Acesso inicial do sistema — pode ser trocado nas Configurações
const USUARIO_PADRAO = 'Junior';
const SENHA_PADRAO = 'Samuel123';

@Injectable()
export class AuthService {
  private cache: Acesso | null = null;
  private resetVerificado = false;

  constructor(private readonly dados: DadosService) {}

  private criarPadrao(): Acesso {
    const salt = randomBytes(16).toString('hex');
    return { usuario: USUARIO_PADRAO, salt, hash: hashSenha(salt, SENHA_PADRAO) };
  }

  async obter(): Promise<Acesso> {
    if (!this.cache) {
      const tudo = await this.dados.carregarTudo();
      let acesso = (tudo.acesso as Acesso) || null;
      // Sem credenciais gravadas (primeiro uso), ou com RESETAR_ACESSO=1 no ambiente,
      // volta para o acesso padrão (Junior / Samuel123)
      if (!acesso || (!this.resetVerificado && process.env.RESETAR_ACESSO === '1')) {
        acesso = this.criarPadrao();
        await this.dados.salvarTudo({ ...tudo, acesso });
      }
      this.resetVerificado = true;
      this.cache = acesso;
    }
    return this.cache;
  }

  async validarLogin(usuario: string, senha: string): Promise<boolean> {
    const a = await this.obter();
    return (
      String(usuario || '').trim().toLowerCase() === a.usuario.toLowerCase() &&
      hashSenha(a.salt, String(senha || '')) === a.hash
    );
  }

  async validarSenha(senha: string): Promise<boolean> {
    const a = await this.obter();
    return hashSenha(a.salt, String(senha || '')) === a.hash;
  }

  async tokenAtual(): Promise<string> {
    const a = await this.obter();
    return tokenDe(a.usuario, a.hash);
  }

  // Troca usuário e/ou senha; com novaSenha vazia, mantém a senha atual
  async alterar(novoUsuario: string, novaSenha: string): Promise<void> {
    const atual = await this.obter();
    let acesso: Acesso;
    if (novaSenha) {
      const salt = randomBytes(16).toString('hex');
      acesso = { usuario: novoUsuario.trim(), salt, hash: hashSenha(salt, novaSenha) };
    } else {
      acesso = { ...atual, usuario: novoUsuario.trim() };
    }
    const tudo = await this.dados.carregarTudo();
    await this.dados.salvarTudo({ ...tudo, acesso });
    this.cache = acesso;
  }
}
