import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth.service';
import { lerCookies } from './auth.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todo o sistema exige login. Liberados: saúde (monitoramento do Render),
  // o próprio login e os arquivos da tela de login.
  const auth = app.get(AuthService);
  const livres = ['/api/saude', '/api/login', '/login.html', '/icon.png', '/logo.png', '/favicon.ico'];
  app.use(async (req: any, res: any, next: any) => {
    if (livres.includes(req.path)) return next();
    try {
      if (lerCookies(req)['ics_token'] === (await auth.tokenAtual())) return next();
    } catch (e) {
      console.error('Falha ao validar sessão:', e);
    }
    if (req.path.startsWith('/api/')) return res.status(401).json({ erro: 'nao-autenticado' });
    return res.redirect('/login.html');
  });

  app.setGlobalPrefix('api', { exclude: ['/'] });
  const porta = process.env.PORT ? Number(process.env.PORT) : 3344;
  await app.listen(porta, '0.0.0.0');
  console.log(`\n  ICS Orçamentos rodando em: http://localhost:${porta}\n`);
}
bootstrap();
