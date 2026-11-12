# Cardápio AR — React + Tailwind + JSON

Cardápio digital por QR Code com visualização dos pratos em 3D e **realidade aumentada pela câmera do celular**.
Site 100% estático: sem banco de dados e sem servidor. Todos os dados estão em **um arquivo JSON**.

> **Importante:** este código foi escrito sem poder ser executado (o ambiente de criação não tinha internet).
> A sintaxe foi conferida e o JSON validado, mas **nada foi rodado de verdade ainda**. Ao testar, anote o que falhar.

## Tecnologias (somente estas)

| Uso | Tecnologia |
|---|---|
| Linguagem | JavaScript (sem TypeScript) |
| Interface | React 18 (dentro do Next.js 14, só com páginas estáticas e componentes client-side) |
| Estilo | Tailwind CSS |
| Animações | Animate.css + transições do Tailwind |
| Dados | `src/data/cardapio.json` e `localStorage` (carrinho) |
| 3D / AR | `<model-viewer>` (web component padrão) + `navigator.mediaDevices.getUserMedia` (câmera) |

Não há Supabase, SQL, TypeScript, bibliotecas de ícones nem de QR Code.

## Rodar no computador

Requisito: Node.js 18.18 ou superior.

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para testar no celular **na mesma rede Wi-Fi**, abra `http://IP-DO-COMPUTADOR:3000`
(o cardápio e o 3D funcionam; **a câmera exige HTTPS**, veja abaixo).

## Publicar (Vercel)

1. Suba o projeto para o GitHub (a pasta com `package.json` deve ser a **raiz** do repositório, ou escolha a pasta em *Root Directory* na Vercel).
2. Na Vercel: **Add New > Project**, importe o repositório e clique em **Deploy** (nenhuma variável de ambiente é necessária).
3. Abra o endereço `https://...` no celular. Em HTTPS a câmera funciona.

Também dá para gerar os arquivos com `npm run build` (saída na pasta `out/`) e hospedar em qualquer lugar estático.

## Editar o cardápio

Tudo está em `src/data/cardapio.json`:

```json
{
  "id": "file-mignon-vinho-tinto",
  "slug": "file-mignon-vinho-tinto",
  "nome": "Filé mignon ao molho de vinho tinto",
  "descricao": "…",
  "preco": 112,
  "categoria": "carnes",
  "destaque": true,
  "popular": false,
  "disponivel": true,
  "porcao": { "descricao": "1 pessoa", "pesoG": 380 },
  "dimensoesCm": { "largura": 27, "profundidade": 27, "altura": 9.6 },
  "foto": "/images/foto-teste.jpg",
  "modelo": {
    "glb": "/models/file-teste.glb",
    "usdz": null,
    "dimensoesCm": { "largura": 27, "profundidade": 27, "altura": 9.6 },
    "ilustrativo": true
  }
}
```

- Fotos ficam em `public/images/` e modelos 3D em `public/models/`. O campo `modelo` pode ser `null` (o prato mostra "AR indisponível").
- Os modelos devem estar **em metros**, com a base do prato em y = 0. As medidas em `modelo.dimensoesCm` são as reais, em cm.
- O `slug` identifica o prato no endereço (`/prato?slug=<slug>`); ele precisa ser único e usar só letras minúsculas, números e hífen.
- Depois de editar o JSON, publique de novo. Em `npm run dev` a mudança aparece ao recarregar a página.

## Pedidos (sem backend)

Sem servidor, o pedido **não chega sozinho** à cozinha. O carrinho fica no aparelho do cliente (`localStorage`) e, ao finalizar:
- **Enviar pelo WhatsApp:** preencha o campo `restaurante.whatsapp` no JSON (só números, com país e DDD, ex.: `5511999999999`). Abre o WhatsApp com o pedido pronto.
- **Copiar pedido:** copia o texto para mostrar ao garçom.

QR Code por mesa: use o endereço do site terminando em `?mesa=5` (ex.: `https://seusite.com/?mesa=5`). O número da mesa vai junto no pedido. Gere os QR Codes em qualquer gerador online.

## Como funciona a AR pela câmera (`/ar?slug=<slug>`)

1. `getUserMedia` abre a câmera traseira em um `<video>` de tela cheia.
2. Um `<model-viewer>` **transparente** fica por cima, com a câmera 3D travada (sem zoom e sem pan; só gira).
3. **Escala real:** o campo de visão 3D é fixo (30°). A distância da câmera 3D é calculada para o modelo (em metros) aparecer com `px por cm` pixels por centímetro. O usuário calibra apoiando um **cartão de crédito** (8,56 × 5,40 cm) na mesa e movendo o controle até o retângulo tracejado na tela ter o tamanho do cartão. Também há uma régua de 10 cm de referência.
4. Painéis sobrepostos mostram nome, preço, porção, peso e tamanho real, com botão de adicionar ao pedido.

A página do prato tem só o botão **"Ver pela câmera"** (não há mais visualizador 3D separado).

### Limitações

- O modo câmera **não reconhece a mesa nem fixa o prato** nela; o prato fica no centro da tela e a escala só vale na distância do cartão.
- A câmera só abre em **HTTPS** (ou `localhost` no próprio computador). Em `http://192.168...` o navegador bloqueia.
- Os 3 modelos incluídos (hambúrguer, pizza, filé) são formas simples de teste, não comida de verdade.
- Os outros 8 pratos usam `public/models/foto-teste.glb`: a **foto de teste como um quadro em pé** (24 × 16 cm), só para testar a AR. É uma imagem plana, não um prato em 3D. Para trocar, gere outro .glb ou aponte `modelo.glb` para o modelo real.
- A foto de todos os pratos é uma foto de teste, marcada como "Foto ilustrativa".

### Checklist de teste no celular

1. Abrir um prato e tocar em "Ver pela câmera" → "Ativar câmera" → permitir a câmera.
3. Conferir que o prato aparece sobre a imagem da câmera, com fundo transparente.
4. Apoiar um cartão de crédito e ajustar o controle até o retângulo tracejado coincidir com ele.
5. Medir: o prato de teste mede 27 cm (quase uma folha A4 inteira de comprimento, 29,7 cm). Compare com a folha e com a mão.
6. Girar o prato: o tamanho não pode mudar.

Se o tamanho não bater, o ponto a ajustar está em `src/components/CameraAr.jsx` (constante `FOV_DEG` e a conta de `distancia`).

## Estrutura

```
src/app            páginas: início, /prato?slug=…, /ar?slug=…, /carrinho
src/components     MenuBrowser, DishCard, DishPhoto, CameraAr (câmera + 3D), TopBar…
src/lib            leitura do JSON, carrinho (localStorage), texto do pedido
src/data           cardapio.json  <- todos os dados
public/models      modelos .glb
public/images      fotos
```
