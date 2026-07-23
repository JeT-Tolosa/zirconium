import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';
import { addCustomCSS } from '@ui5/webcomponents-base/dist/Theming.js';

// 1) Active le thème sombre officiel de UI5 (Horizon Evening).
// A appeler une seule fois, tôt dans le bootstrap de l'appli
// (avant l'affichage du 1er composant UI5, sinon flash de thème clair).
export function enableDarkTheme(): void {
  setTheme('sap_horizon_dark');
}

// 2) UI5 expose les couleurs sémantiques (--sapXxx) qui traversent le
// Shadow DOM par héritage : on peut les surcharger juste en ciblant le
// host `ui5-menu` avec une classe, sans casser l'encapsulation.
// -> Voir zircon-context-menu.css pour cette partie.

// 3) Certaines propriétés (border-radius du popup, box-shadow, blur,
// transitions d'ouverture) sont codées en dur dans le CSS interne du
// composant et NE sont PAS exposées en variable publique.
// SAP fournit addCustomCSS() précisément pour ce cas ; à n'utiliser que
// pour ce que les variables ne couvrent pas (cf. doc UI5: "Not recommended
// for general use, but this might be your only choice").
export function applyModernContextMenuSkin(): void {
  addCustomCSS(
    'ui5-menu',
    `
    .ui5-popover-root {
      border-radius: 12px !important;
      overflow: hidden;
      border: 1px solid var(--sapList_BorderColor);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.3) !important;
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
    }
    `,
  );

  addCustomCSS(
    'ui5-menu-item',
    `
    :host {
      transition: background-color 0.12s ease-in-out;
    }
    `,
  );
}
