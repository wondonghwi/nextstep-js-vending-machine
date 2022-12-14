import { checkPriceUnit, checkValidation } from '../validate/index.js';
import ProductManageMenuService from '../service/ProductManageMenuService.js';
import { ERROR_MESSAGE, NAME } from '../constants/index.js';
import { removeSpaces } from '../utils/index.js';
import { productManagerMenuTemplate } from '../template/index.js';
import StorageService from '../service/StorageService.js';

class ProductManageMenu {
  constructor($app) {
    this.app = $app;
    this.initRenderer();
    this.initEventListener();
  }

  static changeRenderer() {
    const getState = StorageService.getProductManageMenu();

    const isEmptyObj = Object.keys(getState).length === 0;
    if (isEmptyObj) return;

    const $productInventoryContainer = document.querySelector('#product-inventory-container');
    const $productContainer = document.querySelector('.product-container');
    $productInventoryContainer.innerHTML = ProductManageMenuService.getProductMenuTemplate(getState);
    $productContainer.reset();
  }

  initRenderer() {
    this.app.innerHTML = productManagerMenuTemplate;
    ProductManageMenu.changeRenderer();
  }

  static addProductList(e) {
    e.preventDefault();

    const productInputValue = new FormData(e.target).getAll(NAME.PRODUCT_INPUT);

    const [name, price, count] = productInputValue;

    try {
      const inputCondition = checkPriceUnit(parseInt(price, 10));
      checkValidation(inputCondition, ERROR_MESSAGE.INVALID_PRODUCT_UNIT);

      const noBlankName = removeSpaces(name);

      StorageService.setProductManageMenu({ noBlankName, price, count });
      ProductManageMenu.changeRenderer();
    } catch (error) {
      alert(error.message);
      const priceInput = document.querySelector('#product-price-input');
      priceInput.focus();
    }
  }

  initEventListener() {
    const $productForm = document.querySelector('#product-container-form');
    $productForm.addEventListener('submit', ProductManageMenu.addProductList.bind(this));
  }
}
export default ProductManageMenu;
