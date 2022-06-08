export default function Validator(options = {}) {
  /**
   *
   * @param {to be validated element} inputElement
   * @param {rule applied to valide the given element} rule
   */
  function validate(inputElement, rules) {
    let errorMessage;
    for (let rule of rules) {
      let groupElement = inputElement.closest(options.groupSelector);
      let errorElement = groupElement.querySelector(options.errorSelector);

      errorMessage = rule.test(
        ['checkbox', 'radio'].includes(inputElement.type)
          ? groupElement.querySelector(rule.selector + ':checked')?.value
          : inputElement.value
      );

      if (errorMessage) {
        addInvalid(groupElement, errorElement, errorMessage);
        break;
      } else {
        removeInvalid(groupElement, errorElement);
      }
    }

    return !!!errorMessage;
  }

  function removeInvalid(groupElement, errorElement) {
    groupElement.classList.remove('invalid');
    errorElement.innerText = '';
  }

  function addInvalid(groupElement, errorElement, errorMessage) {
    groupElement.classList.add('invalid');
    errorElement.innerText = errorMessage;
  }

  // ----------------------------------------------------------------//
  console.log(options);

  let formElement = document.querySelector(options.form);

  if (formElement) {
    let selectorRules = {};
    // collect rules for each selector
    options.rules.forEach((rule) => {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule);
      } else {
        // first time => init array with the first rule of that selector
        selectorRules[rule.selector] = [rule];
      }
    });

    // subcribe validate event for each selector
    for (let selector in selectorRules) {
      let inputElements = formElement.querySelectorAll(selector);

      inputElements.forEach((inputElement) => {
        if (inputElement) {
          // blur event
          inputElement.onblur = function () {
            validate(this, selectorRules[selector]);
          };

          // on input event
          inputElement.oninput = function () {
            let groupElement = inputElement.closest(options.groupSelector);
            let errorElement = groupElement.querySelector(
              options.errorSelector
            );
            removeInvalid(groupElement, errorElement);
          };
        }
      });
    }

    // cancel the default behavior submit event on form and validate form
    formElement.onsubmit = function (event) {
      event.preventDefault();

      let isFormValid = true;
      for (let selector in selectorRules) {
        let inputElements = this.querySelectorAll(selector);
        inputElements.forEach((inputElement) => {
          isFormValid &= validate(inputElement, selectorRules[selector]);
        });
      }

      // continue submit with a call back if form is validated
      if (isFormValid) {
        // submit with validate config
        if (typeof options.onSubmit === 'function') {
          let enablesInputs = this.querySelectorAll('[name]:not([disabled])');

          // collect values of fields, name is required
          let data = {};
          // enablesInputs.forEach(input => {
          //     data[input.name] = input.value;
          // });

          // an alternative way to collect data
          data = Array.from(enablesInputs).reduce((obj, input) => {
            switch (input.type) {
              case 'checkbox':
                // pre-condition : do nothing but assign empty array
                if (!input.checked) {
                  !obj[input.name] && (obj[input.name] = []);
                  return obj;
                }
                // checkbox
                if (!Array.isArray(obj[input.name])) {
                  obj[input.name] = [input.value];
                } else {
                  obj[input.name].push(input.value);
                }
                break;
              case 'radio':
                // pre-condition : do nothing but assign empty
                if (!input.checked) {
                  !obj[input.name] && (obj[input.name] = '');
                  return obj;
                }
                obj[input.name] = input.value;
                break;
              case 'file':
                obj[input.name] = input.files;
                  break;
              default:
                obj[input.name] = input.value;
            }
            return obj;
          }, {});

          // submit
          options.onSubmit(data);
        }
        //  submit with default behavior
        else {
          this.submit();
        }
      }
    };
  }
}

// Rules definitions
// Rule common defintion:
// 1. If error then return error message
// 2. If ok then return undefined or no return
Validator.isRequired = function (
  selector,
  errorMessage = 'Please enter a value'
) {
  return {
    selector,
    test(value) {
      if (typeof value === 'string') {
        value = value.trim();
      } // else means a boolean
      return value ? undefined : errorMessage;
    },
  };
};
Validator.minLength = function (
  selector,
  min,
  errorMessage = `Please enter a value at least ${min} characters`
) {
  return {
    selector,
    test(value) {
      return value.trim().length >= min ? undefined : errorMessage;
    },
  };
};

Validator.isEmail = function (
  selector,
  errorMessage = 'Please enter an email'
) {
  return {
    selector,
    test(value) {
      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
        ? undefined
        : errorMessage;
    },
  };
};

Validator.isConfirmation = function (
  selector,
  getConfirmationValue,
  errorMessage = `Please enter the same confirmation value`
) {
  return {
    selector,
    test(value) {
      return value.trim() === getConfirmationValue() ? undefined : errorMessage;
    },
  };
};
