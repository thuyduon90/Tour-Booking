/*eslint-diasble*/

import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// VALUES

// DELEGATION
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (mapbox) {
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations);
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}

// console.log(JSON.parse(locations));