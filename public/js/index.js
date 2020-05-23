/*eslint-diasble*/

import '@babel/polyfill';
import { login, logout, signup } from './login';
import { displayMap } from './mapbox';
import { updateSetings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateFormData = document.querySelector('.form-user-data');
const updateFormPassword = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

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

if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    });
}

if (updateFormData) {
    updateFormData.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const photo = document.getElementById('photo').files[0];

        const form = new FormData();

        form.append('name', name);
        form.append('email', email);
        form.append('photo', photo);

        updateSetings(form, 'data');
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

if (bookBtn) {
    bookBtn.addEventListener('click', async e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        await bookTour(tourId);
        e.target.textContent = 'Book tour now!';
    });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);