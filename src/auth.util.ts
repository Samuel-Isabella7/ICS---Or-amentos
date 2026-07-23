import { createHash } from 'crypto';

// A senha nunca é guardada em texto puro — só o hash com sal
export function hashSenha(salt: string, senha: string): string {
  return createHash('sha256').update(salt + ':' + senha).digest('hex');
}

// Token do cookie de sessão; muda quando usuário ou senha mudam (derruba sessões antigas)
export function tokenDe(usuario: string, hash: string): string {
  return createHash('sha256').update('ics-orcamentos:' + usuario + ':' + hash).digest('hex');
}

export function lerCookies(req: any): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const par of String(req.headers.cookie || '').split(';')) {
    const i = par.indexOf('=');
    if (i > 0) saida[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1).trim());
  }
  return saida;
}
