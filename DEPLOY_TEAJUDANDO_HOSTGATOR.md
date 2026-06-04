# Publicar TEAjudando em erpclinicatea.com/comunicatea

Pacote gerado para cPanel/HostGator com aplicativo Node.js.

## Configuracao no cPanel

1. Abra **Setup Node.js App**.
2. Crie um app:

```text
Node.js: 20 ou superior
Application mode: Production
Application root: comunicatea
Application URL: erpclinicatea.com/comunicatea
Application startup file: app.js
```

3. Envie e extraia o ZIP:

```text
release-packages/comunicatea-hostgator-subpath.zip
```

4. No cPanel, clique em **Run NPM Install**.
5. Configure as variaveis:

```text
NODE_ENV=production
COMUNICATEA_BASE_PATH=/comunicatea
```

6. Reinicie o app Node.js.

## URLs esperadas

```text
https://erpclinicatea.com/comunicatea/
https://erpclinicatea.com/comunicatea/manifest.json
https://erpclinicatea.com/comunicatea/api/patients
```

O app fica instalavel em celulares/tablets pelo menu do navegador:

- Android/Chrome: **Instalar app** ou **Adicionar a tela inicial**.
- iPhone/iPad/Safari: compartilhar e escolher **Adicionar a Tela de Inicio**.

## Observacao

O banco local do TEAjudando e criado em `data/db.json` dentro da pasta do app Node.js. Para producao com varios pacientes reais, faca backup frequente dessa pasta.
