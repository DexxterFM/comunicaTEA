# Publicacao do app nativo TEAjudando

Este repositorio agora esta preparado como app nativo com Capacitor.

O aplicativo nativo usa:

- Nome: TEAjudando
- Android package/applicationId: `com.erpclinicatea.teajudando`
- iOS bundle id: `com.erpclinicatea.teajudando`
- Orientacao: horizontal
- Conteudo aberto no app: `https://erpclinicatea.com/teajudando`

## O que ja esta pronto

- Projeto Android em `android/`
- Projeto iOS em `ios/`
- Configuracao Capacitor em `capacitor.config.ts`
- Scripts de sincronizacao em `package.json`
- Botao "Baixar app" preparado para baixar o APK direto em `/downloads/TEAjudando-android.apk`
- APK Android assinado para download direto em `public/downloads/TEAjudando-android.apk`
- AAB Android assinado para Google Play em `release-packages/TEAjudando-android-playstore.aab`
- Chave local de upload em `release-packages/teajudando-upload-key.jks`

## Requisitos para gerar Android

Instalar neste computador:

1. Android Studio
2. Java/JDK configurado
3. Android SDK pelo Android Studio

Depois rode:

```bash
npm install
npm run native:sync
npm run native:android
```

No Android Studio:

1. Abra a pasta `android/`
2. Gere o App Bundle em `Build > Generate Signed Bundle / APK`
3. Escolha `Android App Bundle`
4. Crie ou selecione a chave de assinatura
5. Gere o arquivo `.aab`
6. Envie o `.aab` no Google Play Console

Para um APK de teste direto:

```bash
npm run native:android:debug
```

O APK de debug costuma sair em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Para o botao "Baixar app" do site baixar direto, publique uma versao assinada em:

```text
public/downloads/TEAjudando-android.apk
```

Depois rode build e deploy do site.

Nesta maquina, o APK ja foi gerado e colocado nesse caminho.

O pacote para Google Play ja foi gerado em:

```text
release-packages/TEAjudando-android-playstore.aab
```

Guarde a chave `release-packages/teajudando-upload-key.jks` e a senha local em lugar seguro. Sem essa chave, atualizacoes futuras do mesmo app no Google Play podem ficar bloqueadas.

## Requisitos para App Store

iOS precisa de Mac com Xcode.

No Mac:

```bash
npm install
npm run native:sync
npx cap open ios
```

No Xcode:

1. Abra o projeto `ios/App/App.xcworkspace`
2. Configure Team com sua conta Apple Developer
3. Confirme Bundle Identifier: `com.erpclinicatea.teajudando`
4. Ajuste Version e Build
5. Selecione `Any iOS Device`
6. Use `Product > Archive`
7. Em Organizer, envie para App Store Connect

No App Store Connect:

1. Crie o app TEAjudando
2. Use Bundle ID `com.erpclinicatea.teajudando`
3. Preencha descricao, politica de privacidade, categoria e capturas de tela
4. Aguarde o build processar
5. Selecione o build e envie para revisao

Depois de publicado, coloque a URL real da App Store em `iosStoreUrl` dentro de `src/App.tsx`.

## Fontes oficiais

- Apple: criar app no App Store Connect: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/
- Apple: enviar builds: https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- Google Play: criar e configurar app: https://support.google.com/googleplay/android-developer/answer/9859152
- Capacitor Android: https://capacitorjs.com/docs/android
- Capacitor iOS: https://capacitorjs.com/docs/ios

## Observacao importante

O app nativo resolve o problema principal: instalacao como aplicativo real em celular/tablet. PWA continua existindo como fallback web, mas a estrategia definitiva para publicacao e distribuicao deve ser Android App Bundle no Google Play e build iOS pela App Store.
