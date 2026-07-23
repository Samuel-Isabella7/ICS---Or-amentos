import { createHash } from 'crypto';

// Token derivado da senha — o que vai no cookie nunca é a senha em si
export function tokenDe(senha: string): string {
  return createHash('sha256').update('ics-orcamentos:' + senha).digest('hex');
}

export function lerCookies(req: any): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const par of String(req.headers.cookie || '').split(';')) {
    const i = par.indexOf('=');
    if (i > 0) saida[par.slice(0, i).trim()] = decodeURIComponent(par.slice(i + 1).trim());
  }
  return saida;
}
