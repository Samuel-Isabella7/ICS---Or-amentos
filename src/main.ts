import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Com SENHA_ACESSO definida (hospedado), todo o site exige login básico do navegador.
  // /api/saude fica aberto para o monitoramento do Render.
  const senha = process.env.SENHA_ACESSO;
  if (senha) {
    app.use((req: any, res: any, next: any) => {
      if (req.path === '/api/saude') return next();
      const b64 = (req.headers.authorization || '').split(' ')[1] || '';
      const informada = Buffer.from(b64, 'base64').toString().split(':').slice(1).join(':');
      if (informada === senha) return next();
      res
        .set('WWW-Authenticate', 'Basic realm="ICS Orcamentos"')
        .status(401)
        .send('Acesso restrito — informe a senha.');
    });
  }

  app.setGlobalPrefix('api', { exclude: ['/'] });
  const porta = process.env.PORT ? Number(process.env.PORT) : 3344;
  await app.listen(porta, '0.0.0.0');
  console.log(`\n  ICS Orçamentos rodando em: http://localhost:${porta}\n`);
}
bootstrap();
