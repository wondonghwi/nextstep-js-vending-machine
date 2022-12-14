import { getCashBoxChangeTemplateTable, productPurchaseMenuTemplate } from '../template/index.js';
import { ERROR_MESSAGE, NAME, STORAGE_KEY } from '../constants/index.js';
import { checkEmptyPrice, checkPriceUnit, checkValidation } from '../validate/index.js';
import ProductPurchaseService from '../service/ProductPurchaseService.js';
import StorageService from '../service/StorageService.js';
import Storage from '../storage/index.js';

class ProductPurchaseMenu {
  constructor($app) {
    this.app = $app;
    this.initRenderer();
    this.initEventListener();
    this.productPurchaseService = new ProductPurchaseService();
  }

  static changeRenderer() {
    const $purchaseAmount = document.querySelector('#purchase-amount');
    const $productInventoryContainer = document.querySelector('#product-inventory-container');
    const $cashBoxTable = document.querySelector('#cashbox-table');
    const $productPurchaseForm = document.querySelector('#product-purchase-form');

    const getProductManage = StorageService.getProductManageMenu();

    $purchaseAmount.textContent = StorageService.getProductPurchase(Storage.getStateData(), STORAGE_KEY.PURCHASE_PRICE);
    $productInventoryContainer.innerHTML = ProductPurchaseService.getProductPurchaseTemplate(getProductManage);
    $cashBoxTable.innerHTML = getCashBoxChangeTemplateTable(
      StorageService.getProductPurchase(Storage.getStateData(), STORAGE_KEY.RETURN_REMAINS)
    );
    $productPurchaseForm.reset();
  }

  initRenderer() {
    const products = StorageService.getProductManageMenu();
    const productMenuTemplate = ProductPurchaseService.getProductPurchaseTemplate(products);
    const cashBoxChangeTemplate = getCashBoxChangeTemplateTable(
      StorageService.getProductPurchase(Storage.getStateData(), STORAGE_KEY.RETURN_REMAINS)
    );

    this.app.innerHTML = productPurchaseMenuTemplate(productMenuTemplate, cashBoxChangeTemplate);
    ProductPurchaseMenu.changeRenderer();
  }

  insertAmount(e) {
    e.preventDefault();

    const insertPrice = new FormData(e.target).get(NAME.PURCHASE_AMOUNT);
    const formattingPrice = parseInt(insertPrice, 10);

    try {
      const inputCondition = checkPriceUnit(formattingPrice);
      checkValidation(inputCondition, ERROR_MESSAGE.INVALID_CHARGE_INSERT_UNIT);

      this.productPurchaseService.setAddPurchasePrice(formattingPrice);
      ProductPurchaseMenu.changeRenderer();
    } catch (error) {
      alert(error.message);
      const purchaseInput = document.querySelector('#purchase-input');
      purchaseInput.focus();
    }
  }

  buyProduct(e) {
    const { className, name } = e.target;

    if (className !== 'purchase-product-button') return;

    this.productPurchaseService.setBuyProduct(name);
    ProductPurchaseMenu.changeRenderer();
  }

  returnRemain() {
    try {
      const purchasePrice = StorageService.getProductPurchase(Storage.getStateData(), STORAGE_KEY.PURCHASE_PRICE);
      const { amount } = StorageService.getAmountState(Storage.getStateData());
      const purchasePriceCondition = checkEmptyPrice(purchasePrice);
      const amountPriceCondition = checkEmptyPrice(amount);

      checkValidation(purchasePriceCondition, ERROR_MESSAGE.LACK_OF_INSERT);
      checkValidation(amountPriceCondition, ERROR_MESSAGE.LACK_OF_CHARGE);
      this.productPurchaseService.remainService();
      ProductPurchaseMenu.changeRenderer();
    } catch (error) {
      alert(error.message);
    }
  }

  initEventListener() {
    const $productPurchaseForm = document.querySelector('#product-purchase-form');
    const $productInventoryContainer = document.querySelector('#product-inventory-container');
    const $coinReturnButton = document.querySelector('#coin-return-button');

    $productPurchaseForm.addEventListener('submit', this.insertAmount.bind(this));
    $productInventoryContainer.addEventListener('click', this.buyProduct.bind(this));
    $coinReturnButton.addEventListener('click', () => this.returnRemain());
  }
}

export default ProductPurchaseMenu;
