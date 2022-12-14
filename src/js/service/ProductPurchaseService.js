import Storage from '../storage/index.js';
import { COINS, ERROR_MESSAGE, MENU, STORAGE_KEY } from '../constants/index.js';
import { getCashBoxChangeTemplateTable, getProductPurchaseTemplateTableRow } from '../template/index.js';
import StorageService from './StorageService.js';

class ProductPurchaseService {
  constructor() {
    this.stateData = Storage.getStateData();
    this.getStateByCurrentTab = this.stateData[Storage.getCurrentTab()];
  }

  static getProductPurchaseTemplate(products) {
    return Object.keys(products)
      .map(tabId => getProductPurchaseTemplateTableRow(tabId, products[tabId]))
      .join('');
  }

  static getChangeBoxTemplate(remains) {
    return Object.keys(remains)
      .map(tabId => getCashBoxChangeTemplateTable(tabId, remains[tabId]))
      .join('');
  }

  static getCalculatedAmount = coins => {
    const coinKey = Object.keys(coins);
    const coinValue = Object.values(coins);
    return coinKey.reduce((acc, cur, i) => acc + parseInt(cur, 10) * coinValue[i], 0);
  };

  static setReturnRemains(returnRemains, remains) {
    returnRemains[COINS.TEN] = remains[COINS.TEN];
    returnRemains[COINS.FIFTY] = remains[COINS.FIFTY];
    returnRemains[COINS.ONE_HUNDRED] = remains[COINS.ONE_HUNDRED];
    returnRemains[COINS.FIVE_HUNDRED] = remains[COINS.FIVE_HUNDRED];
  }

  setAddPurchasePrice(price) {
    this.getStateByCurrentTab[STORAGE_KEY.PURCHASE_PRICE] += price;
    Storage.setStateData(this.stateData);
  }

  setBuyProduct(productName) {
    const count = parseInt(this.stateData[MENU.PRODUCT_MANAGE][productName][STORAGE_KEY.COUNT], 10);
    const price = parseInt(this.stateData[MENU.PRODUCT_MANAGE][productName][STORAGE_KEY.PRICE], 10);
    const { purchasePrice } = this.getStateByCurrentTab;

    const isPurchasableCondition = count > 0 && purchasePrice >= price;

    if (isPurchasableCondition) {
      this.getStateByCurrentTab[STORAGE_KEY.PURCHASE_PRICE] -= price;
      this.stateData[MENU.PRODUCT_MANAGE][productName][STORAGE_KEY.COUNT] -= 1;
      Storage.setStateData(this.stateData);
    } else {
      alert(ERROR_MESSAGE.INVALID_INSERT_COIN);
    }
  }

  remainService() {
    let purchasePrice = StorageService.getProductPurchase(this.stateData, STORAGE_KEY.PURCHASE_PRICE);
    const returnRemains = StorageService.getProductPurchase(this.stateData, STORAGE_KEY.RETURN_REMAINS);
    const coins = StorageService.getVendingMachineManageMenu(this.stateData, STORAGE_KEY.COINS);

    const remains = {
      [COINS.FIVE_HUNDRED]: 0,
      [COINS.ONE_HUNDRED]: 0,
      [COINS.FIFTY]: 0,
      [COINS.TEN]: 0,
    };

    const [COIN_KEY_10, COIN_KEY_50, COIN_KEY_100, COIN_KEY_500] = Object.keys(coins);
    let [COIN_VALUE_10, COIN_VALUE_50, COIN_VALUE_100, COIN_VALUE_500] = Object.values(coins);

    while (purchasePrice >= 10) {
      if (purchasePrice >= COIN_KEY_500 && COIN_VALUE_500 > 0) {
        purchasePrice -= COIN_KEY_500;
        COIN_VALUE_500 -= 1;
        coins[COIN_KEY_500] -= 1;
        remains[COIN_KEY_500] += 1;
        continue;
      }

      if (purchasePrice >= COIN_KEY_100 && COIN_VALUE_100 > 0) {
        purchasePrice -= COIN_KEY_100;
        COIN_VALUE_100 -= 1;
        coins[COIN_KEY_100] -= 1;
        remains[COIN_KEY_100] += 1;
        continue;
      }

      if (purchasePrice >= COIN_KEY_50 && COIN_VALUE_50 > 0) {
        purchasePrice -= COIN_KEY_50;
        COIN_VALUE_50 -= 1;
        coins[COIN_KEY_50] -= 1;
        remains[COIN_KEY_50] += 1;
        continue;
      }

      if (purchasePrice >= COIN_KEY_10 && COIN_VALUE_10 > 0) {
        purchasePrice -= COIN_KEY_10;
        COIN_VALUE_10 -= 1;
        coins[COIN_KEY_10] -= 1;
        remains[COIN_KEY_10] += 1;
        continue;
      }

      if (purchasePrice > 0) {
        break;
      }
    }

    this.stateData[MENU.PRODUCT_PURCHASE][STORAGE_KEY.PURCHASE_PRICE] = purchasePrice;
    this.stateData[MENU.VENDING_MACHINE_MANAGE][STORAGE_KEY.AMOUNT] = ProductPurchaseService.getCalculatedAmount(coins);
    ProductPurchaseService.setReturnRemains(returnRemains, remains);
    Storage.setStateData(this.stateData);
  }
}
export default ProductPurchaseService;
