import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initBooking: function(){
    const thisApp = this;
    
    /* find container of booking*/
    thisApp.bookingWrapper = document.querySelector(select.containerOf.booking);

    /* create new instance for class Booking */
    new Booking(thisApp.bookingWrapper);
  },

  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children; // Wszystkie dzieci konterera podstron
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id; // Zapisujemy thisApp.pages[0].id a nie false , bo jakbyśmy wpisali ręcznie niepoprawy hash 
    // podstrony to żadna z podstron by sie nie wyświetliła, a tak to wyświetli się pierwsza postrona

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash); // Zapisujemy która z podstron ma się wyświetlać pierwsza

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id; // Dodajemy /, żeby zlikwidować domyślne działania przeglądarki, tzn żeby po odświeżeniu 
        // nie zjeżdżało okno w dół do miejsca gdzie zaczyna element o nazwie #order
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){  // W .toggle za pomocą drugiego argumentu możemy kontrolować to czy klasa zostanie nadana, czy nie!! 
      // Możemy tu użyć warunku takiego jak w bloku if!!
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){ 
      link.classList.toggle( // Możemy to rozbić na taki zapis
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },
  
  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);

    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },

  initData: function(){
    const thisApp = this;

    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        // console.log('parsedResponse', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        thisApp.initMenu(); //Przenieśliśmy tutaj wywołanie tej funkcji w związku z asynchronicznością API, inaczej initMenu 
        // uruchamiałby się, zanim skrypt otrzymałby listę produktów
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));

    thisApp.data = {};
  },

  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initHomePage: function(){
    const thisApp = this;

    const homePageElem = document.querySelector(select.containerOf.homePage);
    thisApp.homePage = new HomePage(homePageElem);
    // console.log('homePageElem:', homePageElem);
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();
    thisApp.initData();
    thisApp.initHomePage();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();

export default app;