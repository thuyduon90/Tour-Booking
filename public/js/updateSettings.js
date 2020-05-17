/*eslint-diasble*/
import axios from 'axios';

import { showAlert } from './alert';

// Type is either password or data
export const updateSetings = async(data, type) => {
    try {
        const endPoint = type === 'password' ? 'updatepassword' : 'updateme';
        const res = await axios({
            method: 'PATCH',
            url: `http://localhost:4000/api/v1/users/${endPoint}`,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated successfully!`);
            window.setTimeout(() => {
                location.reload(true);
            }, 3000);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};