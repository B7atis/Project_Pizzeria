import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.dom = {};

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product:', thisProduct);
  }

  renderInMenu(){
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements(){
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  initAccordion(){
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

    /* START: add event listener to clickable trigger on event click */
    clickableTrigger.addEventListener('click', function(event) {

      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(select.all.menuProductsActive);

      /* if there is active product and it's bot thisProduct.element, remove class active from it */
      if (activeProduct && activeProduct !== thisProduct.element){
        activeProduct.classList.remove('active');
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
    });

  }

  initOrderForm(){
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }

  processOrder(){
    const thisProduct = this;

    // cover form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every calegory (param)...
    for(let paramId in thisProduct.data.params) {

      // determine param value, e.g. paramId = 'toppings', param = {label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);

      // for every option in this category
      for(let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = {label: 'Olives', proce: 2, default: true }
        const option = param.options[optionId];
        // console.log(optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionID
        // if(formData[paramId] && formData[paramId].includes(optionId)) {
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if(optionSelected) {
          // check if the option is not default
          if(!option.default) {

            // add option price to price variable
            price = option.price + price;
            // console.log('1. new price to:', price);
          }
        } else {

          // check if the option is default
          if(option.default) {

            // reduce price variable
            price-= option.price;
            // console.log('2. option.price to:', option.price);
          }
        }

        // finding an image with class paramId-optionId in the image div
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        // console.log('optionImage:', optionImage);

        // check if it was found
        if(optionImage) {

          // check that the option is selected
          if(optionSelected) {
              
            // If so, show this photo. If it is not, hide it
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    /* multiply price by amount */
    price *= thisProduct.amountWidget.value;

    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
    thisProduct.priceSingle = price;
    thisProduct.price = price;
  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    // app.cart.add(thisProduct);
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', { // Drugi argument to obiekt z ustawieniami tego eventu
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event); // Wywołanie eventu. Na elemencie DOM
  }

  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.data.price,
      price: thisProduct.price,
      params: thisProduct.prepareCartProductParams()
    };

    return productSummary;
  }

  prepareCartProductParams(){
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.form);
    const params = {};

    for(let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}
      };
      for(let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

        if(optionSelected){
          params[paramId].options[optionId] = option.label;
        }
      }
    }

    return params;
  }
}

export default Product;