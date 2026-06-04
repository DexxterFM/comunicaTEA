# Guia de Migração PWA - TEAjudando para Codex

Este arquivo foi gerado especificamente para que você (ou seu agente de IA no Codex) possa ler e implementar automaticamente os recursos de **PWA (Progressive Web App)**, **funcionamento offline** e a **notificação inteligente de instalação** no código-fonte original.

O recurso de PWA adicionado consiste em:
1. configuração do manifesto de aplicativo (`manifest.json`)
2. registrar um Service Worker (`sw.js`) para cachear recursos cruciais e permitir a inicialização offline
3. ajustar o arquivo principal HTML (`index.html`) para registro e tags meta de dispositivo móvel
4. incluir controle de estado no React/TypeScript (`App.tsx`) para o prompt de instalação (`beforeinstallprompt`) e o visualizador ("Dica Clínica: Instale o TEAjudando").

---

## 📂 Arquivo 1: Criar `/public/manifest.json`

Crie o arquivo `/public/manifest.json` com o seguinte conteúdo exato para configurar a instalação no celular, iPad ou computador:

```json
{
  "name": "TEAjudando - Comunicação Alternativa",
  "short_name": "TEAjudando",
  "description": "Sistema de AAC (Comunicação Alternativa e Ampliada) para crianças autistas, inspirado em TD Snap®.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#cbd2db",
  "theme_color": "#343b46",
  "orientation": "any",
  "icons": [
    {
      "src": "/pwa_icon.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa_icon.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "categories": ["medical", "education", "utilities"]
}
```

*Nota: Um ícone otimizado de alta resolução foi criado no caminho `/public/pwa_icon.png`.*

---

## 📂 Arquivo 2: Criar `/public/sw.js` (Service Worker Offline)

Crie o arquivo `/public/sw.js` para interceptar requisições, permitir abertura offline e controle de caching de fontes e páginas:

```javascript
const CACHE_NAME = 'communicatea-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa_icon.png',
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pré-carregando assets estáticos.');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removendo cache obsoleto:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições e cache dinâmico de assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse.status === 200 &&
          (event.request.url.startsWith(self.location.origin) || 
           event.request.url.includes('fonts.googleapis.com') ||
           event.request.url.includes('fonts.gstatic.com'))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
```

---

## 📂 Arquivo 3: Editar `/index.html`

Insira as tags meta de PWA dentro da tag `<head>` e registre o Service Worker no final do `<body>` no seu `/index.html`:

### Dentro de `<head>`:
```html
    <!-- PWA configuration links and mobile-first safari options -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#343b46" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link rel="apple-touch-icon" href="/pwa_icon.png" />
    <link rel="icon" type="image/png" href="/pwa_icon.png" />
```

### No final do `<body>` (antes do fechamento de `</body>`):
```html
    <!-- Register Service Worker for PWA / offline support -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('TEAjudando Service Worker registrado com sucesso:', registration.scope);
            })
            .catch((error) => {
              console.error('Falha ao registrar o Service Worker do TEAjudando:', error);
            });
        });
      }
    </script>
```

---

## 📂 Arquivo 4: Implementar no seu Componente React principal (`App.tsx` ou similar)

Para integrar o banner informativo de instabilidade/instalação offline e capturar o prompt nativo de instalação, aplique as seguintes mudanças no React:

### 1. Estados e Efeito do React para capturar o evento de instalação:
No topo do seu componente (`App.tsx`), declare o seguinte:

```typescript
  // PWA (Progressive Web App) states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);

  // Monitor dynamic PWA installation events
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    window.addEventListener('appinstalled', () => {
      console.log('TEAjudando instalado com sucesso!');
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);
```

### 2. Ação de clique para disparar o prompt nativo do navegador:
```typescript
  // Helper action to invoke standard browser PWA install prompt
  const handlePWAInstallClick = async () => {
    if (typeof playTactileFeedback === 'function') {
      playTactileFeedback();
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install choice accepted status: ${outcome}`);
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };
```

### 3. Elemento UI de Banner no final da área ativa de comunicação (`patient-grid` ou similar):
Posicione este bloco logo abaixo ou acima da grade de botões (no seu layout do paciente):

```tsx
              {/* PWA / Web App Installation Promo Banner */}
              {showInstallBanner && (
                <div className="border border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-teal-50/40 to-indigo-50/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in mt-2 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-750 shrink-0 text-xl font-black">
                      📱
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 leading-none">
                        Dica Clínica: Instale o TEAjudando em seu Dispositivo!
                        <span className="text-[9px] bg-emerald-600 text-white font-mono px-1.5 py-0.5 rounded font-black uppercase">PWA</span>
                      </h4>
                      <p className="text-[10.5px] text-gray-500 mt-1 font-medium leading-relaxed max-w-[450px]">
                        Funciona <strong>sem internet (100% off-line)</strong>, abre em tela cheia sem barras de navegador para evitar distrações para a criança, e adiciona um ícone na área de trabalho.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {deferredPrompt ? (
                      <button
                        onClick={handlePWAInstallClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
                      >
                        📲 Instalar Agora (Grátis)
                      </button>
                    ) : (
                      <div className="text-[9.5px] text-slate-800 bg-white border border-neutral-200 px-3 py-2 rounded-xl max-w-[240px] font-bold shadow-sm whitespace-pre-line leading-tight">
                        💡 <strong>No iPad/iPhone:</strong> Toque no ícone de Compartilhar <span className="inline-block border border-gray-300 rounded px-1.5 py-0.5 bg-neutral-100">📤</span> e escolha <strong>"Adicionar à Tela de Início"</strong>.
                      </div>
                    )}
                    <button
                      onClick={() => { if (typeof playTactileFeedback === 'function') playTactileFeedback(); setShowInstallBanner(false); }}
                      className="text-[10px] font-extrabold text-neutral-400 hover:text-neutral-600 transition-colors text-center shrink-0 leading-none py-1.5 px-2 hover:bg-neutral-100 rounded-lg cursor-pointer"
                    >
                      Dispensar dica
                    </button>
                  </div>
                </div>
              )}
```

---

*Nota: Este arquivo pode ser lido inteiramente pelo assistente Codex para aplicar a automação.*
