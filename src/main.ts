import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { lerCookies, tokenDe } from './auth.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Com SENHA_ACESSO definida (hospedado), o site exige login pela página /login.html.
  // Liberados sem login: saúde (monitoramento do Render), o próprio login e a logo.
  const senha = process.env.SENHA_ACESSO;
  if (senha) {
    const tokenEsperado = tokenDe(senha);
    const livres = ['/api/saude', '/api/login', '/api/sessao', '/login.html', '/icon.png', '/logo.png', '/favicon.ico'];
    app.use((req: any, res: any, next: any) => {
      if (livres.includes(req.path)) return next();
      if (lerCookies(req)['ics_token'] === tokenEsperado) return next();
      if (req.path.startsWith('/api/')) return res.status(401).json({ erro: 'nao-autenticado' });
      return res.redirect('/login.html');
    });
  }

  app.setGlobalPrefix('api', { exclude: ['/'] });
  const porta = process.env.PORT ? Number(process.env.PORT) : 3344;
  await app.listen(porta, '0.0.0.0');
  console.log(`\n  ICS Orçamentos rodando em: http://localhost:${porta}\n`);
}
bootstrap();
