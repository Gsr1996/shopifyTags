// addtocart submit add this
 const drawer = document.querySelector('cart-drawer');
 if (drawer) {
              fetch(window.Shopify.routes.root + "?section=cart-drawer")
                .then((response) => response.text())
                .then((responseText) => {
                  // Parse the response text into a DOM
                  const html = new DOMParser().parseFromString(responseText, 'text/html');
                  const cart_open = document.querySelector('#cartDrawer');
                  const countBubble = document.querySelector('.cart-count .cart-count-number');
                  const cart_drawer = html.querySelector('.cart-drawer');
                  const newCountBubble = html.querySelector('.cart-count .cart-count-number');
                    const cart_drawer_open = document.querySelector('cart-drawer');
                  if (cart_open && cart_drawer) {
                    // Update the cart drawer content
                    cart_open.innerHTML = cart_drawer.innerHTML;
                    countBubble.innerHTML = newCountBubble.innerHTML;
                    // Open the cart drawer
                    cart_drawer_open.classList.add('animate', 'active');    
                     publish(PUB_SUB_EVENTS.cartUpdate, {
                        source: 'product-form',
                        cartData: responseText,
                      });
                     cart_drawer_open.renderContents(responseText);
                  } else {
                    console.warn('Cart elements not found in the document or response.');
                  }
                }).then((data) =>{
                })
                .catch((error) => {
                  console.error('Error fetching and updating the cart drawer:', error);
                });
        }


<!-- pubsub start -->
const ON_CHANGE_DEBOUNCE_TIMER = 300;

const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  optionValueSelectionChange: 'option-value-selection-change',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

let subscribers = {};

function subscribe(eventName, callback) {
  if (subscribers[eventName] === undefined) {
    subscribers[eventName] = [];
  }

  subscribers[eventName] = [...subscribers[eventName], callback];

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter((cb) => {
      return cb !== callback;
    });
  };
}

function publish(eventName, data) {
  if (subscribers[eventName]) {
    subscribers[eventName].forEach((callback) => {
      callback(data);
    });
  }
}


<!-- pubsub end -->


function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

class CartDrawer extends HTMLElement {
  constructor() {
    super();
     
  
 
  }
  
   connectedCallback() {
     console.log('CartDrawer: connectedCallback invoked');
    this.container = document.getElementById('cartDrawer');
       
             this.debouncedOnChange = debounce((event) => {
                  this.onChange(event);
              },300);
          this.init();
        this.container.addEventListener('change', this.debouncedOnChange.bind(this));
        this.removeProductEvent();
      this.setHeaderCartIconAccessibility();
     

    }
  init(){
    this.listen();
  }
 
listen() {
   this.addEventListener(
      'transitionend',
      () => {
      },
      { once: true }
    );
  }
  setHeaderCartIconAccessibility() {
    const cartLink = document.getElementById('cart-icon-bubble');
    if (!cartLink) return;

    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
  }
onChange(event){
  if ( event.target.classList.contains('quntity_input')) {
      this.updateQuantity(event.target.value,event.target.dataset.quantityKey);
  }
  
   setTimeout(() => {
      this.open();
    });
}
  removeProductEvent() {
		let removes = this.container.querySelectorAll('.remove');
		removes.forEach((remove) => {
      remove.addEventListener('click', (event) => {
        event.stopPropagation();
          event.preventDefault();
        // console.log(remove.dataset.removeItem,'remove.dataset.removeItem');
        this.updateQuantity('0', remove.dataset.removeItem);
      });
    });
  }
  updateQuantity(quantity, lineItemKey) {
    let addelement = this.container.querySelector(`[data-product-key="${lineItemKey}"]`);
     console.log(quantity, lineItemKey);
    if (addelement) {
      addelement.classList.add('loading');
    } else {
      console.log(`Element with data-productkey="${lineItemKey}" not found.`);
    }
    
    const payload = {
      quantity: quantity,
      id: lineItemKey,
    };
    
    fetch(`${window.Theme.routes.cart_change_url}.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error updating quantity: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
         const cart_dr_open = document.querySelector('cart-drawer');
        if(data.item_count > 0){
         cart_dr_open.classList.remove('is-empty');
        }else{
          cart_dr_open.classList.add('is-empty');
        }
        this.updateCartdrawer();
      })
      .then((data) => {
        let removelement = this.container.querySelector(`[data-product-key="${lineItemKey}"]`);
          if (removelement) { 
            this.removeProductEvent();
          } else {
            console.log(`Element with data-productkey="${lineItemKey}" not found.`);
          }   
        setTimeout(() => {
              removelement.classList.remove('loading-spinner');
          }, 1000);
      })
      .catch((error) => {
        console.error('Failed to update quantity:', error);
        console.log('Failed to update quantity. Please try again.');
      });
    
  }

  async updateCartdrawer() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}?section=cart-drawer`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      const html = new DOMParser().parseFromString(responseText, 'text/html');

      const newCartDrawer = html.querySelector('.cart-drawer');
      const countBubble = document.querySelector('.cart-count .cart-count-number');
      const newCountBubble = html.querySelector('.cart-count .cart-count-number');
        countBubble.innerHTML = newCountBubble.innerHTML;
      if (!newCartDrawer) {
        console.error('Required elements not found in fetched HTML.');
        return;
      }

      const cartDrawer = document.querySelector('#cartDrawer');
      if (cartDrawer) {
        cartDrawer.innerHTML = newCartDrawer.innerHTML;
      
      } else {
        console.error('#CartDrawer not found in the document.');
      }

      const cartDrawerElement = document.querySelector('cart-drawer');
      if (cartDrawerElement) {
        cartDrawerElement.classList.add('active');
       
      }
    } catch (error) {
      console.error('Failed to update cart drawer:', error);
    }
    this.removeProductEvent();
  }
  renderContents(response){
    
    setTimeout(()=>{
                 this.removeProductEvent();
              },300);
    this.open();
  //console.log('responsive',response);
  }

  open(triggeredBy) {
    this.classList.add('animate', 'active');
    this.addEventListener(
      'transitionend',
      () => {
       // console.log('open');
      },
      { once: true }
    );
     document.body.classList.add('open-cc');
  }
}

customElements.define('cart-drawer', CartDrawer);

class PanelClose extends HTMLElement {

  constructor() {
     super();
  

      this.addEventListener('click', (e) => this.close_panel(e));
     this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close_panel(e));
    document.querySelector('.site-overlay').addEventListener('click', this.close_panel.bind(this));
    let cc = document.querySelector('.site-overlay');
    document.addEventListener('keyup', (e) => {
      if (e.code) {
        if (e.code.toUpperCase() === 'ESCAPE') {
          document.querySelectorAll('.drawer').forEach((panel) => {
            panel.classList.remove('active');
            document.body.classList.remove('open-cc');
          });
        }
      }
    });
    cc.addEventListener('click', (e) => {
      document.body.classList.remove('open-cc');
      if (document.querySelector('.drawer.active')) {
        document.querySelector('.drawer.active').classList.remove('active');
      }
    });
    
  }

  close_panel(e) {
    e.preventDefault();
    console.log(e);
    let panel = e.target.closest('.drawer');
     if(panel){
    panel.classList.remove('active');
     }else{
       document.querySelector('.drawer.active').classList.remove('active');
     }
    document.body.classList.remove('open-cc');
  }
}
customElements.define('side-panel-close', PanelClose);

class QuantityInput extends HTMLElement {
  constructor() {
    super();

    // Select the elements
    this.subtract = this.querySelector('.minus');
    this.add = this.querySelector('.plus');
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', {
	      bubbles: true
	    });

    // Ensure the elements exist
    if (!this.subtract || !this.add || !this.input) {
      console.error('QuantityInput: Required elements not found.');
      return;
    }

    // Bind event listeners
    this.subtract.addEventListener('click', this.handleSubtract.bind(this));
    this.add.addEventListener('click', this.handleAdd.bind(this));
  }

  handleSubtract() {
    let currentValue = parseInt(this.input.value) || 0; // Default to 0 if not a number
    if (currentValue > 0) {
      this.input.value = currentValue - 1;
      this.input.dispatchEvent(this.changeEvent);
    }
  }

  handleAdd() {
    let currentValue = parseInt(this.input.value) || 0; // Default to 0 if not a number
    this.input.value = currentValue + 1;
    this.input.dispatchEvent(this.changeEvent);
  }
}

// Define the custom element
customElements.define('quantity-selector', QuantityInput);







class CartShippingMessage extends HTMLElement {
  constructor() {
    super();
    this.selectors = {
      cartMessage: '[data-cart-message]',
      cartMessageValue: 'data-cart-message',
      leftToSpend: '[data-left-to-spend]',
      cartProgress: '[data-cart-progress]',
    };

    this.classes = {
      isHidden: 'is-hidden',
      isSuccess: 'is-success',
    };

    this.cartMessage = this.querySelectorAll(this.selectors.cartMessage);
    if (this.cartMessage.length > 0) {
      this.init();
    }
  }

  connectedCallback() {
    // Initialize when the element is connected to the DOM
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.init();
    }
  }

  init() {
    this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute('data-limit')) * 100;
    this.shippingAmount = 0;
    this.circumference = 28 * Math.PI; // radius - stroke * 4 * PI

    this.cartBarProgress();
    this.listen();
  }

  listen() {
    document.addEventListener(
      'theme:cart:change',
      (event) => {
        this.cart = event.detail.cart;
        this.render();
      }
    );
  }

  render() {
    if (this.cart && this.cart.total_price) {
      const totalPrice = this.cart.total_price;
      this.freeShippingMessageHandle(totalPrice);

      if (this.cartMessage.length > 0) {
        this.shippingAmount = totalPrice;
        this.updateProgress();
      }
    }
  }

  freeShippingMessageHandle(total) {
    if (this.cartMessage.length > 0) {
      this.querySelectorAll(this.selectors.cartMessage).forEach((message) => {
        const hasFreeShipping =
          message.hasAttribute(this.selectors.cartMessageValue) &&
          message.getAttribute(this.selectors.cartMessageValue) === 'true' &&
          total !== 0;

        const cartMessageClass = hasFreeShipping ? this.classes.isSuccess : this.classes.isHidden;

        message.classList.toggle(cartMessageClass, total >= this.cartFreeLimitShipping);
      });
    }
  }

  cartBarProgress(progress = null) {
    this.querySelectorAll(this.selectors.cartProgress).forEach((element) => {
      this.setProgress(element, progress === null ? element.getAttribute('data-percent') : progress);
      console.log(progress);
    });
  }

  setProgress(holder, percent) {
    let offset = this.circumference - ((percent / 100) * this.circumference) / 2;
    //holder.style.strokeDashoffset = offset;
    if(offset < 0){
      offset = 0;
    }
     holder.style.width = offset;
  }

  updateProgress() {
    const newPercentValue = (this.shippingAmount / this.cartFreeLimitShipping) * 100;
    const leftToSpend = themeCurrency.formatMoney(
      this.cartFreeLimitShipping - this.shippingAmount,
      theme.moneyFormat
    );

    this.querySelectorAll(this.selectors.leftToSpend).forEach((element) => {
      element.innerHTML = leftToSpend.replace('.00', '');
      console.log('left-spend', leftToSpend);
      console.log('left-shippingAmount', this.shippingAmount);
    });
    console.log(newPercentValue,'newPercentValue');
    this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
  }
}

// Define the custom element
customElements.define('cart-shipping-message', CartShippingMessage);


