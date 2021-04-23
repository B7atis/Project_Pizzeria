class BaseWidget{
  constructor(wrapperElement, initialValue){ // Chcemy,żeby przyjmował 2 argumenty: element DOM, w którym znajduje się ten widget 
    // i początkową wartość widgetu
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){ // To jest GETTER, czyli metoda wykonywana przy każdej próbie odczytania wartości właściwości value!!
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){ // To jest SETTER, czyli metoda, która jest wykonywana przy każdej próbie ustawienia nowej wartości właściwości value!!
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    /* TODO: Add validation */
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)) { // Spr. czy nowa value jest rózna od dotychczasowej value
      thisWidget.correctValue = newValue;
      thisWidget.announce(); // Wywoałanie eventu
    }
      
    thisWidget.renderValue();
  }

  setValue(value){ // Wprowadzając GETery i SETery, czyli usuwając starą metodę setValue, możemy zostawić taki zapis, żebyśmy sie nie 
    // martwili że jakiś fragment naszej aplikacji korzysta ze starej składni i teraz przestanie działać
    const thisWidget = this;

    thisWidget.value = value;
  }

  parseValue(value){ // Wydzieliliśmy metodę parseInt
    return parseInt(value);
  }

  isValid(value){ // Spr. czy value jest liczbą
    return !isNaN(value);
  }

  renderValue(){ // Ta metoda służy do tego, aby bierząca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value; // Jest bezpieczniej przypisać .value, a nie .correctValue, żeby został wykonany SETTER
  }

  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true // Metoda bubbles powoduje, że event bąbelkuje(propagacja) swoim zasięgiem do góry, czyli na rodzica, dziadka itd, 
      // w przypadku customowego eventu
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;