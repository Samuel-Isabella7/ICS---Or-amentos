import { Body, Controller, Get, Header, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DadosService, DadosSistema } from './dados.service';

@Controller()
export class DadosController {
  constructor(
    private readonly dados: DadosService,
    private readonly auth: AuthService,
  ) {}

  @Get('saude')
  saude() {
    return { ok: true };
  }

  @Get('dados')
  async carregar() {
    const d = await this.dados.carregar();
    const a = await this.auth.obter();
    return { ...d, usuario: a.usuario };
  }

  @Put('dados')
  async salvar(@Body() body: DadosSistema) {
    await this.dados.salvar({
      orcamentos: Array.isArray(body?.orcamentos) ? body.orcamentos : [],
      config: body?.config ?? null,
    });
    return { ok: true };
  }

  @Get('backup')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="backup-ics-orcamentos.json"')
  backup(): Promise<DadosSistema> {
    return this.dados.carregar();
  }
}
