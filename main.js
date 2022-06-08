import Validator from "./validator.js";

Validator({
    form: '#form-1',
    errorSelector: '.form-message',
    groupSelector: '.form-group',
    rules: [
        // name
        Validator.isRequired('#fullname'),

        // email
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),

        // password
        Validator.isRequired('#password'),
        Validator.minLength('#password', 6),

        // confirmPassword
        Validator.isRequired('#password_confirmation'),
        Validator.isConfirmation('#password_confirmation', () => {
            return document.querySelector('#form-1 #password').value;
        }, "Password re-entered is not matched"),

        // avatar file
        Validator.isRequired('#avatar', 'Please upload your avatar'),

        // gender
        Validator.isRequired('input[name=gender]'),

        // city
        Validator.isRequired('#city', 'Please chose a city'),

        // lang
        Validator.isRequired('input[name=lang]', 'Please chose at least a language'),
    ],
    onSubmit: function (data) {
        console.log(data);
        // call fetch API
    }
})