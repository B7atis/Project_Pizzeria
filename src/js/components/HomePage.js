import {templates, select} from '../settings.js';
import app from '../app.js';

class HomePage {
  constructor(element) {
    const thisHomePage = this;

    thisHomePage.render(element);
    thisHomePage.initAction();
    thisHomePage.initFlickity();
  }

  render(element) {
    const thisHomePage = this;

    const generatedHTML = templates.homePage();

    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;
    thisHomePage.dom.wrapper.innerHTML = generatedHTML;

    thisHomePage.dom.boxLinksWrapper = element.querySelector(select.homePage.boxLinksWrapper).children;

  }

  initFlickity() {
    const elem = document.querySelector('.main-carousel');
    const flkty = new Flickity( elem, {  // eslint-disable-line
    // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
    });
  }

  initAction() {
    const thisHomePage = this;

    for(let boxLink of thisHomePage.dom.boxLinksWrapper) {
      boxLink.addEventListener('click', function(event) {
        event.preventDefault();

        const boxLinkId = boxLink.getAttribute('data-link');
        console.log('boxLinkId:', boxLinkId);

        app.activatePage(boxLinkId);
        window.location.hash = '#/' + boxLinkId;
      });
    }
  }
}

export default HomePage;