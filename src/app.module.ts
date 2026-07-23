import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { DadosController } from './dados.controller';
import { DadosService } from './dados.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AuthController, DadosController],
  providers: [DadosService],
})
export class AppModule {}
