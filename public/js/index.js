/*eslint-diasble*/

import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSetings } from './updateSettings';

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateFormData = document.querySelector('.form-user-data');
const updateFormPassword = document.querySelector('.form-user-password');

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

if (updateFormData) {
    updateFormData.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        updateSetings({
                name,
                email
            },
            'data'
        );
    });
}

if (updateFormPassword) {
    updateFormPassword.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn-save-password').textContent = 'Updating...';
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password-new').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSetings({
                password,
                newPassword,
                passwordConfirm
            },
            'password'
        );
        document.querySelector('.btn-save-password').textContent = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password-new').value = '';
        document.getElementById('password-confirm').value = '';
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