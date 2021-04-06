import UrlBase from '../constants/UrlBase';
import store from '../store/store';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';


export const logIn= (email, password) => {
    return new Promise((resolve) => {
        var logInForm = new FormData();
        logInForm.append('email', email.trim());
        logInForm.append('password', password.trim());
        fetch(UrlBase + 'auth/login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: logInForm
        })
        .then((response) => response.json())
        .then((responseJson) => {
            resolve({ access: responseJson });
        })
        .catch(error => {
            resolve({ error });
        })
    });
}

export const signUp = (name, company, phone, companyPhone, companyPhoneExt, email, password, img, confirmPassword) => {
    return new Promise((resolve)=> {
        var SignUpForm = new FormData();
        SignUpForm.append('name', name.trim());
        const imgFile = {
            uri: img.uri,
            type: 'image/jpeg', // or photo.type
            name: 'photo.jpg'
        };
        if (img.uri != null && img.uri != '') {
            SignUpForm.append('foto', imgFile);
        }
       
        SignUpForm.append('empresa', company.trim());
        SignUpForm.append('telefono', phone);
        SignUpForm.append('telefono_oficina', companyPhone);
        SignUpForm.append('telefono_oficina_ext', companyPhoneExt);
        SignUpForm.append('email', email.trim());
        SignUpForm.append('password', password.trim());
        SignUpForm.append('password_confirmation', confirmPassword.trim());
        fetch(UrlBase + 'auth/signup', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: SignUpForm
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve({ access: responseJson});
            })
            .catch(error => {
                resolve({ error });
            });
    });
}

export const getUserInfoApi = (accessInfo) => {
    return new Promise((resolve) => {
        fetch(UrlBase + 'auth/user', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: accessInfo.token_type + ' ' + accessInfo.access_token,
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            resolve({ user: responseJson });
        })
        .catch(error => {
            resolve({ error });
        });
    });
}

export const logoutApi = async () => {
    const access = store.getState().reducerSession;
    let fcm_token = await AsyncStorage.getItem('@transcliente/fcmToken');
    let bodyForm = new FormData();
    bodyForm.append('fcm_token', fcm_token);
    return new Promise((resolve) => {
        fetch(UrlBase + 'auth/logout', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            });
    });
}

export const updateProfileApi = (name, company, phone, companyPhone, companyPhoneExt, password, img, confirmPassword) => {
    const access = store.getState().reducerSession;
    return new Promise((resolve) => {
        let ProfileForm= new FormData();
        ProfileForm.append('name', name.trim());
        ProfileForm.append('empresa', company.trim());
        ProfileForm.append('telefono', phone);
        ProfileForm.append('telefono_oficina', companyPhone);
        ProfileForm.append('telefono_oficina_ext', companyPhoneExt);
        if(password!=''){
            ProfileForm.append('password', password.trim());
            ProfileForm.append('password_confirmation', confirmPassword.trim());
        }
        if(img.uri!=null){
            const imgFile = {
                uri: img.uri,
                type: 'image/jpeg', 
                name: 'photo.jpg'
            };
            ProfileForm.append('foto', imgFile);
        }
        fetch(UrlBase + 'client/update_profile', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: ProfileForm,
        }).then((response) => response.json())
        .then((responseJson) => {
            resolve(responseJson);
        })
    });
}

export const getAvailableVehiculesApi = (state, locality) => {
    const access = store.getState().reducerSession;
    let FormVehicules = new FormData();
    FormVehicules.append('estado', state);
    FormVehicules.append('localidad', locality);
    FormVehicules.append('fecha', moment().format('YYYY-MM-DD HH:mm:ss'));
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/get_available_vehicules', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: FormVehicules,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const sendHelpReportApi = (subject, description) => {
    const access = store.getState().reducerSession;
    let HelpForm = new FormData();
    HelpForm.append('asunto', subject);
    HelpForm.append('descripcion', description);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/create_help_report', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: HelpForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const sendSuggestionApi = (description) => {
    const access = store.getState().reducerSession;
    let SuggestionForm = new FormData();
    SuggestionForm.append('descripcion', description);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/create_queja', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: SuggestionForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}


export const setStatusServiceApi = (service_id, status) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('servicio_id', service_id);
    bodyForm.append('status', status);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/set_status_service', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const confirmVehicleArrivalApi = (travel_id) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('travel_id', travel_id);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/confirm_vehicle_arrival', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const getPendingServicesApi = () => {
    const access = store.getState().reducerSession;
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/get_pending_services', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const saveDeviceTokenApi = (fcm_token) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('fcm_token', fcm_token);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/save_device_token', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const setStatusTravelTransportistaApi = (travel_id, status) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('travel_id', travel_id);
    bodyForm.append('status', status);
    return new Promise((resolve) => {
        fetch(UrlBase + 'carrier/set_travel_status_transportista', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const askForTravelApi = (travel_id, descripcion, meetting_point, destination) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('travel_id', travel_id);
    bodyForm.append('metting_point', JSON.stringify(meetting_point));
    bodyForm.append('description', descripcion);
    bodyForm.append('destination', JSON.stringify(destination));
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/ask_for_travel', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const getTravelHistoryApi = () => {
    const access = store.getState().reducerSession;
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/travel_history', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const rateTravelApi = (travel_id, rating, comments) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('travel_id', travel_id);
    bodyForm.append('rating', rating);
    bodyForm.append('comments', comments);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/rate_travel', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const sendEvidenceOfLoadApi = (travel_id, images) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('travel_id', travel_id);
    bodyForm.append('number_photos', images.length);
    let imgFile = {
        uri: null,
        type: 'image/jpeg', // or photo.type
        name: 'photo.jpg'
    };
    images.forEach((img, index) => {
        imgFile.uri=img.uri;
        bodyForm.append('foto'+(index + 1), imgFile);  
    });
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/attach_evidence_of_load', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}

export const payWithCreditCardApi = (cardTokenId, travel_id, monto) => {
    const access = store.getState().reducerSession;
    let bodyForm = new FormData();
    bodyForm.append('token_id', cardTokenId);
    bodyForm.append('travel_id', travel_id);
    bodyForm.append('monto', monto);
    return new Promise((resolve) => {
        fetch(UrlBase + 'client/pay_with_credit_card', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: access.token_type + ' ' + access.access_token,
            },
            body: bodyForm,
        }).then((response) => response.json())
            .then((responseJson) => {
                resolve(responseJson);
            })
    });
}
//client/set_status_service
