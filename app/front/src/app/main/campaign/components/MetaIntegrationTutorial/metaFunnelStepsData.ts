export type MetaFunnelScriptStep = {
  key: number;
  label: string;
  description: string;
  headScript: string;
  bodyScript: string;
};

export const metaFunnelScriptSteps: MetaFunnelScriptStep[] = [
  {
    key: 1,
    label: "Etapa 1",
    description:
      "Instale estes scripts na primeira pagina do funil, onde o usuario entra inicialmente e onde a captura dos parametros da URL deve comecar.",
    headScript: `<script>(function(w,d,s,l,i,pixelId){w.__oracConfig=w.__oracConfig||{};
w.__oracConfig.metaPixelId=pixelId;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TL4T6K39','1270637588366652');</script>`,
    bodyScript: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TL4T6K39"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
  },
  {
    key: 2,
    label: "Etapa 2",
    description:
      "Instale estes scripts na segunda pagina do funil, caso ela exista. Esta etapa deve receber o container correspondente apenas se houver continuidade real do fluxo.",
    headScript: `<script>(function(w,d,s,l,i,pixelId){w.__oracConfig=w.__oracConfig||{};
w.__oracConfig.metaPixelId=pixelId;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-T8M6LHTG','1270637588366652');</script>`,
    bodyScript: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T8M6LHTG"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
  },
  {
    key: 3,
    label: "Etapa 3",
    description:
      "Instale estes scripts na terceira pagina do funil, se a campanha utilizar uma terceira etapa. Caso o funil termine antes, nao e necessario configurar esta pagina.",
    headScript: `<script>(function(w,d,s,l,i,pixelId){w.__oracConfig=w.__oracConfig||{};
w.__oracConfig.metaPixelId=pixelId;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TL4T6K39','1270637588366652');</script>`,
    bodyScript: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TL4T6K39"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`,
  },
];
