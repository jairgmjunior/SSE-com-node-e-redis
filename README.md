# SSE Node.js + Redis

Este projeto é uma aplicação Node.js que usa Express e Redis para fornecer dados em tempo real via SSE (Server-Sent Events). O aplicativo está empacotado com Docker Compose para execução local com um serviço Redis.

## Visão geral

- `index.js` cria um servidor Express que:
  - habilita CORS com `cors`
  - serve arquivos estáticos da pasta `public`
  - expõe a rota `/stream` como SSE
- `public/index.html` abre um `EventSource` para `/stream` e escuta eventos do tipo `stock`
- `docker-compose.yml` cria dois serviços:
  - `app`: a aplicação Node.js
  - `redis`: o servidor Redis
- `package.json` define dependências e scripts

## Arquivos principais

### `index.js`

- importa `express`, `cors` e o cliente Redis (`redis`)
- configura `express.static('public')` para servir `public/index.html`
- configura a variável `redisUrl` a partir de `REDIS_URL`
- a rota `/stream`:
  - define os cabeçalhos SSE
  - cria e conecta um cliente Redis em `redisUrl`
  - se inscreve no canal `notifications`
  - envia eventos SSE do tipo `stock` para o navegador
  - mantém a conexão aberta até o cliente fechar

### `public/index.html`

- é a página exibida no navegador
- cria um `EventSource('/stream')`
- usa `eventSource.addEventListener('stock', ...)` para atualizar o conteúdo do `<p id="message">`
- exibe mensagens recebidas do servidor em tempo real

### `package.json`

Dependências:

- `cors`: permite requisições cross-origin
- `express`: servidor HTTP
- `ioredis`: cliente Redis alternativo (ainda presente no projeto)
- `redis`: cliente Redis usado no código atual
- `nodemon`: ferramenta de desenvolvimento para reiniciar a aplicação ao detectar mudanças

Scripts:

- `start`: `node index.js`
- `dev`: `nodemon index.js`

### `docker-compose.yml`

Configura dois serviços:

- `app`
  - build do Dockerfile local
  - expõe a porta `3000`
  - monta o código do projeto em `/usr/src/app`
  - executa `npm install && npx nodemon index.js`
  - usa `REDIS_URL=redis://redis:6379`
  - depende do serviço `redis`
- `redis`
  - usa a imagem oficial `redis:latest`
  - expõe a porta `6379`

Também define a rede `rede_sse` para que os containers se comuniquem.

## Como executar

1. Abra o terminal na pasta do projeto:
2. Inicie o Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Abra o navegador em:
   ```
   http://localhost:3000/
   ```

## O que acontece no browser

- a página carrega `public/index.html`
- o navegador abre um `EventSource` para `/stream`
- quando o servidor Redis publica no canal `notifications`, o servidor Node envia o evento SSE de nome `stock`
- o navegador atualiza o texto de `#message` automaticamente

## Observações

- a aplicação atual espera que o Redis publique mensagens no canal `notifications` use no terminal do redis:
```bash
    127.0.0.1:6379> PUBLISH notifications "mensagem a ser enviada..."
```

- o Docker Compose usa `npx nodemon` para desenvolvimento, então alterações no código podem reiniciar o servidor automaticamente

## Pontos de atenção

- o serviço Redis está acessível internamente como `redis:6379`
- a URL padrão usada pelo app é `redis://redis:6379` quando `REDIS_URL` não está definido
- o SSE atual envia eventos no formato:
  ```text
  event: stock
  data: <mensagem>

  ```

