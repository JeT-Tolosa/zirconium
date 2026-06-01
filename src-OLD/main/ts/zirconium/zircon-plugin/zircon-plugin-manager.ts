import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconAppObject } from '../zircon-core/zircon-app-object';
import { ZirconPlugin } from './zircon-plugin';

export class ZirconPluginManager extends ZirconAppObject {
  private __registeredPlugins: { [id: string]: ZirconPlugin } = {};

  constructor(app: ZirconApplication) {
    super(app);
  }

  public registerPlugin(plugin: ZirconPlugin): boolean {
    if (!plugin) return false;
    this.__registeredPlugins[plugin.getId()] = plugin;
    return true;
  }

  public async startPlugin(pluginId: string): Promise<void> {
    await this.__registeredPlugins[pluginId]?.plugInApplication(
      this.getApplication(),
    );
  }

  public async startPlugins(): Promise<void> {
    Object.keys(this.__registeredPlugins).forEach(async (pluginId) => {
      await this.startPlugin(pluginId);
    });
  }
}
