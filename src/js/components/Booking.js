import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    /* call the render method with an argument 'element' */
    thisBooking.render(element);

    /* call the initWidgets method with no argument */
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    /* generate HTML code from template */
    const generatedHTML = templates.bookingWidget(element);

    /* create an empty thisBooking.dom object */
    thisBooking.dom = {};

    /* add a property 'wrapper' to the object and assign a reference to it */
    thisBooking.dom.wrapper = element;
    // console.log(element);

    /* change the wrapper content to HTML code */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;

    /* add a property dom.peopleAmount */
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);

    /* add listener */
    thisBooking.dom.peopleAmount.addEventListener('click', function(){

    });

    /* add a property dom.hoursAmount */
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    /* add listener */
    thisBooking.dom.hoursAmount.addEventListener('click', function(){

    });
  }
}

export default Booking;