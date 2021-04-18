import {templates, select, settings, classNames} from './../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element){
    const thisBooking = this;

    thisBooking.booked = {};
    thisBooking.starters = [];

    /* call the render method with an argument 'element' */
    thisBooking.render(element);

    /* call the initWidgets method with no argument */
    thisBooking.initWidgets();

    /* call the getDate method with no argument */
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);


    const params = {
      booking: [
        startDateParam,      
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,      
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,   
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking 
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event   
                                     + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table); 
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.selectedPlace = null;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      table.classList.remove(classNames.booking.tableSelected);
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }


  render(element){
    const thisBooking = this;

    /* generate HTML code from template */
    const generatedHTML = templates.bookingWidget();

    /* create an empty thisBooking.dom object */
    thisBooking.dom = {};

    /* add a property 'wrapper' to the object and assign a reference to it */
    thisBooking.dom.wrapper = element;
    // console.log(element);

    /* change the wrapper content to HTML code */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.eachTables = thisBooking.dom.wrapper.querySelector(select.booking.eachTables);
    
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);

    thisBooking.dom.checkboxes = thisBooking.dom.wrapper.querySelector('.booking-options');
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector('.booking-form');
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

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('click', function(){

    });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('click', function(){

    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.eachTables.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.changeEvent = event;
      thisBooking.bookTable(event);
    });

    thisBooking.dom.checkboxes.addEventListener('click', function(event){
      thisBooking.choseStarters(event);
    });

    thisBooking.dom.submit.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendOrder();
    });
  }

  bookTable(event){
    const thisBooking = this;

    const clickedElement = event.target;

    if(clickedElement.classList.contains(classNames.booking.table)){
      const tableNumber = clickedElement.getAttribute('data-table');

      if(!clickedElement.classList.contains(classNames.booking.tableBooked)
        && 
        !clickedElement.classList.contains(classNames.booking.tableSelected)){
        const activeTable = thisBooking.dom.wrapper.querySelector(select.booking.tableSelected);
        if(activeTable){
          activeTable.classList.remove(classNames.booking.tableSelected);
        }
        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedPlace = tableNumber;
      } else if(!clickedElement.classList.contains(classNames.booking.tableBooked)
        && 
        clickedElement.classList.contains(classNames.booking.tableSelected)){ 
        clickedElement.classList.remove(classNames.booking.tableSelected);
        thisBooking.selectedPlace = null;
      } else { 
        alert('This table is not available at the moment. Please select another one.');
      }
    }
  }

  choseStarters(event){
    const thisBooking = this;
    if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox'){
      if (event.target.checked == true){
        thisBooking.starters.push(event.target.value);
      }
      else if (event.target.checked == false){
        const indexOfFilters = thisBooking.starters.indexOf(event.target.value);
        thisBooking.starters.splice(indexOfFilters, 1);
      }
      console.log(thisBooking.starters);
    }
  }


  sendOrder(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    console.log(url);

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedPlace,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    for(let starter of thisBooking.starters){
      payload.starters.push(starter);
    }

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);

    for (let item in payload){
      thisBooking.makeBooked(item.date, utils.numberToHour(item.hour), item.duration, item.table);

      location.reload();
    }
  }
}

export default Booking;