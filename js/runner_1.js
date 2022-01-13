///////////////////////////////////|
//////////// CONTENTS /////////////|
///////////////////////////////////|
// UTILS
// MODAL MANAGER
// POPOVERS
// PLAN AND PRICING
// VALIDATION
// PAYMENT OPTIONS
// MISCELLANEOUS
// APPLY LOCAL STORAGE DATA TO PAGE
// RUNNER
///////////////////////////////////|
(function ($) {
  // =======================================================================
  // UTILS ---------------------------------------------------------------
  // =======================================================================
  var Utils = (function () {

    function googleAnalyticsTracking(evtName, props) {
      var gaData;
      if (typeof dataLayer !== 'undefined') {
        if (props) {
          gaData = {
            event: 'flow_visitor_event',
            eventAction: 'uncategorized',
            eventCategory: 'uncategorized',
            eventLabel: evtName,
            visitorEventInfo: JSON.stringify(props)
          };
          dataLayer.push(gaData);
        } else {
          gaData = {
            event: 'flow_visitor_event',
            eventAction: 'uncategorized',
            eventCategory: 'uncategorized',
            eventLabel: evtName
          };
          dataLayer.push(gaData);
        }
      }
    }

    // GA click event tracking
    document.addEventListener('click', function (event) {
      if (!event.target.matches('[data-track="ga"]')) return;
      var gaData = {
        event: event.target.getAttribute('data-ga-trigger') || 'flow_visitor_event',
        eventAction: event.target.getAttribute('data-ga-action') || 'uncategorized',
        eventCategory: event.target.getAttribute('data-ga-category') || 'uncategorized',
        eventLabel: event.target.getAttribute('data-ga-label') || '',
      }
      if (window.dataLayer) window.dataLayer.push(gaData);
    });

    function isMobileDevice() {
      var check = false;
      (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    }

    function isTabletDevice() {
      var check = false;
      (function (a) {
        if (/(android|tablet|ipad)/i.test(a.toLowerCase())) check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    }

    function capitalize(value) {
      var letters = value.split("");
      if (letters.length === 0) {
        return '';
      }
      letters[0] = letters[0].toUpperCase();
      return letters.join("");
    };

    function escapeStr(str) {
      if (str) {
        return str.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
      }
      return str;
    }

    function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');

      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return pair[1];
        }
      }
      return false;
    }

    return {
      track: googleAnalyticsTracking,
      isMobileDevice: isMobileDevice,
      isTabletDevice: isTabletDevice,
      capitalize: capitalize,
      escapeStr: escapeStr,
      getQueryVariable: getQueryVariable,
    };
  })();

  // =======================================================================
  // MODAL MANAGER ---------------------------------------------------------
  // =======================================================================

  // ***** DOWNSELL MODAL
  ; (function downsellModalManager() {
    var $discountModal = $('#discount-modal');
    var discountModalShown = false;
    var discountModalSessionStorage = JSON.parse(sessionStorage.discountModal || JSON.stringify({ modalClicked: false }));
    var shouldDisplayDiscountModal = (
      !Utils.getQueryVariable('bvpp') &&
      !discountModalSessionStorage.modalClicked &&
      !discountModalShown
    ) || false;

    // ***** DISCOUNT MODAL
    var DiscountModalManager = (function() {
      var displayDiscountBanners = function() {
        var $downsellBanner = $('.js-not-ready');

        $('.js-discount').fadeIn('fast').removeClass('hidden');
        $downsellBanner.hasClass('hidden') && $('.js-discount-banner').removeClass('d-none');
      };

      var displayDiscountModal = function() {
        $discountModal.modal('show');
        discountModalShown = true;
      };

      var displayDiscountPrices = function() {
        $('.js-total-price, .js-plan-price-discount').removeClass('d-none');
        $('.js-total-regular-price').addClass('d-none');
        $('.js-plan-price-old').addClass('discount');
      }

      if (discountModalSessionStorage.modalClicked) {
        displayDiscountBanners();
        displayDiscountPrices();
      }

      if (shouldDisplayDiscountModal) {
        displayDiscountModal();
      }

      $discountModal.on('hide.bs.modal', function() {
        discountModalShown = false;
        displayDiscountBanners();
        displayDiscountPrices();
        // Reset sessionStorage so modal doesn't re-trigger
        sessionStorage.setItem(
          'discountModal',
          JSON.stringify({
            modalClicked: true
          })
        );
      });

      return {
        displayModal: displayDiscountModal
      };
    })();

    if (shouldDisplayDiscountModal) {
      DiscountModalManager.displayModal();
    }

    $('.js-certain-terms-apply').on('click', function () {
      Utils.track('downsell modal certain terms apply');
    });
    $('.js-downsell-accept').on('click', function () {
      Utils.track('onBack Modal - Accepted');
    });
    $('#downsell-modal .close').on('click', function () {
      Utils.track('onBack Modal - Exited');
    });
    $('.js-search-again').on('click', function () {
      Utils.track('onBack Modal - Rejected');
      // clear data
      amplify.store('searchData', null);
      amplify.store('currentRecord', null);
    });
    $('.js-certain-terms-apply, .js-downsell-accept').on('click', function () {
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        planPriceSelected: 'one dollar',
      }));
    });

    // Not ready to commit Banner
    var notReadyToCommitTimeout = setTimeout(function () {
      $('html, body').animate({
        scrollTop: 0
      }, 500);

      // Hide Discount Modal and banner
      discountModalShown && $discountModal.modal('hide');

      // Hide Discount banner if shown
      $('.js-discount-banner').fadeIn('fast').addClass('d-none');

      // Show Not ready to commit banner
      $('.js-not-ready').fadeIn('fast').removeClass('hidden');
      Utils.track('Top banner for $1 viewed');

      // register for Not ready to commit click event
      $('.js-not-ready-btn').one('click', function () {
        Utils.track('Top banner for $1 clicked');
      });
    }, 30000);

    // disable the Not ready to commit Banner
    // if payment option is clicked before the timeout
    $('.js-payment-method-container').one('click', '.js-payment-method', function () {
      clearTimeout(notReadyToCommitTimeout);
    });
  })();

  // =======================================================================
  // POPOVERS --------------------------------------------------------------
  // =======================================================================
  $('.js-cvv-info').popover({
    container: 'body',
    trigger: 'hover focus',
    placement: 'auto',
    title: 'What is a Security Code/CVV#? <span class="close close-popover">×</span>',
    html: true,
    content: function () {
      return '<h4>Visa, MasterCard, and Discover</h4><div class="d-flex align-items-center"><div class="cvv-back"></div><div class="cvv-text"><strong class="d-block">Back of Card</strong>Three digits located on the right of the signature strip.</div></div><h4>American Express</h4><div class="d-flex align-items-center"><div class="cvv-front"></div><div class="cvv-text"><strong class="d-block">Front of Card</strong>Four digits located on either the left or right side.</div></div>';
    }
  });
  
  $('.js-tax-info').popover({
    container: 'body',
    trigger: 'hover focus',
    placement: 'auto',
    html: true,
    content: function () {
      return 'Depending on your state’s requirements, sales tax may apply to your order.';
    }
  });

  $('.js-tax-info').on('mouseover click', function () {
    Utils.track('viewed sales tax tooltip message');
  });

  // =======================================================================
  // PLAN AND PRICING ------------------------------------------------------
  // =======================================================================

  var PlanAndPricing = (function () {
    var $planSelection = $('.plan-selection');
    var totalPrice;
    var planType;
    var planTermLength;

    function setPrices(selectedPlan) {
      var $planPrice = selectedPlan.find('.js-plan-price');
      totalPrice = $planPrice.data('plan-price');
      planType = $planPrice.data('plan-type');
      planTermLength = $planPrice.data('term-length');
    }

    function updatePricing() {
      var $totalPrice = $('.js-total-price');
      $totalPrice.html('$' + totalPrice);
    }

    function updatePlans() {
      var $planType = $('.js-plan-type');
      var $planTermLength = $('.js-term-length');

      $planType.html(planType);
      $planTermLength.html(planTermLength);
    }

    function update(selectedPlan) {
      setPrices(selectedPlan);
      updatePricing();
      updatePlans();
    }

    function highlightSelected(selectedPlan) {
      $planSelection.removeClass('plan-selection--selected');
      selectedPlan.addClass('plan-selection--selected');
      selectedPlan.find('input[type=radio].plan-name-radio').prop('checked', true);
    }

    $planSelection.on('click', function () {
      highlightSelected($(this));
      update($(this));
    });

    return {
      update: update
    };
  })();

  // =======================================================================
  // VALIDATION ------------------------------------------------------------
  // =======================================================================
  
  function showSingleReportLink() {
    var singelReportLink = $('.js-single-report-link');
    singelReportLink.attr('href') !== '/' ? singelReportLink.removeClass('d-none') : singelReportLink.remove();
  }

  var ValidateSubForm = (function () {
    var today = new Date();
    var $month = $('[name=credit_card\\[expiration_date\\(2i\\)\\]]');
    var month = today.getMonth() + 1;
    var $year = $('[name=credit_card\\[expiration_date\\(1i\\)\\]]');
    var year = today.getFullYear();
    var $expirationInputsParent = $('#expiration-inputs');

    var validatorRules = {
      'account[first_name]': 'required',
      'account[last_name]': 'required',
      'user[email]': {
        required: true,
        email: true
      },
      'account[tos]': {
        required: true
      },
      'credit_card[expiration_date(2i)]': {
        validMonth: true
      },
      'credit_card[expiration_date(1i)]': {
        validYear: true
      },
      'address[zip]': {
        maxlength: 5,
        minlength: 5,
        digits: true,
        required: true
      },
      'credit_card[verification_number]': {
        required: true,
        number: true,
        maxlength: 4,
        validCVV: true
      }
    };

    var validatorOpts = {
      rules: validatorRules,
      errorElement: 'p',
      errorPlacement: function (error, element) {
        var name = element.attr('name');

        if (name === 'credit_card[expiration_date(1i)]') {
          error.insertAfter('#expiration-inputs');
        } else {
          error.insertAfter(element.parent());
        }
      },
      messages: {
        'account[first_name]': 'Please enter your first name.',
        'account[last_name]': 'Please enter your last name.',
        'account[tos]': 'Please accept the terms before continuing.',
        'address[zip]': {
          required: 'Please enter the postal code associated with your credit card.',
          minlength: 'Invalid postal code',
        },
        'credit_card[verification_number]': {
          required: 'Please enter a valid verification number.',
          number: 'Card codes must be either 3 or 4 numerical digits.',
        },
        'user[email]': 'Please enter a valid email address.',
      },
    };

    function initCustomValidationRules() {
      var validMonthYear = function () {
        var isValid = true;
        var m = parseInt($month.val(), 10);
        var y = parseInt($year.val(), 10);
        var isCurrentYear = year === y;

        if (!y || !m || (y < year)) return false;

        if (isCurrentYear) {
          isValid = m >= month;
        }

        if (isValid) {
          $month.removeClass('error').addClass('success');
          $year.removeClass('error').addClass('success');
        } else {
          $month.removeClass('success').addClass('error');
          $year.removeClass('success').addClass('error');
          $expirationInputsParent.siblings('label.error').removeClass('success');
        }

        return isValid;
      };

      var validCVV = function () {
        var cvv = $('#cvv2').val();
        return cvv && (cvv.length === 4 || cvv.length === 3);
      };

      // Register custom validation methods.
      $.validator.addMethod('validCVV', validCVV, 'Please enter a valid verification number.');
      $.validator.addMethod('validMonth', validMonthYear, '');
      $.validator.addMethod('validYear', validMonthYear, 'Please enter a valid expiration date.');
    }

    // Validate dates on change.
    $month.on('change', function () {
      $year.valid();
      $(this).valid();
    });
    $year.on('change', function () {
      $month.valid();
      $(this).valid();
    });

    $('input').on('change', function () {
      $(this).valid();
    });

    // Validate form
    $('#subscribe-form').validate(validatorOpts);

    function applyValidations() {
      return $('#subscribe-form').validate(validatorOpts);
    }

    function disableAllValidation() {
      for (var item in validatorRules) {
        var selectorName = '[name=' + Utils.escapeStr(item) + ']';
        $(selectorName).rules('remove');
      }
    }

    function enableAllValidation() {
      for (var item in validatorRules) {
        var selectorName = '[name=' + Utils.escapeStr(item) + ']';
        $(selectorName).rules('add', validatorRules[item]);
      }
    }

    function enableValidation(paymentType) {
      switch (paymentType) {
        case 'payPal':
        case 'googlePay':
        case 'applePay':
          $('[name=user\\[email\\]]').rules('add', validatorRules['user[email]']);
          $('[name=account\\[tos\\]]').rules('add', validatorRules['account[tos]']);
          break;

        case 'venmo':
          $('[name=account\\[first_name\\]]').rules('add', validatorRules['account[first_name]']);
          $('[name=account\\[last_name\\]]').rules('add', validatorRules['account[last_name]']);
          $('[name=user\\[email\\]]').rules('add', validatorRules['user[email]']);
          $('[name=account\\[tos\\]]').rules('add', validatorRules['account[tos]']);
          $('[name=address\\[zip\\]]').rules('add', validatorRules['address[zip]']);
          break;
      }
    }


    // Validate individual elements only if they contain values
    function validateInputValue(elementId) {
      var validator = $('#subscribe-form').validate();
      if ($(elementId).val()) {
        validator.element(elementId);
        // Always validate Exp Month field (even if only year has changed) otherwise error message will not display
        if (elementId === '#credit_card_expiration_date_2i') {
          validator.element('#credit_card_expiration_date_1i');
        }
      }
    }

    function validateCreditCardInputs() {
      if (typeof iframe !== 'undefined') {
        iframe.validate();
      }
      validateInputValue('#credit_card_expiration_date_1i');
      validateInputValue('#credit_card_expiration_date_2i');
      validateInputValue('#cvv2');
    }

    return {
      init: initCustomValidationRules,
      applyValidations: applyValidations,
      disableAllValidation: disableAllValidation,
      enableAllValidation: enableAllValidation,
      enableValidation: enableValidation,
      validateCreditCardInputs: validateCreditCardInputs,
    };
  })();

  // Exposing to window object so it can be called in subscribeRunner.js
  window.BvValidateSubForm = function (formSelector) {
    return ValidateSubForm.applyValidations(formSelector);
  };

  // =======================================================================
  // PAYMENT OPTIONS -------------------------------------------------------
  // =======================================================================

  ; (function () {
    $('[name=address\\[zip\\]]').on('keyup', function () {
      var zip = $(this).val();
      // Apply zip code value to the other payment methods so it is pre-filled if payment method is changed.
      switch ($(this).attr('id')) {
        // Credit Card Zip Code
        case 'zipcode':
          $('[name=address\\[zip\\]]:not(#zipcode)').val(zip);
          break;

        // Zip Code Fields with No ID (braintree APMs)
        default:
          $('#zipcode').val(zip);
          break;
      }
      // Validate zip code fields
      var validator = $('#subscribe-form').validate();
      $('[name=address\\[zip\\]]').each(function () {
        validator.element(this);
      });
    });

    var scrollToElement = function (element) {
      $('html, body').animate({
        scrollTop: element.offset().top
      }, 500);
    };

    var highlightPaymentMethod = function (element) {
      element.find('input[type=radio]').prop('checked', true);
      $('.payment-method').removeClass('payment-method--selected');
      element.addClass('payment-method--selected');
    };

    var resetForm = function (form) {
      var zipCodeFields = $('[name=address\\[zip\\]]');
      var $form = $(form);
      $form.validate().resetForm();
      // Remove any error styling not directly on the input field element
      $form.find('.error:not(label)').removeClass('error');
      // validate if there is a zipcode value in any zipcode field
      if (zipCodeFields.val()) {
        zipCodeFields.each(function () {
          $(this).valid();
        });
      }
    };

    var displayFormFieldsAndScrollToElement = function () {
      $('#card-input-and-terms-container').slideDown(function () {
        scrollToElement($(this));
      });
    };

    var paymentMethodElements = {
      creditCard: ['#payment-inputs-area', '#name-inputs', '#email-input', '#credit-wrap', '#create_button'],
      payPal: ['#paypal-submitter'],
      googlePay: ['#payment-inputs-area', '#email-input', '#googlepay-submitter'],
      applePay: ['#payment-inputs-area', '#email-input', '#applepay-submitter'],
      venmo: ['#payment-inputs-area', '#name-inputs', '#email-input', '#braintree-zip-wrap', '#venmo-submitter'],
    };

    var elementsToHide = function (elementsGroup) {
      elementsGroup.forEach(function (element) {
        $(element).hide();
      });
    };

    var elementsToShow = function (elementsGroup) {
      elementsGroup.forEach(function (element) {
        $(element).show();
      });
    };

    var changePaymentMethodElements = function (paymentMethodKey) {
      for (var key in paymentMethodElements) {
        elementsToHide(paymentMethodElements[key]);
      }
      elementsToShow(paymentMethodElements[paymentMethodKey]);
    };

    ValidateSubForm.enableAllValidation();

    $('#payment-creditcard').on('click', function () {
      $('input[name=paypal_express]').val('');
      highlightPaymentMethod($(this));
      ValidateSubForm.enableAllValidation();
      ValidateSubForm.validateCreditCardInputs();
      resetForm('#subscribe-form');
      changePaymentMethodElements('creditCard');
      displayFormFieldsAndScrollToElement();
    });

    $('#payment-paypal').on('click', function () {
      $('input[name=paypal_express]').val('true');
      highlightPaymentMethod($(this));
      ValidateSubForm.disableAllValidation();
      ValidateSubForm.enableValidation('payPal');
      resetForm('#subscribe-form');
      changePaymentMethodElements('payPal');
      displayFormFieldsAndScrollToElement();
    });

    $('#payment-googlepay').on('click', function () {
      $('input[name=paypal_express]').val('');
      highlightPaymentMethod($(this));
      ValidateSubForm.disableAllValidation();
      ValidateSubForm.enableValidation('googlePay');
      resetForm('#subscribe-form');
      changePaymentMethodElements('googlePay');
      displayFormFieldsAndScrollToElement();
    });

    $('#payment-applepay').on('click', function () {
      $('input[name=paypal_express]').val('');
      highlightPaymentMethod($(this));
      ValidateSubForm.disableAllValidation();
      ValidateSubForm.enableValidation('applePay');
      resetForm('#subscribe-form');
      changePaymentMethodElements('applePay');
      displayFormFieldsAndScrollToElement();
    });

    $('#payment-venmo').on('click', function () {
      $('input[name=paypal_express]').val('');
      highlightPaymentMethod($(this));
      ValidateSubForm.disableAllValidation();
      ValidateSubForm.enableValidation('venmo');
      resetForm('#subscribe-form');
      changePaymentMethodElements('venmo');
      displayFormFieldsAndScrollToElement();
    });

    // If PayPal redirect, populate the form
    if (Utils.getQueryVariable("bvpp")) {

      var paypalData = amplify.store('paypal_lead');

      if (paypalData) {
        $('#account_tos').prop('checked', true);

        var planSelector = "input[value='" + paypalData.subscription_plan_name + "']";
        var $planSelector = $(planSelector);

        $('#payment-paypal').trigger('click');
        $planSelector.prop('checked', true);
        $('.plan-selection').removeClass('plan-selection--selected');
        $planSelector.closest('.plan-selection').addClass('plan-selection--selected');
      }
    }

  })();

  // =======================================================================
  // MISCELLANEOUS ---------------------------------------------------------
  // =======================================================================

  function generateExpirationYearOptions() {
    var $expirationYearSelectInput = $('#credit_card_expiration_date_1i');
    var currentYear = $expirationYearSelectInput.data('year');
    for (var i = 0; i < 18; i++) {
      var yearOption = currentYear + i;
      $expirationYearSelectInput.append('<option value=' + yearOption + '>' + yearOption + '</option>');
    }
  }

  var checkEmail = function () {
    $('#user-email').mailcheck({
      suggested: function (element, suggestion) {
        Utils.track('Suggested Email Fix');
        $('.js-email-suggestion ').html(suggestion.full);
        $('#email-suggestion').show();
        $('#email-suggestion').on('click', {
          suggestion: suggestion
        }, function (event) {
          $('#user-email').val(event.data.suggestion.full);
          setTimeout(function () {
            $('#user-email').trigger('blur');
          }, 250);
        });
      },
      empty: function () {
        $('#email-suggestion').hide();
      }
    });
  };
  $('#user-email').on('blur', checkEmail);

  // Fix to prevent page freezing when PayPal popup is X'd out before loading is finished
  $(document).on('DOMNodeRemoved', function (e) {
    if ($(e.target).is($('iframe')) || $(e.target).hasClass('paypal-checkout-sandbox') || $(e.target).find('.paypal-checkout-sandbox-iframe').length) {
      if ($(e.target).hasClass('.paypal-checkout-sandbox-iframe') || $(e.target).find('.paypal-checkout-sandbox-iframe').length) {
        paypal.checkout.closeFlow();
        $('#spinner').hide();
        $('#create_button').removeAttr('disabled');
      }
    }
  });

  var trackPaymentOption = (function () {
    // Used to track selected payment option. Prevents clicking the same payment option consecutively
    var creditRadioSelected = false;
    var paypalRadioSelected = false;
    var googlePayRadioSelected = false;
    var applePayRadioSelected = false;
    var venmoPayRadioSelected = false;

    function trackOnce() {
      switch (this.id) {
        case 'payment-creditcard':
          if (!creditRadioSelected) {
            Utils.track('payment method choice - credit card');
            creditRadioSelected = true;
            paypalRadioSelected = false;
            googlePayRadioSelected = false;
            applePayRadioSelected = false;
            venmoPayRadioSelected = false;
          }
          break;

        case 'payment-paypal':
          if (!paypalRadioSelected) {
            Utils.track('payment method choice - paypal');
            paypalRadioSelected = true;
            creditRadioSelected = false;
            googlePayRadioSelected = false;
            applePayRadioSelected = false;
            venmoPayRadioSelected = false;
          }
          break;

        case 'payment-googlepay':
          if (!googlePayRadioSelected) {
            Utils.track('payment method choice - google pay');
            googlePayRadioSelected = true;
            creditRadioSelected = false;
            paypalRadioSelected = false;
            applePayRadioSelected = false;
            venmoPayRadioSelected = false;
          }
          break;

        case 'payment-applepay':
          if (!applePayRadioSelected) {
            Utils.track('payment method choice - apple pay');
            applePayRadioSelected = true;
            creditRadioSelected = false;
            paypalRadioSelected = false;
            googlePayRadioSelected = false;
            venmoPayRadioSelected = false;
          }
          break;

        case 'payment-venmo':
          if (!venmoPayRadioSelected) {
            Utils.track('payment method choice - venmo');
            venmoPayRadioSelected = true;
            creditRadioSelected = false;
            paypalRadioSelected = false;
            googlePayRadioSelected = false;
            applePayRadioSelected = false;
          }
      }
    }

    return {
      init: trackOnce
    };
  })();
  $('#payment-creditcard, #payment-paypal, #payment-googlepay, #payment-applepay, #payment-venmo').on('click', trackPaymentOption.init);

  // =======================================================================
  // APPLY LOCAL STORAGE DATA TO PAGE --------------------------------------
  // =======================================================================

  ; (function () {
    var ls = {
      searchData: amplify.store('searchData') || {},
      leadData: amplify.store('leadData'),
      userEmail: amplify.store('userEmail'),
    };
    var $elem = {
      searchSubjectContainers: $('.js-search-subject-container'),
      searchSubject: $('.js-search-subject'),
    };

    ; (function setLeadData() {
      var $inputElement = {
        firstName: $('[name=account\\[first_name\\]]'),
        lastName: $('[name=account\\[last_name\\]]'),
        email: $('[name=user\\[email\\]]'),
      }
      var setValueAndValidate = function (value, element) {
        element.val(value);
        element.valid();
      }
      if (ls.leadData) {
        var leadData = {
          firstName: ls.leadData['account[first_name]'],
          lastName: ls.leadData['account[last_name]'],
          email: ls.leadData['user[email]'] || ls.userEmail,
        }
        $.each(leadData, function (key, value) {
          if (value) setValueAndValidate(value, $inputElement[key]);
        });
      } else if (ls.userEmail) {
        setValueAndValidate(ls.userEmail, $inputElement.email);
      }
    })();

    function showSearch() {
      var msg = ls.searchData.vin && (ls.searchData.model || ls.searchData.licensePlate) ? '<br>' + ls.searchData.vin + '<br>' : ls.searchData.vin || '';

      if (ls.searchData.model) {
        msg += ls.searchData.year + ' ' + ls.searchData.make + ' ' + ls.searchData.model;
      } else {
        msg += ls.searchData.licensePlate + ' - ' + ls.searchData.state;
      }

      $elem.searchSubject.html(msg);
    }

    if (ls.searchData && (ls.searchData.vin || ls.searchData.model || ls.searchData.licensePlate)) {
      $elem.searchSubjectContainers.removeClass('hidden');
      showSearch();

      // Fill in form hidden input data if applicable
      $('[name=record_search\\[year\\]]').val(ls.searchData.year);
      $('[name=record_search\\[make\\]]').val(ls.searchData.make);
      $('[name=record_search\\[model\\]]').val(ls.searchData.model);
      $('[name=record_search\\[license_plate\\]]').val(ls.searchData.licensePlate);
      $('[name=record_search\\[state\\]]').val(ls.searchData.state);
      $('[name=record_search\\[vin\\]]').val(ls.searchData.vin);
    }
  })();

  // =======================================================================
  // RUNNER ----------------------------------------------------------------
  // =======================================================================

  var initialize = function () {
    // Reload page if back navigation cache -- https://developer.mozilla.org/en-US/docs/Web/API/PageTransitionEvent/persisted
    $(window).on('pageshow', function (event) {
      if (event.persisted || window.performance.navigation.type == 2) {
        window.location.reload();
      }
    });
    generateExpirationYearOptions();
    showSingleReportLink();
    checkEmail();
    ValidateSubForm.init();
    PlanAndPricing.update($('.plan-selection--selected'));
  };

  initialize();
})(jQuery);
