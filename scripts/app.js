document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    const cartItems = document.getElementById('cart-items');
    const totalElement = document.getElementById('total');
    const confirmButton = document.getElementById('confirm-purchase');
    const finishButton = document.getElementById('finish-purchase');
    const viewPurchasesButton = document.getElementById('view-purchases');
    const purchasesModal = document.getElementById('purchases-modal');
    const closeModalButton = document.querySelector('.modal .btn-close');
    const purchasesList = document.getElementById('purchases-list');
    let cart = [];

    // Fetch products from JSON file
    async function fetchProducts() {
        try {
            const response = await fetch('scripts/data.json');
            const products = await response.json();
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product');
                productDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" width="100">
                    <div>
                        <h3>${product.name}</h3>
                        <p>Precio: $${product.price}</p>
                        <button onclick="addToCart(${product.id})">Añadir al Carrito</button>
                    </div>
                `;
                productList.appendChild(productDiv);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Hubo un problema al cargar los productos. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    async function addToCart(id) {
        try {
            const response = await fetch('scripts/data.json');
            const products = await response.json();
            const product = products.find(p => p.id === id);
            const cartItem = cart.find(item => item.id === id);

            if (cartItem) {
                cartItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            renderCart();
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Hubo un problema al añadir el producto al carrito. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    function removeFromCart(id) {
        try {
            const cartItemIndex = cart.findIndex(item => item.id === id);
            if (cartItemIndex !== -1) {
                cart.splice(cartItemIndex, 1);
                renderCart();
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Hubo un problema al eliminar el producto del carrito. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    function renderCart() {
        try {
            cartItems.innerHTML = '';
            let total = 0;

            cart.forEach(item => {
                total += item.price * item.quantity;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${item.price * item.quantity}</span>
                    <button onclick="removeFromCart(${item.id})">Eliminar</button>
                `;
                cartItems.appendChild(cartItemDiv);
            });

            totalElement.textContent = `Total: $${total.toFixed(2)}`;

            if (cart.length > 0) {
                confirmButton.classList.remove('hidden');
            } else {
                confirmButton.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error rendering cart:', error);
            alert('Hubo un problema al mostrar el carrito. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    function mostrarMensaje() {
        const confirmationMessage = document.createElement('div');
        confirmationMessage.id = 'confirmation-message';
        confirmationMessage.className = 'confirmation-message';
        confirmationMessage.textContent = 'Compra Realizada con éxito';
        document.getElementById('cart').appendChild(confirmationMessage);

        setTimeout(() => {
            confirmationMessage.remove();
        }, 3000);
    }

    confirmButton.addEventListener('click', () => {
        try {
            if (cart.length === 0) {
                alert("No hay productos en el carrito");
                return;
            }
            savePurchase(cart);
            mostrarMensaje();
            finishButton.classList.remove('hidden');
        } catch (error) {
            console.error('Error confirming purchase:', error);
            alert('Hubo un problema al confirmar la compra. Por favor, inténtalo de nuevo más tarde.');
        }
    });

    finishButton.addEventListener('click', () => {
        try {
            cart = [];
            renderCart();
            finishButton.classList.add('hidden');
        } catch (error) {
            console.error('Error finishing purchase:', error);
            alert('Hubo un problema al finalizar la compra. Por favor, inténtalo de nuevo más tarde.');
        }
    });

    function savePurchase(cart) {
        try {
            let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
            purchases.push({ date: new Date().toISOString(), cart: JSON.parse(JSON.stringify(cart)) });
            localStorage.setItem('purchases', JSON.stringify(purchases));
        } catch (error) {
            console.error('Error saving purchase:', error);
            alert('Hubo un problema al guardar la compra. Por favor, inténtalo de nuevo más tarde.');
        }
    }

    viewPurchasesButton.addEventListener('click', () => {
        try {
            purchasesList.innerHTML = '';
            const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
            if (purchases.length === 0) {
                purchasesList.innerHTML = '<p>No se han realizado compras.</p>';
            } else {
                purchases.forEach(purchase => {
                    const purchaseDiv = document.createElement('div');
                    purchaseDiv.classList.add('purchase');
                    purchaseDiv.innerHTML = `
                        <h3>Compra del ${new Date(purchase.date).toLocaleString()}</h3>
                        <ul>
                            ${Array.isArray(purchase.cart) ? purchase.cart.map(item => `<li>${item.name} (x${item.quantity}) - $${item.price * item.quantity}</li>`).join('') : ''}
                        </ul>
                    `;
                    purchasesList.appendChild(purchaseDiv);
                });
            }
            const modal = new bootstrap.Modal(purchasesModal);
            modal.show();
        } catch (error) {
            console.error('Error viewing purchases:', error);
            alert('Hubo un problema al mostrar las compras. Por favor, inténtalo de nuevo más tarde.');
        }
    });

    closeModalButton.addEventListener('click', () => {
        try {
            purchasesModal.classList.add('hidden');
            purchasesModal.style.display = 'none';
        } catch (error) {
            console.error('Error closing modal:', error);
            alert('Hubo un problema al cerrar el modal. Por favor, inténtalo de nuevo más tarde.');
        }
    });

    confirmButton.classList.add('hidden');
    finishButton.classList.add('hidden');
    purchasesModal.classList.add('hidden');

    // Hacer la función addToCart accesible globalmente
    window.addToCart = addToCart;

    // Inicializar productos
    fetchProducts();
});
