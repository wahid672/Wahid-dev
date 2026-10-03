---
title: "Tutorial Membangun Model Context Protocol (MCP) Server dengan TypeScript untuk AI Agent"
slug: "tutorial-membangun-mcp-server-typescript-ai-agent"
date: "2026-10-03"
author: "Wahid Alimudin"
category: "Tutorial"
tags: ["AI", "MCP", "TypeScript", "Node.js", "Agentic AI"]
summary: "Panduan praktis membangun server Model Context Protocol (MCP) kustom menggunakan TypeScript SDK untuk menghubungkan AI agent ke database dan file lokal."
readingTime: "7 menit baca"
---

Model Context Protocol (MCP) adalah standar terbuka yang digagas oleh Anthropic dan kini diadopsi secara luas di seluruh ekosistem AI engineering. Protokol ini memecahkan masalah integrasi data yang selama ini terfragmentasi: bagaimana memberikan Large Language Model (LLM) akses aman ke sumber data privat seperti database SQL, sistem file lokal, hingga API internal.

Alih-alih menulis integrasi API khusus untuk setiap platform chat AI, MCP bertindak layaknya arsitektur driver USB-C: Anda membuat satu server MCP, dan model AI mana pun (Claude, Gemini, Antigravity, atau Cursor) dapat langsung menggunakannya sebagai tools dan resources.

Dalam tutorial ini, kita akan membangun server MCP kustom berbasis TypeScript yang mengekspos fungsi query data sistem dan manipulasi berkas lokal.

---

## Prasyarat Proyek

Sebelum memulai, pastikan lingkungan pengembangan Anda telah memiliki:
- Node.js versi 18 atau lebih baru.
- Manajer paket `npm` atau `pnpm`.
- Pemahaman dasar TypeScript dan protokol JSON-RPC 2.0.

Inisialisasi direktori proyek baru:

```bash
mkdir mcp-system-server && cd mcp-system-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init
```

Sesuaikan berkas `tsconfig.json` agar mendukung module ESM modern:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

Perbarui juga `package.json` dengan menambahkan `"type": "module"` dan skrip eksekusi:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts"
  }
}
```

---

## 1. Memahami Tiga Pilar Model Context Protocol

Arsitektur MCP terdiri dari tiga entitas pertukaran data utama:
1. **Resources:** Data pasif hanya-baca (*read-only*) seperti log sistem, file teks, atau skema database.
2. **Prompts:** Templat instruksi prompt yang telah dikonfigurasi sebelumnya agar pengguna dapat memanggil alur kerja rutin dengan satu klik.
3. **Tools:** Fungsi yang dapat dieksekusi (*actionable functions*) yang memungkinkan AI mengubah data, memanggil API, atau melakukan kalkulasi khusus.

---

## 2. Mengembangkan Server MCP Kustom

Buat berkas `src/index.ts` dan susun struktur server menggunakan SDK resmi MCP:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// 1. Inisialisasi Instance Server MCP
const server = new Server(
  {
    name: 'system-diagnostic-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Daftarkan Katalog Tools yang Tersedia untuk AI
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_system_metrics',
        description: 'Mengambil metrik performa sistem: penggunaan RAM, platform OS, dan uptime server.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'inspect_directory',
        description: 'Membaca daftar file dalam direktori tertentu beserta ukuran berkasnya.',
        inputSchema: {
          type: 'object',
          properties: {
            dirPath: {
              type: 'string',
              description: 'Jalur absolut atau relatif direktori yang ingin diperiksa.',
            },
          },
          required: ['dirPath'],
        },
      },
    ],
  };
});

// 3. Eksekusi Tool Berdasarkan Permintaan Agen AI
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_system_metrics') {
      const freeMem = os.freemem() / (1024 * 1024);
      const totalMem = os.totalmem() / (1024 * 1024);
      const usedMem = totalMem - freeMem;

      const report = {
        platform: os.platform(),
        architecture: os.arch(),
        uptimeHours: (os.uptime() / 3600).toFixed(2),
        cpuCount: os.cpus().length,
        memoryUsageMB: {
          used: Math.round(usedMem),
          free: Math.round(freeMem),
          total: Math.round(totalMem),
          percentUsed: Math.round((usedMem / totalMem) * 100) + '%',
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(report, null, 2),
          },
        ],
      };
    }

    if (name === 'inspect_directory') {
      const parsed = z.object({ dirPath: z.string() }).parse(args);
      const targetDir = path.resolve(parsed.dirPath);

      const entries = await fs.readdir(targetDir, { withFileTypes: true });
      const summary = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
      }));

      return {
        content: [
          {
            type: 'text',
            text: `Isi direktori ${targetDir} (${summary.length} item):\n` + JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    throw new Error(`Tool tidak dikenali: ${name}`);
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error instanceof Error ? error.message : 'Terjadi kegagalan internal saat eksekusi tool.',
        },
      ],
    };
  }
});

// 4. Hubungkan Transport Komunikasi via Stdio
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('System Diagnostic MCP Server berhasil aktif melalui stdio transport.');
}

run().catch((err) => {
  console.error('Fatal error saat menjalankan MCP server:', err);
  process.exit(1);
});
```

---

## 3. Kompilasi dan Pengujian Lokal

Bangun kode TypeScript ke JavaScript:

```bash
npm run build
```

Perhatikan bahwa MCP berkomunikasi melalui jalur `stdio` (Standard Input / Standard Output). Oleh karena itu, jangan pernah mencetak log debugging biasa menggunakan `console.log()` karena akan merusak pesan JSON-RPC. Selalu gunakan `console.error()` untuk mencatat log internal server.

---

## 4. Menghubungkan MCP Server ke Klien AI

Untuk menguji server ini dengan klien AI seperti Claude Desktop atau Antigravity CLI, daftarkan path server pada file konfigurasi `mcpServers`:

```json
{
  "mcpServers": {
    "system-diagnostic": {
      "command": "node",
      "args": [
        "/path/absolut/ke/mcp-system-server/dist/index.js"
      ]
    }
  }
}
```

Setelah aplikasi klien di-restart, ikon palu atau tools akan menampilkan `get_system_metrics` dan `inspect_directory`. Anda kini dapat bertanya kepada asisten AI:

> *"Berapa sisa RAM server saat ini dan apa saja berkas yang ada di folder proyek saya?"*

AI akan secara otomatis memanggil tool MCP Anda, memvalidasi skema input, dan memberikan jawaban akurat berdasarkan data sistem real-time.

---

## Kesimpulan

Model Context Protocol membebaskan pengembang dari belenggu integrasi proprietary. Dengan membuat server MCP berbasis TypeScript, Anda dapat memberikan kemampuan eksekusi tak terbatas bagi AI agent Anda secara terstruktur, aman, dan mudah diaudit.
