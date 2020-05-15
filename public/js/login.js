/*eslint-diasble*/
import axios from 'axios';

import { showAlert } from './alert';

export const login = async(email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:4000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

export const logout = async() => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:4000/api/v1/users/logout'
        });
        if (res.data.status === 'success') {
            location.reload(true);
        }
    } catch (error) {
        showAlert('error', 'Error logging out! try again!');
    }
};