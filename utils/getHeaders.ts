export default function getHeaders() {
    return {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
    };
}
