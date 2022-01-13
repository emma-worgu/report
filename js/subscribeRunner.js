window.BV_KILL_VERIFI = false;
window.initialLoad = new Date();
window.retryIframe = false;

/*!
 * Subscribe.js - Supports signups via TokenEx and Paypal
 * Deps: jQuery, _, jQuery.validate, jquery.validate.creditcard2.pack
 */

; (function (w) {
  // Check if the current domain has 'secure.' in it. If it does, use the
  // absolute URL with 'www' as the subdomain.
  var hostname = window.location.hostname;
  if (hostname && hostname.indexOf('secure.') > -1) {
    hostname = hostname.replace('secure.', 'www.');
    w.BV_IFRAME_URL = 'https://' + hostname + '/api/v5/account/prep_iframe.json';
    w.BV_SIGNUP_REDIRECT_URL = 'https://' + hostname + '/accounts/creating_account';
    w.BV_ENDPOINT_URL = 'https://' + hostname + '/api/v5/account.json';
    w.BV_PAYPAL_PREFLIGHT_URL = 'https://' + hostname + '/api/v5/account/signup_preflight.json';
    w.BV_PAYPAL_ENDPOINT_URL = 'https://' + hostname + '/api/v5/account.json';
  }
}(window));


/**
 * Reporters - @public
 * Registered functions are expected to have an arity of 2.
 * e.g: trackingFn(eventType<string>, eventProps<object>)
 */
; (function (w) {
  if (typeof w.BvEventReporters === 'undefined') {
    w.BvEventReporters = {};
    w.BvEventReporters.trackers = {};
  }

  if (typeof heap !== 'undefined' && typeof heap.track === 'function') {
    w.BvEventReporters.trackers.heap = 'track';
  }

  if (typeof nolimit !== 'undefined' && typeof nolimit.track === 'function') {
    w.BvEventReporters.trackers.nolimit = 'track';
  }
}(window));

; (function (w) {
  if (typeof ga === 'undefined') {

  }
}(window));

; (function (w) {

  if (typeof w.BvEventReporters === 'undefined') {
    w.BvEventReporters = {};
  }

  w.BvEventReporters.report = function BvEventReporter(eventType, eventProps) {
    try {
      if (typeof dataLayer !== 'undefined') {
        var gaData = {
          event: 'flow_visitor_event',
          eventAction: 'uncategorized',
          eventCategory: 'uncategorized',
          eventLabel: eventType,
        };
        if (eventProps) gaData.visitorEventInfo = JSON.stringify(eventProps);
        dataLayer.push(gaData);
      }

      for (var k in w.BvEventReporters.trackers) {
        var fn = w.BvEventReporters.trackers[k];
        if (typeof fn === 'function') {
          fn(eventType, eventProps);
        } else if (typeof fn === 'string') {
          if (typeof w[k] !== 'undefined' && typeof w[k][fn] === 'function') {
            try {
              w[k][fn](eventType, eventProps);
            } catch (e) { }
          }
        }
      }
    } catch (err) { }
  };

  w.BvEventReporters.reportGA = function (reportInfo) {
    try {
      if (typeof ga !== 'undefined') {
        ga('send', 'event', reportInfo);
      }
    } catch (err) {
      console.log(err);
    }
  };
}(window));

; (function (w, $) {

  var BV_ENDPOINT_STEP_1 = w.BV_ENDPOINT_STEP1 || '/api/v5/account/signup_preflight.json',
    BV_ENDPOINT_STEP_3 = w.BV_ENDPOINT_STEP3 || '/api/v5/account.json',
    STEP_2_TIMEOUT = w.BV_VERIFI_STEP_2_TIMEOUT || (60 * 1000),
    REDIRECT_IDENTIFIER = 'bumper.com';


  var excludeCreditCardInfoTokenEx = function (formData) {
    formData.initialize_tokenex = true;
    var customerInfo = '';
    for (var k in formData) {
      var val = formData[k];
      if (k.indexOf('credit_card') === -1) {
        customerInfo += (k + '=' + w.encodeURIComponent(val));
        customerInfo += '&';
      }
    }
    return customerInfo;
  };

  var TokenExPaymentProcessor = function () { };

  TokenExPaymentProcessor.prototype.step1 = function step1(formData) {

    var customerInfo = excludeCreditCardInfoTokenEx(formData);
    return $.post(BV_ENDPOINT_STEP_1, customerInfo);
  };

  TokenExPaymentProcessor.prototype.step3 = function step3(formData) {
    // need to bundle in the token from the tokenex call in here
    // check if it's set on the window yet

    formData['credit_card[card_number]'] = w.TOKENEX_MASKED_NUMBER;
    formData['credit_card[tokenex_token]'] = w.TOKENEX_TOKEN;

    var d = [];
    for (var k in formData) {
      d.push(k + '=' + w.encodeURIComponent(formData[k]));
    }
    // These will be required going forward - if they aren't present, bail out with an error on the frontend.
    // Not sure if we want to retry or what that should look like
    d.push('tokenex_session_id=' + w.TOKENEX_SESSION_ID);
    d.push('tokenex_customer_ref_number=' + w.TOKENEX_CUSTOMER_REF_NUMBER);
    d.push('tokenex_token=' + w.TOKENEX_TOKEN);
    d.push('direct_to_subscribe=' + BVGetQueryVariable('direct_to_subscribe'));
    return $.post(BV_ENDPOINT_STEP_3, d.join('&'));
  };

  TokenExPaymentProcessor.prototype.process = function process(formData) {
    var self = this,
      def = new $.Deferred(),
      token;

    var handleStepError = function (error) {
      var parsedErrors = JSON.parse(error.responseText);
      if (parsedErrors && parsedErrors.preflight_response.errors && parsedErrors.preflight_response.errors.user) {
        def.reject(parsedErrors.preflight_response.errors.user);
      } else {
        def.reject(error);
      }
      w.BvEventReporters.reportGA({ eventCategory: 'sot_verifi_subscribe_process', eventAction: 'step_error', eventLabel: error });
    };

    var handleStep3Error = function (error) {
      if (error && error.responseText) {
        var resp = JSON.parse(error.responseText);
        if (resp && resp.account && resp.account.errors) {
          w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'step_3_error', eventLabel: resp.account.errors.join('  ') });
          def.reject(resp.account.errors);
          return;
        }
      }
      def.reject(['Sorry, there was an error processing your payment. Please verify your information and try again.']);
      w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'step_3_error', eventLabel: 'processing error' });
    };

    var step1 = self.step1,
      // step2 = self.step2,
      step3 = self.step3;

    step1(formData).then(function (d1) {
      d1 = d1.preflight_response;
      if (typeof d1.valid_for_signup !== 'undefined' && d1.valid_for_signup === false) {
        def.reject(d1.errors.user);
        w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'preflight-failure', eventLabel: d1.errors.user });
        return;
      }
      w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'preflight-success' });

      step3(formData).then(function (d3) {
        w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'signup_success' });
        def.resolve(d3);
      }, handleStep3Error);

    }, handleStepError);

    return def.promise();
  };

  w.TokenExPaymentProcessor = TokenExPaymentProcessor;
}(window, jQuery));


/**
 * Helper to get query param values by name
 */
var BVGetQueryVariable = function (variable) {
  var query = window.location.search.substring(1),
    vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (pair[0] == variable) { return pair[1]; }
  }
  return false;
};

/**
 * PaypalPaymentProcessor
 * Related query args:
 * bvpp - when present, indicates a paypal redirect
 * bvppcanc - when present, it implies that a paypal error ocurred.
 */
; (function (w, $, _) {

  $.ajaxSetup({
    //crossDomain: true,
    xhrFields: {
      withCredentials: true
    }
  });
  $.support.cors = true;

  var BV_PAYPAL_PREFLIGHT_URL = w.BV_PAYPAL_PREFLIGHT_URL || '/api/v5/account/signup_preflight.json',
    BV_ENDPOINT = w.BV_PAYPAL_ENDPOINT_URL || '/api/v5/account.json';

  var excludeCreditCardInfo = function (formData) {
    var customerInfo = '';
    for (var k in formData) {
      var val = formData[k];
      if (k.indexOf('credit_card') === -1 && k.indexOf('zip') === -1) {
        customerInfo += (k + '=' + w.encodeURIComponent(val));
        customerInfo += '&';
      }
    }
    return customerInfo;
  };

  /**
   * Initiates a preflight request to BV's server. If the request is successful,
   * then an URL containing a PayPal token will be sent in the response. A successful
   * request results in users being forwarded to PayPal via window.location.
   * Failed requests are reported via paymentProcessingDef.reject(), where paymentProcessingDef
   * is an instance of jQuery.Deferred().
   */
  var processPaypalPreflight = function (formData, paymentProcessingDef) {
    amplify.store('paypal_lead', formData);
    var preflightXHR = $.post(BV_PAYPAL_PREFLIGHT_URL, excludeCreditCardInfo(formData));
    preflightXHR.done(function paypalPreflightDoneHandler(d) {
      var d = d.preflight_response;
      w.BvEventReporters.report('Pre-flight Success', { payment_method: 'paypal' });
      if (typeof d.valid_for_signup !== 'undefined' && d.valid_for_signup === false) {
        if (d.errors && d.errors instanceof Array) {
          paymentProcessingDef.reject(d.errors);
        } else if (d.errors && d.errors.user instanceof Array) {
          paymentProcessingDef.reject(d.errors.user);
        } else {
          paymentProcessingDef.reject(['An error has happened. Please, try again.']);
        }
      } else {
        window.onbeforeunload = function () { };
        var response = d || {},
          url = response.form_url;
        window.localStorage.setItem('payPalPreflightUrl', url);
        paypal.checkout.startFlow(url);
      }
    });

    preflightXHR.fail(function paypalPreflightErrorHandler(resp) {
      w.BvEventReporters.report('Pre-flight Failed', { payment_method: 'paypal' });
      var parsedResponse = JSON.parse(resp.responseText);
      if (parsedResponse && parsedResponse.preflight_response.errors && parsedResponse.preflight_response.errors.user) {
        paymentProcessingDef.reject(parsedResponse.preflight_response.errors.user);
      } else if (parsedResponse && parsedResponse.preflight_response.errors) {
        paymentProcessingDef.reject(parsedResponse.preflight_response.errors);
      } else {
        paymentProcessingDef.reject(resp.errors);
      }
      $('#create_button').hide();
    });
  };

  /**
   * Completes a PayPal transaction
   */
  var processPaypalConfirmation = function (formData, paymentProcessingDef) {

    // This is used to prevent redirection to paypal if the error is an account related error
    window.sessionStorage.removeItem('paypalRedirect');

    // Get the token and payerId from paypal's redirect.
    formData.paypal_token = BVGetQueryVariable('token');
    formData.paypal_payer_id = BVGetQueryVariable('PayerID');

    if (!formData.paypal_token || !formData.paypal_payer_id) {
      w.BvEventReporters.report('Paypal Confirmation Failed - Missing Token or PayerID');
      paymentProcessingDef.reject(['Sorry, your PayPal transaction failed. Please try again or contact customer support for assistance.']);
    }

    var confirmation = $.post(BV_ENDPOINT, formData);

    confirmation.done(function () {
      window.localStorage.removeItem('payPalPreflightUrl');
      paymentProcessingDef.resolve();
    });

    confirmation.fail(function (resp) {
      w.BvEventReporters.report('Paypal Confirmation Failed', { data: resp });
      var d = JSON.parse(resp.responseText);
      if (d.errors && d.errors instanceof Array) {
        paymentProcessingDef.reject(d.errors);
      } else if (d.errors && d.errors.user instanceof Array) {
        paymentProcessingDef.reject(d.errors.user);
      } else if (d.account && d.account.errors instanceof Array) {
        window.PaypalPaymentProcessorRetry = true;
        window.sessionStorage.setItem('paypalRedirect', false);
        paymentProcessingDef.reject(d.account.errors);
      } else {
        paymentProcessingDef.reject(['There is an issue with your PayPal account. Redirecting to their site...']);
      }
    });
  };

  var PaypalPaymentProcessor = function () { };

  PaypalPaymentProcessor.prototype.process = function process(formData) {
    var def = new $.Deferred();

    if (!BVGetQueryVariable('bvpp') || window.PaypalPaymentProcessorRetry === true) {
      processPaypalPreflight(formData, def);
    } else {
      processPaypalConfirmation(formData, def);
    }

    return def.promise();
  };

  w.PaypalPaymentProcessor = PaypalPaymentProcessor;
}(window, jQuery, _));

/**
 * FormView - Apply form validation, submissions, and processing.
 */
; (function (w, $) {

  /*****************
   * Tokenex stuff
   ***************/

  w.TOKENEX_TOKEN = '';
  w.TOKENEX_SESSION_ID = '';
  w.TOKENEX_CUSTOMER_REF_NUMBER = '';
  w.TOKENEX_BIN = '';
  w.TOKENEX_LAST_FOUR = '';
  w.TOKENEX_MASKED_NUMBER = '';

  // Listener setup for TokenEx
  if (window.addEventListener) {
    addEventListener('message', listener, false);
  } else {
    attachEvent('onmessage', listener);
  }

  function disableCreditCardPaymentOption() {
    $('#credit-radio-button').attr('disabled', true);
    $('#payment-creditcard').hide();
  }

  function changeCardImage(cardType, target) {
    target.siblings('img').removeClass('display');

    switch (cardType) {
      case 'visa':
        target.siblings('.visa').addClass('display');
        break;
      case 'masterCard':
        target.siblings('.master').addClass('display');
        break;
      case 'discover':
        target.siblings('.discover').addClass('display');
        break;
      case 'americanExpress':
        target.siblings('.amex').addClass('display');
        break;
      case 'jcb':
        target.siblings('.jcb').addClass('display');
        break;
      case 'diners':
        target.siblings('.diners').addClass('display');
        break;
    }
  }

  // Listener for TokenEx
  function listener(event) {
    // HEY MIKEY We're using the prod endpoints here going forward.
    if (event.origin === 'https://htp.tokenex.com') {
      var message = JSON.parse(event.data);
      switch (message.event) {
        case 'error':
          if (message.data) {
            w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'iframe_load_error', eventLabel: message.data.error, eventValue: message.data.referenceNumber });
          }
          disableCreditCardPaymentOption();
          break;
        case 'load':
          // var iframe = document.getElementById('tokenExIframe');
          // HEY MIKEY Here's the new ID for the new way of doing the iframe. This is computed by the iframe itself.
          var iframe = document.getElementById('tx_iframe_tokenex-target');
          // iframe.contentWindow.postMessage('enablePrettyFormat', 'https://htp.tokenex.com');
          $('.js-field-placeholder').hide();
          $('#tokenex-target').removeClass('load');
          w.iframeLoad = new Date();
          var timeDifference = w.iframeLoad - w.initialLoad;
          if (typeof ga !== 'undefined') {
            ga('send', 'timing', { timingCategory: 'sot_tokenex_times', timingVar: 'iframe_load', timingValue: timeDifference });
          }
          //w.BvEventReporters.reportGA({eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'load_time', eventLabel: timeDifference});
          break;
        case 'focus':
          w.tokenExFieldTouched = true;
          if (message.data.value) {
            $('#card-label').addClass('float-top');
            $('#card-input').addClass('active');
          }
          break;
        case 'blur':
          setTimeout(function () {
            if ($('#credit-card-error').attr('style') === 'display: block;') {
              $('#card-input').addClass('error');
            } else {
              $('#card-input').removeClass('error');
            }
          }, 10);
          $('#card-input').removeClass('active');
          break;
        case 'cardTypeChange':
          changeCardImage(message.data && message.data.possibleCardType, $('#tokenex-target'));
          break;
        case 'change':
          break;
        case 'validate':
          // w.tokenExFieldTouched is set to true when the field is focused
          // w.clickedFormSubmitBtn is set to true when the form is submitted
          if (!message.data.isValid && (w.tokenExFieldTouched || w.clickedFormSubmitBtn)) {
            $('#credit-card-error').show();
            $('#tokenex-target, #check-img').addClass('error').removeClass('success');
            $('#tokenex-target').siblings('img').removeClass('display');
            $('#tokenex-target').siblings('.invalid').addClass('display');
            $('#card-input').addClass('error');
            // if input is empty return the label to the original positiom
            if (message.data.validator === 'required') {
              $('#card-label').removeClass('float-top');
            }
          } else {
            $('#credit-card-error').hide();
            $('#tokenex-target, #check-img').addClass('success').removeClass('error');
            $('#tokenex-target').siblings('img.invalid').removeClass('display');
            changeCardImage(message.data && message.data.cardType, $('#tokenex-target'));
            w.CARD_TYPE = message.data.cardType;
          }
          if ($('#cvv2').val().length !== 0) {
            $('#cvv2').valid();
          }
          break;
        case 'tokenize':
          if (message.data.firstSix && message.data.lastFour && message.data.referenceNumber && message.data.token && message.data.tokenHMAC) {
            w.TOKENEX_TOKEN = message.data.token;
            w.TOKENEX_SESSION_ID = message.data.sesssionID;
            w.TOKENEX_CUSTOMER_REF_NUMBER = message.data.customerRefNumber;
            w.TOKENEX_BIN = message.data.firstSix;
            w.TOKENEX_LAST_FOUR = message.data.lastFour;

            var exes = 'XXXXXX';
            if (w.CARD_TYPE === 'americanExpress') {
              exes = 'XXXXX';
            } else if (w.CARD_TYPE === 'diners') {
              exes = 'XXXX';
            }
            w.TOKENEX_MASKED_NUMBER = w.TOKENEX_BIN + exes + w.TOKENEX_LAST_FOUR;

            var formData = serializeToObject($('#subscribe-form').serializeArray());
            var paymentProcessor = new TokenExPaymentProcessor();
            var payment = paymentProcessor.process(formData);
            handlePaymentProcessing(payment);
          }
          break;
      }
    }
  }

  var BV_IFRAME_URL = window.BV_IFRAME_URL || '/api/v5/account/prep_iframe.json';

  function getTokenExIframeSrc() {
    $.get(BV_IFRAME_URL, function (data) {
      if (data.response && data.response.success) {
        // This is where we  make the tokenx iframe. Because we can get some of the iframe info back from core
        // and combine it with the rest of othe style & etc on the frontend, we now have control over the CSS.

        // These are the default styles from the TX docs, for reference:
        // styles: {
        //   base: 'font-family: Arial, sans-serif;padding: 0 8px;border: 1px solid rgba(0, 0, 0, 0.2);margin: 0;width: 100%;font-size: 13px;line-height: 30px;height: 32px;box-sizing: border-box;-moz-box-sizing: border-box;',
        //   focus: 'box-shadow: 0 0 6px 0 rgba(0, 132, 255, 0.5);border: 1px solid rgba(0, 132, 255, 0.5);outline: 0;',
        //   error: 'box-shadow: 0 0 6px 0 rgba(224, 57, 57, 0.5);border: 1px solid rgba(224, 57, 57, 0.5);'
        // }

        // This CSS is what we were using for the phone flows. The base and focus are what we currently have, the error styling is from the default provided in the TX docs.
        // var styles = {
        //   base: 'padding: 0 12px; border: 1px solid #ccc; border-radius: 5px; width: 100%; display: block; height: 50px; color: #555; background-color: #fff; font-size: 14px; transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s; box-shadow: inset 0 2px 5px 0 rgba(149, 149, 149, 0.3); box-sizing: border-box; -moz-box-sizing: border-box;'
        //   focus: 'border: solid 1px #66afe9;outline: 0;background-color: #fff;box-shadow: 0 0 10px 0 rgba(102, 175, 233, 0.44), inset 0 0 8px 0 rgba(102, 175, 233, 0.57)',
        //   error: 'box-shadow: 0 0 6px 0 rgba(224, 57, 57, 0.5);border: 1px solid rgba(224, 57, 57, 0.5);'
        // }

        var styles = {
          base: 'width: calc(100% - 2px); font-family: Interstate, sans-serif; font-weight: 300; letter-spacing: -0.5px; border: 0; border-radius 4px; background-color: transparent; box-sizing: border-box; ',
          focus: 'outline: 0;',
        };

        styles.base += $(window).width() < 991 ?
          'font-size: 18px; padding: 5px 0 0 12px; height: 50px;' :
          'font-size: 20px; padding: 5px 0 0 22px; height: 55px;';

        iframeConfig = {
          origin: data.response.origin,
          timestamp: data.response.timestamp,
          tokenExID: data.response.token_ex_id,
          tokenScheme: data.response.token_scheme,
          authenticationKey: data.response.authentication_key,
          styles: styles,
          pci: true,
          enableValidateOnBlur: true,
          inputType: 'text',
          placeholder: 'Enter Your Card Number',
          customRegEx: '^\d{16}$', // Will only allow an input value of 6666666666666. You can disregard this if we don't need it.
          enablePrettyFormat: true,
          enableAutoComplete: true,
        };

        var iframe = new TokenEx.Iframe('tokenex-target', iframeConfig);
        // We need to access the iframe from the global scope when the submit button is pressed
        window.iframe = iframe;

        iframe.on('tokenize', function (data) { });

        iframe.load();

        $('#subscribe-form').on('submit', function () {
          iframe.validate();
          w.clickedFormSubmitBtn = true;
        });
      } else {
        // fall back to only paypal and other alternative payment methods
        w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'bv_iframe_request_error' });
        disableCreditCardPaymentOption();
      }
    });
  }

  getTokenExIframeSrc();

  var SIGNUP_REDIRECT_URL = w.BV_SIGNUP_REDIRECT_URL || '/accounts/creating_account',
    formSelector = '#subscribe-form';

  var noop = function () { };

  var disableForm = function () {
    $('#create_button').attr('disabled', 'disabled');
    $('#create_button, #googlepay-submitter, #applepay-submitter, #venmo-submitter').hide();
    $('#spinner').show();
    $('#spinner').removeClass('hidden');
  };

  var enableForm = function () {
    $('#create_button').removeAttr('disabled');
    if (!$('#paypal-radio-button').prop('checked') && !$('#googlepay-radio-button').prop('checked') && !$('#applepay-radio-button').prop('checked') && !$('#venmo-radio-button').prop('checked')) {
      $('#create_button').show();
    } else if ($('#googlepay-radio-button').prop('checked')) {
      $('#googlepay-submitter').show();
    } else if ($('#applepay-radio-button').prop('checked')) {
      $('#applepay-submitter').show();
    } else if ($('#venmo-radio-button').prop('checked')) {
      $('#venmo-submitter').show();
    }
    $('#spinner').hide();
  };

  var handleProcessingSuccess = function () {
    if (typeof w.BvEventReporters !== 'undefined') {
      var selectedPlan = $('.plan-name-radio:checked').val(),
        payment_method = $('[name=payment_method]:checked').val();
      w.BvEventReporters.report('Successful Signup', { plan_selected: selectedPlan, payment_method: payment_method });
    }
    window.onbeforeunload = noop;
    window.setTimeout(function () {
      window.location = SIGNUP_REDIRECT_URL;
    }, 1000);
  };

  var handleProcessingError = function (errors) {
    var $errorContainer = $('#error-container'),
      $errorMessages = $('#messages'),
      errorLen = 0,
      i = 0,
      dataResponse;

    if (errors.responseText) {
      dataResponse = JSON.parse(errors.responseText);
    }

    if (dataResponse && dataResponse.account && dataResponse.account.errors instanceof Array && !_.isEmpty(dataResponse.account.errors)) {
      errors = dataResponse.account.errors;
    } else if ((errors instanceof Array) == false) {
      errors = ['Oops! Something went wrong. Please try again or try a different payment method.'];
    }

    errorLen = errors.length;

    $errorMessages.html('');

    for (i; i < errorLen; i += 1) {
      var $li = $('<li>');
      $li.html(errors[i]);
      $errorMessages.append($li);
    }

    $errorContainer.fadeIn();
    if (!$('#tokenex-target').hasClass('success')) {
      $('#tokenex-target, #check-img').removeClass('success');
    }

    $('#error-container').removeClass('hidden');
    $('html, body').animate({
      scrollTop: $('#error-container').offset().top
    }, 500);

    // found this bug, basically if preflight fails, paypal processor never closes
    if (window.paypal && window.paypal.checkout) {

      window.setTimeout($('#create_button').hide(), 1000);
      window.paypal.checkout.closeFlow();
    }

    w.BvEventReporters.report('Failed Signup', { data: errors });
  };

  /**
   * Takes action based on the promised result of the processing param.
   * E.g: If processing fails, presents user with error messages.
   *      Or, if processing is successful, directs user to the backend.
   * Essentially, bridges the gap between view and business logic.
   */
  var handlePaymentProcessing = function (processing) {

    disableForm();

    processing.done(function () {
      handleProcessingSuccess();
    });

    processing.fail(function (err) {
      handleProcessingError(err);
    });

    processing.always(function () {
      enableForm();
    });
  };

  /**
   * Serialize a form to a plain object. e.g: {name: value}
   */
  var serializeToObject = function (serializedArray) {
    if (!serializedArray) return {};
    var i = 0,
      o = {},
      len = serializedArray.length;
    for (i; i < len; i += 1) {
      o[serializedArray[i].name] = serializedArray[i].value;
    }
    return o;
  };

  /**
   * BRAINTREE PAYMENT GATEWAYS
   */
  var UA = window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var BRAINTREE_CLIENT_TOKEN_API = '/api/v5/braintree_client_token';
  var CREATE_ACCOUNT_API = '/api/v5/account.json';

  /**
   * BrainTree Payment Gateway (Google Pay)
   */
  var initializeBraintreeGooglePayGateway = function () {
    var googlePayInstance;

    var paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'PRODUCTION'
    });

    // Get Braintree Token
    $.get({
      url: BRAINTREE_CLIENT_TOKEN_API,
      xhrFields: {
        withCredentials: false
      }
    }).then(function (response) {
      createBraintreeClient(response.client_token);
    }).catch(function (error) {
      w.BvEventReporters.report('Error Getting Braintree Client Token: Google Pay', { error: error });
    });

    function createBraintreeClient(braintreeToken) {
      braintree.client.create({
        authorization: braintreeToken
      }).then(function (clientInstance) {
        return braintree.googlePayment.create({
          client: clientInstance,
          googlePayVersion: 2,
          googleMerchantId: 'BCR2DN6T5O3KZYDB'
        });
      }).then(function (googlePaymentInstance) {
        // Stored reference to pass to the setupGooglePayButton() function
        googlePayInstance = googlePaymentInstance;
        return paymentsClient.isReadyToPay({
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: googlePaymentInstance.createPaymentDataRequest().allowedPaymentMethods,
          existingPaymentMethodRequired: true
        });
      }).then(function (response) {
        if (response.result) {
          $('#payment-googlepay').removeClass('hidden');
          setupGooglePayButton(googlePayInstance);
        }
      }).catch(function (error) {
        w.BvEventReporters.report('Braintree: Google Pay Failure or Error Processing Payment', { type: error.type, code: error.code, name: error.name, message: error.message });
        if (error.type !== 'MERCHANT' && error.type !== 'NETWORK') {
          handleProcessingError(['Oops! Something went wrong with Google Pay. Please try again or try a different payment option.']);
        }
      });
    };

    function setupGooglePayButton(googlePaymentInstance) {
      var receivedPaymentData;
      var buttonClickHandler = function (event) {
        event.preventDefault();

        // Validate form first
        $(formSelector).trigger('submit');
        if (!w.BvValidateSubForm().form()) return;

        var paymentDataRequest = googlePaymentInstance.createPaymentDataRequest({
          transactionInfo: {
            currencyCode: 'USD',
            totalPriceStatus: 'ESTIMATED',
            totalPrice: $('.plan-selection--selected .js-plan-price').data('plan-price').toString()
          }
        });

        var cardPaymentMethod = paymentDataRequest.allowedPaymentMethods[0];
        cardPaymentMethod.parameters.billingAddressRequired = true;
        cardPaymentMethod.parameters.billingAddressParameters = {
          format: 'MIN'
        };

        paymentsClient.loadPaymentData(paymentDataRequest).then(function (paymentData) {
          receivedPaymentData = paymentData;
          return googlePaymentInstance.parseResponse(paymentData);
        }).then(function (result) {
          var fullName = _.get(receivedPaymentData, 'paymentMethodData.info.billingAddress.name', '');
          var zipCode = _.get(receivedPaymentData, 'paymentMethodData.info.billingAddress.postalCode', '');
          var parsedName = NameParser(fullName);

          // collect and adjust form data
          var formData = serializeToObject($('#subscribe-form').serializeArray());
          formData['braintree_nonce'] = result.nonce;
          formData['account[first_name]'] = parsedName.first;
          formData['account[last_name]'] = parsedName.last;
          formData['address[zip]'] = zipCode;

          // Don't continue if name or zip code data is not provided in the response
          if (_.isEmpty(fullName) || _.isEmpty(zipCode)) {
            handleProcessingError(['Oops! Something went wrong with Google Pay. Please try again or try a different payment option.']);
            w.BvEventReporters.report('Braintree: Google Pay - Missing name or zip code data from response');
            return;
          }

          // Send data to core and redirect to account creation page if successful
          var sendDataToCore = $.post(CREATE_ACCOUNT_API, formData);
          handlePaymentProcessing(sendDataToCore);
        }).catch(function (error) {
          w.BvEventReporters.report('Braintree: Google Pay Failure After Button Click', {statusCode: error.statusCode, name: error.name, message: error.message});
          if (error.name === 'NotSupportedError') {
            $('#googlepay-submitter').html('<span style="color:red;">Sorry, your device does not support Google Pay at this time. Please select another payment method.</span>');
          };
        });
      };

      var buttonContainer = document.querySelector('#googlepay-submitter');
      var button = paymentsClient.createButton({
        buttonType: 'long',
        onClick: buttonClickHandler
      });
      buttonContainer.appendChild(button);
    };
  };

  /**
   * BrainTree Payment Gateway (Apple Pay)
   */
  var initializeBraintreeApplePayGateway = function () {
    var applePayInstance;

    $.get({
      url: BRAINTREE_CLIENT_TOKEN_API,
      xhrFields: {
        withCredentials: false
      }
    }).then(function (response) {
      createBraintreeClient(response.client_token);
    }).catch(function (error) {
      w.BvEventReporters.report('Error Getting Braintree Client Token: Apple Pay', { error: error });
    });

    function createBraintreeClient(client_token) {
      if (window.ApplePaySession && ApplePaySession.supportsVersion(3) && ApplePaySession.canMakePayments()) {
        // This device supports version 3 of Apple Pay.
        braintree.client.create({
          authorization: client_token
        }).then(function (clientInstance) {
          return braintree.applePay.create({
            client: clientInstance
          });
        }).then(function (applePaymentInstance) {
          // Stored reference to pass to the setupApplePayButton() function
          applePayInstance = applePaymentInstance;
          // Use Apple Pay merchant identifier to check if payments can be made.
          return ApplePaySession.canMakePaymentsWithActiveCard(applePaymentInstance.merchantIdentifier).then(function (canMakePaymentsWithActiveCard) {
            if (canMakePaymentsWithActiveCard) {
              $('.payment-method.applepay').removeClass('hidden');
              setupApplePayButton(applePayInstance);
            } else {
              w.BvEventReporters.report('Braintree: This device supports Apple Pay but it is not setup or not capable of making payments with active card');
            }
          });
        }).catch(function (error) {
          w.BvEventReporters.report('Error Creating Apple Pay Braintree Client', { error: error });
        });
      } else {
        w.BvEventReporters.report('Braintree: This device does not support Apple Pay or is not capable of making Apple Pay payments');
      }
    };

    function setupApplePayButton(applePayInstance) {
      var buttonClickHandler = function (event) {
        event.preventDefault();

        // Validate form first
        $(formSelector).trigger('submit');
        if (!w.BvValidateSubForm().form()) return;

        var selectedPlanPrice = $('.plan-selection--selected .js-plan-price').data('plan-price');

        var paymentRequest = applePayInstance.createPaymentRequest({
          total: {
            label: 'Bumper',
            amount: selectedPlanPrice
          },
          requiredBillingContactFields: ['postalAddress'],
          lineItems: [
            {
              label: 'Membership',
              amount: selectedPlanPrice
            },
          ],
        });

        var session = new ApplePaySession(3, paymentRequest);

        session.begin();

        session.onvalidatemerchant = function (event) {
          applePayInstance.performValidation({
            validationURL: event.validationURL,
            displayName: 'Bumper Membership'
          }).then(function (merchantSession) {
            session.completeMerchantValidation(merchantSession);
          }).catch(function (validationErr) {
            // You should show an error to the user, e.g. 'Apple Pay failed to load.'
            handleProcessingError(['Apple Pay failed to load. Please try again or try a different payment option.']);
            w.BvEventReporters.report('Braintree: Apple Pay Error validating merchant', { error: validationErr, details: { message: validationErr.message, name: validationErr.name, } });
            session.abort();
          });
        };

        session.onpaymentauthorized = function (event) {
          applePayInstance.tokenize({
            token: event.payment.token
          }).then(function (payload) {
            // collect and adjust form data
            var formData = serializeToObject($('#subscribe-form').serializeArray());
            formData['braintree_nonce'] = payload.nonce;
            formData['account[first_name]'] = _.get(event, 'payment.billingContact.givenName', '');
            formData['account[last_name]'] = _.get(event, 'payment.billingContact.familyName', '');
            formData['address[zip]'] = _.get(event, 'payment.billingContact.postalCode', '');

            // Don't continue if name or zip code data is not provided in the response
            if (_.isEmpty(formData['account[first_name]']) || _.isEmpty(formData['account[last_name]']) || _.isEmpty(formData['address[zip]'])) {
              handleProcessingError(['Oops! Something went wrong with Apple Pay. Please try again or try a different payment option.']);
              w.BvEventReporters.report('Braintree: Apple Pay - Missing name or zip code data from response');
              return;
            }

            // Send data to core and redirect to account creation page if successful
            var sendDataToCore = $.post(CREATE_ACCOUNT_API, formData);
            handlePaymentProcessing(sendDataToCore);

            // After you have transacted with the payload.nonce,
            // call `completePayment` to dismiss the Apple Pay sheet.
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
          }).catch(function (tokenizeErr) {
            w.BvEventReporters.report('Braintree: Error tokenizing Apple Pay', { error: tokenizeErr });
            session.completePayment(ApplePaySession.STATUS_FAILURE);
          });
        };
      }

      $('#applepay-submitter').on('click', buttonClickHandler);
    };
  };

  /**
   * BrainTree Payment Gateway (Venmo)
   */
  var initializeBraintreeVenmoGateway = function () {
    var deviceData;

    $.get({
      url: BRAINTREE_CLIENT_TOKEN_API,
      xhrFields: {
        withCredentials: false
      }
    }).then(function (response) {
      createBraintreeClient(response.client_token);
    }).catch(function (error) {
      w.BvEventReporters.report('Error Getting Braintree Client Token: Venmo', { error: error });
    });

    function createBraintreeClient(client_token) {
      braintree.client.create({
        authorization: client_token
      }).then(function (clientInstance) {
        return braintree.venmo.create({
          client: clientInstance,
          allowNewBrowserTab: false
        });
      }).then(function (venmoInstance) {
        // Verify browser support before proceeding to show the payment option
        if (!venmoInstance.isBrowserSupported()) {
          w.BvEventReporters.report('Braintree: Browser does not support Venmo');
          return;
        }
        setupVenmoButton(venmoInstance);
      }).catch(function (error) {
        w.BvEventReporters.report('Error Creating Venmo Braintree Client', { error: error });
      });
    };

    function setupVenmoButton(venmoInstance) {
      var $venmoSubmitter = $('#venmo-submitter');
      $('#payment-venmo').removeClass('hidden');

      var handleVenmoSuccess = function (payload) {
        // collect and adjust form data
        var formData = serializeToObject($('#subscribe-form').serializeArray());
        formData['braintree_nonce'] = payload.nonce;
        // Send data to core and redirect to account creation page if successful
        var sendDataToCore = $.post(CREATE_ACCOUNT_API, formData);
        handlePaymentProcessing(sendDataToCore);
      };

      var handleVenmoError = function (error) {
        if (error.code === 'VENMO_CANCELED') {
          w.BvEventReporters.report('Braintree (venmo): App is not available or user aborted payment flow');
        } else if (error.code === 'VENMO_APP_CANCELED') {
          w.BvEventReporters.report('Braintree (venmo): User canceled payment flow');
        } else {
          w.BvEventReporters.report('Braintree (venmo): An error occurred', { error: error.message });
        }
      };

      var buttonClickHandler = function (event) {
        event.preventDefault();

        // Validate form first
        $(formSelector).trigger('submit');
        if (!w.BvValidateSubForm().form()) return;

        $venmoSubmitter.prop('disabled', true);
        venmoInstance.tokenize().then(handleVenmoSuccess).catch(handleVenmoError).then(function () {
          $venmoSubmitter.prop('disabled', false);
        });
      }

      $venmoSubmitter.on('click', buttonClickHandler);
    };
  };

  // Initialization after document state is complete so no calls get stuck
  // Only initialize Google Pay if IE browser is NOT being used
  document.onreadystatechange = function () {
    if (document.readyState === 'complete') {
      if (!isIE) initializeBraintreeGooglePayGateway();
      initializeBraintreeApplePayGateway();
      initializeBraintreeVenmoGateway();
    }
  };


  /**
   * Entrypoint.
   */

  var updateNextpageLinkWithFraudVar = function () {
    var directToSubscribeParamExists = BVGetQueryVariable('direct_to_subscribe');

    if (directToSubscribeParamExists === 'true') {
      var nextPageLink = $('body').attr('data-next-page');
      $('body').attr('data-next-page', nextPageLink + '?direct_to_subscribe=true');

    }
  }

  var initialize = function () {
    updateNextpageLinkWithFraudVar();
    var subValidator = w.BvValidateSubForm(formSelector);
    var paymentProcessor = new TokenExPaymentProcessor();

    window.subValidator = subValidator; // TODO Remove

    paymentProcessor = new TokenExPaymentProcessor();

    $('#payment-paypal').on('click', function () {
      paymentProcessor = new PaypalPaymentProcessor();
    });

    $('#payment-creditcard').on('click', function () {
      paymentProcessor = new TokenExPaymentProcessor();
    });

    if (BVGetQueryVariable('bvpp')) {

      paymentProcessor = new PaypalPaymentProcessor();

      $('#payment-paypal').click();

      if (!BVGetQueryVariable('bvppcanc')) { // coerce
        $('#PayPal-Success').modal({ backdrop: 'static', show: true });

        $('#PayPal-Dismiss').on('click', function (evt) {
          evt.preventDefault();
          $('#PayPal-Success').modal('hide');
          window.PaypalPaymentProcessorRetry = true;
        });
        w.BvEventReporters.report('Paypal Payment Confirmation - Viewed');
      } else { // User canceled the paypal payment.
        window.PaypalPaymentProcessorRetry = true;
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        window.setTimeout(function () {
          $('#paypal-canceled').fadeIn();
          window.setTimeout(function () {
            $('#paypal-canceled').fadeOut();
          }, 10 * 1000);
        }, 800);
        w.BvEventReporters.report('Paypal Payment Canceled');
      }
    }

    var userConfirmedPaypal = false,
      $paypalConfirmSubText = $('#paypal-confirm-sub-text');

    $('#confirm-paypal').on('click', function (evt) {
      evt.preventDefault();

      if (userConfirmedPaypal) {
        return;
      }

      var formData = serializeToObject($(formSelector).serializeArray());
      var payment = paymentProcessor.process(formData);
      var confirmButton = this;

      // Set the click state
      userConfirmedPaypal = true;
      $paypalConfirmSubText.text('Please wait while we create your account. This may take a few minutes.');


      $('#PayPal-Dismiss').fadeOut();
      $(confirmButton).fadeOut();
      $('#paypal-spinner').fadeIn();

      payment.fail(function (e) {
        var url = window.localStorage.getItem('payPalPreflightUrl');
        var shouldRedirect = window.sessionStorage.getItem('paypalRedirect') !== 'false';
        $paypalConfirmSubText.text('Just click the confirm button below to activate and view your report.');
        if (url) {
          $('#PayPal-Success').modal('hide');
          window.onbeforeunload = function () { };
          if (shouldRedirect) {
            window.location = window.localStorage.getItem('payPalPreflightUrl');
          }
        } else {
          $('#paypal-spinner').fadeOut();
          $(confirmButton).fadeIn();
          $('#PayPal-Dismiss').fadeIn();
          $('#paypal-confirm-error').fadeIn();
        }

        w.BvEventReporters.report('Paypal Payment Confirmation - Confirmed - Failed');
      });
      handlePaymentProcessing(payment);
      payment.always(function () {
        userConfirmedPaypal = false;
      });
      w.BvEventReporters.report('Paypal Payment Confirmation - Confirmed');
    });


    $('body').on('submit', formSelector, function (evt) {
      evt.preventDefault();

      var formData = serializeToObject($(this).serializeArray());
      var paymentType = formData.payment_method;
      var isPaymentTypePayPal = paymentType === 'paypal';
      var isPaymentTypeCreditCard = paymentType === 'credit_card';
      var isPaymentTypeBraintree = paymentType === 'braintree';

      // Check if we need to fallback to BV handling the payment processing.
      if (!isPaymentTypePayPal && typeof w.BV_KILL_VERIFI !== 'undefined' && w.BV_KILL_VERIFI === true) {
        paymentProcessor = new BvPaymentProcessor();
      }

      var validated = subValidator.form();
      if (!validated) return;

      if (typeof w.BvEventReporters !== 'undefined') {
        w.BvEventReporters.report('Signup Form Submitted');
        w.BvEventReporters.reportGA({ eventCategory: 'sot_tokenex_subscribe_process', eventAction: 'signup_form_submit' });
      }

      if (isPaymentTypeCreditCard) {
        var currentTime = new Date();
        // Token Expiration is 20 minutes (using 18 minutes here to be extra cautious)
        if ((currentTime - w.initialLoad) / (1000 * 60) > 18) {
          handleProcessingError(['Your session has expired. For your security, please refresh the page to restart your session and try signing up again.']);
          return;
        } else {
          window.iframe.tokenize();
        }
      } else if (isPaymentTypeBraintree) {
        var currentTime = new Date();
        // Token Expiration is 24 hours
        if ((currentTime - w.initialLoad) / (1000 * 60 * 60) > 24) {
          handleProcessingError(['Your session has expired. For your security, please refresh the page to restart your session and try signing up again.']);
          return;
        }
      } else if (isPaymentTypePayPal) {
        var payment = paymentProcessor.process(formData);
        handlePaymentProcessing(payment);
      }
    });
  };

  initialize();
}(window, jQuery));
