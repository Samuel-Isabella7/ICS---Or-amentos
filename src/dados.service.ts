import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

export interface DadosSistema {
  orcamentos: any[];
  config: any;
}

const VAZIO: DadosSistema = { orcamentos: [], config: null };

@Injectable()
export class DadosService implements OnModuleInit {
  private readonly pasta = path.join(process.cwd(), 'dados');
  private readonly arquivo = path.join(this.pasta, 'dados-ics.json');
  private pool: Pool | null = null;

  async onModuleInit() {
    // Com DATABASE_URL definida (hospedado), usa Postgres; sem ela (local), usa arquivo JSON
    if (process.env.DATABASE_URL) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });
      await this.pool.query(
        'CREATE TABLE IF NOT EXISTS dados_ics (id INT PRIMARY KEY, conteudo JSONB NOT NULL)',
      );
    }
  }

  async carregar(): Promise<DadosSistema> {
    if (this.pool) {
      const r = await this.pool.query('SELECT conteudo FROM dados_ics WHERE id = 1');
      return { ...VAZIO, ...(r.rows[0]?.conteudo || {}) };
    }
    try {
      return { ...VAZIO, ...JSON.parse(fs.readFileSync(this.arquivo, 'utf8')) };
    } catch {
      return { ...VAZIO };
    }
  }

  async salvar(dados: DadosSistema): Promise<void> {
    if (this.pool) {
      await this.pool.query(
        `INSERT INTO dados_ics (id, conteudo) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET conteudo = $1`,
        [JSON.stringify(dados)],
      );
      return;
    }
    if (!fs.existsSync(this.pasta)) fs.mkdirSync(this.pasta, { recursive: true });
    // grava em arquivo temporário e renomeia, para nunca corromper os dados
    const tmp = this.arquivo + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(dados, null, 2), 'utf8');
    fs.renameSync(tmp, this.arquivo);
  }
}
