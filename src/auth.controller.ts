import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { tokenDe } from './auth.util';

const UM_MES = 60 * 60 * 24 * 30;

function cookieSeguro(req: any): string {
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || '');
  return proto.includes('https') ? '; Secure' : '';
}

@Controller()
export class AuthController {
  @Get('sessao')
  sessao() {
    return { protegido: !!process.env.SENHA_ACESSO };
  }

  @Post('login')
  login(@Body() body: any, @Req() req: any, @Res() res: any) {
    const senha = process.env.SENHA_ACESSO;
    if (!senha) return res.json({ ok: true }); // sem proteção configurada
    if (String(body?.senha || '') === senha) {
      res.setHeader(
        'Set-Cookie',
        `ics_token=${tokenDe(senha)}; Path=/; HttpOnly; Max-Age=${UM_MES}; SameSite=Lax${cookieSeguro(req)}`,
      );
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
}
