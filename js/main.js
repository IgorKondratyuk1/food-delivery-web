'use srict';

const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const passwordInput = document.querySelector('#password');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const rating = document.querySelector('.card-info > .rating');
const price = document.querySelector('.card-info > .price');
const category = document.querySelector('.card-info > .category');
const modalBody = document.querySelector('.modal-body');
const modalPricetag = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('gloDelivery');

const cart = [];

const getData = async function(url) {
    
    const response = await fetch(url);

    if (!response.ok){
        throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}`);
    }

    return await response.json();
};



function toggleModal() {
    modal.classList.toggle("is-open");
}

function toogleModalAuth() {
    modalAuth.classList.toggle('is-open');
}

function authorized() {

    function logOut() {
        login = null;
        localStorage.removeItem('gloDelivery');
        buttonAuth.style.display = 'block';
        userName.style.display = 'none';
        buttonOut.style.display = 'none';
        cartButton.style.display = 'none';
        buttonOut.removeEventListener('click', logOut);
        localStorage.removeItem('gloDelivery');
        checkAuth();
    }

    console.log('Authorized');
    userName.textContent = login;
    buttonAuth.style.display = 'none';
    userName.style.display = 'inline';
    buttonOut.style.display = 'flex';
    cartButton.style.display = 'flex';
    buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {
    console.log('Not authorized');

    function logIn(event) {
        event.preventDefault();
        login = loginInput.value;
        let password = passwordInput.value; 

        if (login && password){
            console.log('All good');

            localStorage.setItem('gloDelivery', login);
            toogleModalAuth();
            buttonAuth.removeEventListener('click', toogleModalAuth);
            closeAuth.removeEventListener('click', toogleModalAuth);
            logInForm.removeEventListener('submit', logIn);
            logInForm.reset();
            checkAuth();
        }else {
            if(!(login || password)){
                alert('Input your login and password');
            } else if(!login && password){
                alert('Input your login ');
            } else if (login && !password){
                alert('Input your password');
            }
        }
    }

    buttonAuth.addEventListener('click', toogleModalAuth);
    closeAuth.addEventListener('click', toogleModalAuth);
    logInForm.addEventListener('submit', logIn);
}

function checkAuth() {
    if (login) {
        authorized();
    } else {
        notAuthorized();
    }
}

// создаем блок карточки-категории товаров 
function createCardRestaurant({ image, kitchen, name, price, 
    stars, products, time_of_delivery: timeOfDelivery }){

    const card = `
        <a class="card card-restaurant" data-products="${products}" data-name="${name}" data-stars="${stars}" data-price="${price}" data-kitchen="${kitchen}">
            <img src="${image}" alt="image" class="card-image"/>
            <div class="card-text">
                <div class="card-heading">
                    <h3 class="card-title">${name}</h3>
                    <span class="card-tag tag">${timeOfDelivery} мин.</span>
                </div>
                <div class="card-info">
                    <div class="rating">
                        ${stars}
                    </div>
                    <div class="price">От ${price} ₽</div>
                    <div class="category">${kitchen}</div>
                </div>

            </div>
        </a>
    `;

    cardsRestaurants.insertAdjacentHTML('beforeend', card);
}

// создаем карточки товаров когда кликнули на определенную карточку-категорию товаров
function createCardGood(goods){
    //деструктуризация объекта
    const { 
        id, 
        name, 
        description, 
        price, 
        image 
    } = goods;

    const card = document.createElement('div');
    card.className = 'card';
    const card_content = `
        <img src="${image}" alt="image" class="card-image"/>
        <div class="card-text">
            <div class="card-heading">
                <h3 class="card-title card-title-reg">${name}</h3>
            </div>
            <div class="card-info">
                <div class="ingredients">${description}
                </div>
            </div>
            <div class="card-buttons">
                <button class="button button-primary button-add-cart" id="${id}">
                    <span class="button-card-text">В корзину</span>
                    <span class="button-cart-svg"></span>
                </button>
                <strong class="card-price card-price-bold">${price} ₽</strong>
            </div>
        </div>
    `;

    card.insertAdjacentHTML('beforeend', card_content);
    cardsMenu.insertAdjacentElement('beforeend', card);
}

function openGoods(event){
    const target = event.target;

    if (login){

        const restaurant = target.closest('.card-restaurant');

        if (restaurant){
            cardsMenu.textContent = '';
            containerPromo.classList.add('hide');
            restaurants.classList.add('hide');
            menu.classList.remove('hide');
            restaurantTitle.innerHTML =`${restaurant.dataset.name}`;
            rating.innerHTML =`${restaurant.dataset.stars}`;
            price.innerHTML =`От ${restaurant.dataset.price} ₽`;
            category.innerHTML =`${restaurant.dataset.kitchen}`;
            getData(`./db/${restaurant.dataset.products}`).then(function(data){
                data.forEach(createCardGood);
            });
        }
    }else {
        toogleModalAuth();
    }
    
}

function addToCart(event) {

    const target = event.target;

    const buttonAddToCart = target.closest('.button-add-cart');
    if (buttonAddToCart) {
        const card = target.closest('.card');
        const title = card.querySelector('.card-title-reg').textContent;
        const cost = card.querySelector('.card-price').textContent;
        const id = buttonAddToCart.id;

        const food = cart.find(function(item) {
            return item.id === id;
        });
        console.log(food);

        if (food){
            food.count += 1;
        } else{
            cart.push({
                //id: id
                //title: title ...
                id,
                title,
                cost,
                count: 1
            });
        }
    }
}

function renderCart() {
    modalBody.textContent = '';
    cart.forEach(function({ id, title, cost, count }){
        const itemCart = `
            <div class="food-row">
                <span class="food-name">${title}</span>
                <strong class="food-price">${cost}</strong>
                <div class="food-counter">
                    <button class="counter-button counter-minus" data-id=${id}>-</button>
                    <span class="counter">${count}</span>
                    <button class="counter-button counter-plus" data-id=${id}>+</button>
                </div>
            </div>
        `

        modalBody.insertAdjacentHTML('beforeend', itemCart);
    });

    const totalPrice = cart.reduce(function(result, item) {
        return result + parseFloat(item.cost) * item.count;
    }, 0);

    modalPricetag.textContent = totalPrice + ' ₽';
}

function changeCount(event){
    const target = event.target;

    if(target.classList.contains('counter-button')){
        const food = cart.find(function(item){
            return item.id === target.dataset.id;
        });
        if (target.classList.contains('counter-minus')){
            food.count--;
            if(food.count === 0){

                cart.splice(cart.indexOf(food),1);
            }
        }
    
        if (target.classList.contains('counter-plus')){
            food.count++;
        }
        renderCart();
    }
}

function init(){
    getData('./db/partners.json').then(function(data){
        data.forEach(createCardRestaurant);
    });
    
    cartButton.addEventListener("click", function() {
        renderCart();
        toggleModal();

    });

    buttonClearCart.addEventListener('click', function(){
        cart.length = 0;
        renderCart();
    })

    modalBody.addEventListener('click', changeCount);

    cardsMenu.addEventListener('click', addToCart);
    
    close.addEventListener("click", toggleModal);
    
    // на главную при клике на значек ЛОГО
    cardsRestaurants.addEventListener('click', openGoods);
    
    logo.addEventListener('click', function(){
        containerPromo.classList.remove('hide');
        restaurants.classList.remove('hide');
        menu.classList.add('hide');
    });
    
    checkAuth();
}

init();