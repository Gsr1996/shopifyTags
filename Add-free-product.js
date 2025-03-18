

// freee product
(function() {
  
     async function addToCartClick(event) {
        try {
            const cartResponse = await fetch(window.Shopify.routes.root + 'cart.js');
            const cartData = await cartResponse.json();

            const productToCheck = 9704804516155;
            const productInCart = cartData.items.some(item => item.product_id === productToCheck);
            console.log(productInCart, 'productInCart');

            if (productInCart) {
                console.log('Product is already in the cart.');
            } else {
              await delay(1000);
                await afterClickFunction();
            }
        } catch (error) {
            console.error('Error checking cart contents:', error);
        }
    }
  
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

   async function afterClickFunction() {
     try{
        var itemId = item.ProductID;
        console.log(itemId, 'itemId');
        if (itemId === 8731206975803 || 8096980566331) {
            const productId = 8096980894011;
            const variantId = 49273986384187;
            // Prepare the data to send
            const data = {
                items: [{
                    id: variantId,
                }]
            };
            fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.text())
                .then(response => {
                    console.log('Product added to cart:');
                })
                .catch((error) => {
                    console.error('Error adding product to cart:', error);
                });
          
            setTimeout(onCartUpdate, 1000);

        }
     }
       catch (error) {
            console.error('Error checking cart contents:', error);
        }
     
    }


   async function onCartUpdate() {
        await fetch(window.Shopify.routes.root + "?section=cart-drawer")
            .then((response) => response.text())
            .then((responseText) => {
                const cart_open = document.querySelector('#CartDrawer');
                const countBubble = document.querySelector('.cart-count-bubble');
                const html = new DOMParser().parseFromString(responseText, 'text/html');
                const bulle = html.querySelector('.cart-count-bubble');
                const cart_drawer = html.querySelector('.cart-drawer');
                cart_open.innerHTML = cart_drawer.innerHTML;
                countBubble.innerHTML = bulle.innerHTML;
            })
            .catch(e => {
                console.error(e);
            });
       setTimeout(removeProduct, 1000);
    }

   
 async function removeProduct(){
  console.log('click');
  var removeButton = document.querySelectorAll('cart-remove-button');
     removeButton.forEach(function(removeButton) {
       setTimeout(()=> {
          removeButton.addEventListener('click',reoveProduct)},3000);
        });
   
 async function reoveProduct(event){
           var removeProductId = this.querySelector('aria-label');
    let CartProduct = fetch(window.Shopify.routes.root + 'cart.js')
            .then(response => response.json())
            .then(data => {
              const ptte = 9704804516155
               const removeprot = data.items.some(item => item.product_id === ptte);
                console.log(removeprot,'removeprot');
                      if (removeprot) {
                        return true;  
                    } else {
                        return false;
                    }
            });
        const relts = CartProduct.then((result) => {
            console.log(result, 'result')
            if (result == true) {
               setTimeout(removeProductCart,1000);
               console.log('product  availabel');
            } else {

                console.log('product not  availabel');

            }
        })
    }
   
// Remove product from the cart
    async function removeProductFromCart(productId) {
    try {
      console.log("running");
        const response = await fetch(window.Shopify.routes.root + 'cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                updates: {
                    [productId]: 0 // Set quantity to 0 to remove the item
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to remove product from cart');
        }

        console.log('Product removed from cart.');
        await checkCart(); // Check the cart after product removal

    } catch (error) {
        console.error('Error removing product from cart:', error);
    }
}
   
 async function removeProduct() {
       
        const removeButtons = document.querySelectorAll('cart-remove-button');
           console.log('click',removeButtons);
        removeButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const productId = event.target.getAttribute('data-product-id');
                const cartData = await fetch(window.Shopify.routes.root + 'cart.js')
                    .then(response => response.json());

                const productIdToMonitor = 8731206975803; // First product
                const associatedProductId = 8096980566331; // Second product
                const productInCart = cartData.items.some(item => item.product_id === productIdToMonitor);
                const associatedInCart = cartData.items.some(item => item.product_id === associatedProductId);

                if (!productInCart || !associatedInCart) {
                    await removeProductFromCart(49273986384187); // Remove associated product
                }
            });
        });
    }
   
 async function checkCart() {
    try {
        const response = await fetch('/cart.js');
        if (!response.ok) {
            throw new Error('Failed to fetch cart data');
        }

        const cart = await response.json();
        if (cart.item_count === 0) {
            await onCartUpdate();
           await emptyCart();
        } else {
            await onCartUpdate(); // Update the cart if there are items remaining
        }

    } catch (error) {
        console.error('Error checking cart contents:', error);
    }
}
  
  
   function emptyCart() {
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
        cartDrawer.classList.add('is-empty');
        console.log('Cart is now empty.');
    } else {
        console.error('Cart drawer element not found.');
    }
}

    window.onload = function functionCall() {
        const element = document.querySelector('product-form'); // Adjust the selector as needed
        const addButton = element.querySelectorAll('[name="add"]');
        console.log(addButton, 'button');
        addButton.forEach(function(addButton) {
            addButton.addEventListener('click', addToCartClick);
        });
    }

  removeProduct();
 }
  
})();
// end free product
