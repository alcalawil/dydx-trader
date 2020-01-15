import { Solo } from '@dydxprotocol/solo';
import { awsManager } from '@services';
import config from '@config';





// NOTA: El servicio: "getterService" ya se encarga de obtener los balances
// TODO: Revisar el diagrama de clases y refactorizar este modulo para que tenga ese nuevo
// comportamiento.





let DEFAULT_ADDRESS: string = config.account.defaultAddress;
const TAG_ADDRESS: string = config.secretManager.tagAddress;

class FundsManager {
  public solo: Solo;

  constructor(solo: Solo) {
    this.solo = solo;

    if (!DEFAULT_ADDRESS) {
      this.loadAddress(TAG_ADDRESS);
    }
  }

  private async loadAddress(address: string) {
    DEFAULT_ADDRESS = await awsManager.decryptSecretName(address);
  }
}

export const fundsFactory = (solo: Solo) => new FundsManager(solo);
