import {get, post} from 'request';

export function uploadImg(argument) {
    return post({
        type: 'file',
        url: '/api/upload/picture.ajax',
        body: argument
    });
}
