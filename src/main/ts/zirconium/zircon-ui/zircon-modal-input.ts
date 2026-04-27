
export type ZirconInputButtonType = 'ok' | 'cancel';

export interface ZirconInputConfig {
  header?: string;
  buttons?: { [id in ZirconInputButtonType]: string };
  defaultInput?: string;
}

export interface ZirconInputReturnValue {
  button: ZirconInputButtonType;
  input?: string | null;
}

export class ZirconModal {
  public static async openInput(
    config?: ZirconInputConfig,
  ): Promise<ZirconInputReturnValue> {
    const header: string = config?.header || 'Modal Input';
    const okButton: string = config?.buttons['ok'] || 'OK';
    const cancelButton: string = config?.buttons['cancel'] || 'Cancel';
    const defaultInput: string = config?.defaultInput || 'text input';

    const alert = document.createElement('ion-alert') as HTMLIonAlertElement;

    alert.header = header;
    alert.inputs = [
      {
        name: 'userInput',
        type: 'text',
        placeholder: defaultInput,
      },
    ];
    if (config.buttons) {
      alert.buttons = [];

      for (const [key, value] of Object.entries(config.buttons)) {
        alert.buttons.push({
          role: key,
          text: value,
        });
      }
    }
    else alert.buttons= [{
          role: 'ok',
          text: okButton,
        },
        {
          role: 'cancel',
          text: cancelButton,
        }

    ];

    document.body.appendChild(alert);

    await alert.present();

    const result = await alert.onDidDismiss<{
      values?: { userInput?: string };
    }>();

    return {
      button: result.role === 'cancel' ? 'cancel' : 'ok',
      input: result.data?.values?.userInput,
    };
  }
}
