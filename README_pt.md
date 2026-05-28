# GNAFOR Field Collector

[![CI](https://github.com/viniciusvalimpereira/gnafor-field-collector/actions/workflows/ci.yml/badge.svg)](https://github.com/viniciusvalimpereira/gnafor-field-collector/actions/workflows/ci.yml)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19266282.svg)](https://doi.org/10.5281/zenodo.19266282)

**Aplicativo web de arquivo único, mobile-first, para coleta sistemática de
dados de campo em experimentos com gramíneas forrageiras tropicais.**

🇬🇧 *English version:* [README.md](README.md)

---

## Visão geral

O GNAFOR Field Collector substitui as fichas de campo em papel em experimentos de
morfogênese e produtividade de forrageiras tropicais. Todo o aplicativo é um
único arquivo `.html` (~200 KB), **sem dependências em tempo de execução** — roda
em qualquer navegador móvel moderno, totalmente offline, e sincroniza com o
Google Sheets quando há conexão. Desenvolvido pelo Grupo de Pesquisa GNAFOR
(Nutrição Animal e Forragicultura) da UEMG — Unidade Divinópolis.

## Funcionalidades

- **Quatro módulos de coleta:** morfogênese foliar, perfilhamento, produção de
  massa e altura do dossel.
- **Validação no cliente** com faixas biologicamente plausíveis (limites rígidos
  bloqueiam valores impossíveis; limites brandos pedem confirmação).
- **Interface bilíngue (PT/EN)** alternável em tempo real, com escolha persistida.
- **Offline-first** com fila no localStorage + **medidor de capacidade**
  (avisos em 70%/90% e purga automática de registros já enviados).
- **GPS**, **exportação CSV** (UTF-8 BOM) e **modo alto contraste**.
- **Overlay de Configurações** para ajustar o experimento sem editar código.

## Início rápido

1. Baixe `GNAFOR_FieldCollector_v1.1.html`.
2. Abra em qualquer navegador móvel.
3. Digite seu nome e comece a coletar. Sem instalação, sem servidor.

## Configuração

### A. Overlay de Configurações (sem código)

Toque no botão **⚙ Configurações** no cabeçalho para criar/renomear/excluir
tratamentos, blocos e parcelas, ajustar o número de pseudocolmos/folhas e
**exportar/importar** toda a configuração como JSON. As mudanças são salvas no
`localStorage` e persistem entre sessões.

### B. Bloco CONFIG (avançado)

Para os padrões de implantação, edite o bloco `CONFIG_DEFAULTS` no topo do
arquivo (`tratamentos`, `blocos`, `parcelas`, `numPseudoc`, `numFolhas`,
`SHEETS_WEBHOOK_URL`).

## Integração com Google Sheets (8 passos)

1. Abra o **Google Drive** e crie uma **planilha** (ex.: `Dunamis_Field_Data`).
2. Menu **Extensões → Apps Script**.
3. Substitua o `Code.gs` pelo [`scripts/GoogleAppsScript_doPost.gs`](scripts/GoogleAppsScript_doPost.gs).
4. **Salve** e nomeie o projeto (ex.: `GNAFOR Endpoint`).
5. **Implantar → Nova implantação → app da Web**. Defina **Executar como: Eu** e **Quem tem acesso: Qualquer pessoa**.
6. **Autorize** o script.
7. Copie a **URL `/exec`** do diálogo de implantação.
8. Cole essa URL em `CONFIG.SHEETS_WEBHOOK_URL` (ou no overlay de Configurações).

![Editor do Apps Script com o template colado](screenshots/01_apps_script_editor.png)
![Diálogo de implantação: app da Web, acesso "Qualquer pessoa"](screenshots/02_deployment_dialog.png)

## Internacionalização (i18n)

Todas as strings ficam em `i18n/strings_pt.json` e `i18n/strings_en.json`,
aplicadas via `t(key)`. O seletor PT/EN troca tudo em tempo real, sem recarregar.
`npm run i18n:check` garante que os dois catálogos tenham as mesmas chaves.

## Adicionando uma nova variável

A maior parte da adaptação não precisa de código — use o overlay. Para uma nova
variável **medida** (ex.: *densidade do dossel*): adicione uma entrada em
`CONFIG.TRAITS` (documentado no topo do HTML) e o respectivo campo no formulário,
referenciando-o no `traitValidate()` do módulo. A validação passa a se aplicar
automaticamente.

## Testes

```bash
npm install
python build.py
npm test
npm run coverage
```

## Licença

[MIT](LICENSE) © 2026 Vinícius Valim Pereira — UEMG, Unidade Divinópolis.

## Como citar

> Pereira, V. V. (2026). *GNAFOR Field Collector*. Zenodo.
> https://doi.org/10.5281/zenodo.19266282
