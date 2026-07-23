import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

const DURACAO_SESSAO = 60 * 60 * 3; // 3 horas

function cookieSeguro(req: any): string {
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || '');
  return proto.includes('https') ? '; Secure' : '';
}

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private async gravarCookie(req: any, res: any) {
    const token = await this.auth.tokenAtual();
    res.setHeader(
      'Set-Cookie',
      `ics_token=${token}; Path=/; HttpOnly; Max-Age=${DURACAO_SESSAO}; SameSite=Lax${cookieSeguro(req)}`,
    );
  }

  @Post('login')
  async login(@Body() body: any, @Req() req: any, @Res() res: any) {
    if (await this.auth.validarLogin(body?.usuario, body?.senha)) {
      await this.gravarCookie(req, res);
      return res.json({ ok: true });
    }
    return res.status(401).json({ ok: false });
  }

  @Post('logout')
  logout(@Req() req: any, @Res() res: any) {
    res.setHeader(
      'Set-Cookie',
      `ics_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${cookieSeguro(req)}`,
    );
    return res.json({ ok: true });
  }

  // Troca de usuário/senha (exige a senha atual); mantém o usuário logado
  @Post('alterar-acesso')
  async alterarAcesso(@Body() body: any, @Req() req: any, @Res() res: any) {
    if (!(await this.auth.validarSenha(body?.senhaAtual))) {
      return res.status(401).json({ ok: false, erro: 'Senha atual incorreta.' });
    }
    const novoUsuario = String(body?.usuario || '').trim();
    if (!novoUsuario) {
      return res.status(400).json({ ok: false, erro: 'Informe o nome de usuário.' });
    }
    await this.auth.alterar(novoUsuario, String(body?.novaSenha || ''));
    await this.gravarCookie(req, res);
    return res.json({ ok: true });
  }
}
