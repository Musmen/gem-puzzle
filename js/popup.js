import { disableDocumentScroll, enableDocumentScroll, disableTab } from './utils';

export default class Popup {
  constructor(container = null, mainClass = 'popup', onCloseCallback) {
    this.container = container;
    this.mainClass = mainClass;
    this.onCloseCallback = onCloseCallback;

    this.close = this.close.bind(this);
  }

  onOpenPopupHandler(popup) {
    popup.addEventListener('keydown', disableTab.bind(this));
  }

  onClosePopupHandler(popup) {
    popup.removeEventListener('keydown', disableTab.bind(this));
  }

  build(content) {
    const { mainClass } = this;
    const { description, message } = content;

    const popup = document.querySelector('#popup__template').content.cloneNode(true);
    const layout = popup.querySelector('.popup__layout');

    layout.classList.add(mainClass);
    if (description) popup.querySelector('.popup__description').textContent = description;
    if (message) popup.querySelector('.popup__message').innerText = message;

    layout.addEventListener('click', this.close);

    return popup;
  }

  open(content) {
    const { container } = this;
    const popup = this.build(content);

    container.append(popup);

    const popupLayout = container.querySelector('.popup__layout');
    popupLayout.focus();
    this.onOpenPopupHandler(popupLayout);
    disableDocumentScroll();
  }

  close(event) {
    const { target } = event;
    const { container } = this;
    const popup = container.querySelector('.popup__layout');
    const closePopupButton = popup.querySelector('.popup__close-button');
    if (target !== closePopupButton) return;

    if (this.onCloseCallback) this.onCloseCallback();
    this.onClosePopupHandler(popup);
    popup.remove();
    enableDocumentScroll();
  }
}
