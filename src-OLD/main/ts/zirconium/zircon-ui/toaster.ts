import { jsPanel } from 'jspanel4';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export function showToast(message: string, type: ToastType = 'info'): void {
  const themeByType: Record<ToastType, string> = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'primary',
  };

  jsPanel.create({
    theme: themeByType[type],

    headerTitle: type.toUpperCase(),

    content: `
      <div style="padding: 12px; font-size: 14px;">
        ${message}
      </div>
    `,

    position: {
      my: 'right-top',
      at: 'right-top',
      offsetX: -20,
      offsetY: 20,
    },

    panelSize: {
      width: '320px',
      height: 'auto',
    },

    resizeit: false,

    headerControls: {
      minimize: 'remove',
      maximize: 'remove',
      close: 'remove',
    },

    animateIn: 'jsPanelFadeIn',
    animateOut: 'jsPanelFadeOut',

    autoclose: 4000,
  });
}
