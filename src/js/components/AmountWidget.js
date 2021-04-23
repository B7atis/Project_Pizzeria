import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
  constructor(element){
    super(element, settings.amountWidget.defaultValue); // To wywołanie konstructora BaseWidget, widzimy,że potzrebuje dwóch argumentów, więc je wpisujemy
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.renderValue();

    // console.log('AmountWidget:', thisWidget);
    // console.log('construthisWidget.dom.linkDecrease arguments:', element);
  }

  getElements(){
    const thisWidget = this;

    //thisWidget.dom.wrapper = element;  // Usuwamy to, bo zajmuje sie tym klasa BaseWidget
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){ // Ta sama . jest w klasie nadrzędnej, ale możemy ją nadpisać tutaj
    return !isNaN(value) // Spr. czy value jest liczbą
      && value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){ // Ta metoda służy temu, żeby bierząca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(){
      // thisWidget.setValue(thisWidget.dom.input.value); // Sprawdzamy czy nowa wartość jest poprawna
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1); // Zostawiliśmy tu wywołanie 'starej' metody setValue, ale napisaliśmy (adnotację) 
      // do tego w nadrzędnej klasie
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1); // To samo co powyżej
    });
  }
}

export default AmountWidget;