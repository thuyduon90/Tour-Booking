/*eslint-diasble*/
import axios from 'axios';
const stripe = Stripe('pk_test_hEohzW6C1oQN0SARQjU43h1200TKv918SW');
//const elements = stripe.elements();

import { showAlert } from './alert';

export const bookTour = async tourID => {
    try {
        const session = await axios({
            method: 'GET',
            url: `/api/v1/bookings/checkout-session/${tourID}`
        });
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (error) {
        showAlert('error', error);
    }
    // 1) Get checkout session from server

    // 2) Create checkout form
    // try {
    //     const res = await axios({
    //         method: 'POST',
    //         url: '/api/v1/users/login',
    //         data: {
    //             email,
    //             password
    //         }
    //     });
    //     if (res.data.status === 'success') {
    //         location.assign('/');
    //         showAlert('success', 'Logged in successfully!');
    //     }
    // } catch (error) {
    //     showAlert('error', error.response.data.message);
    // }
};