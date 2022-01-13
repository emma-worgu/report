(function ($) {
  // Analytics
  var track = function (evLab, evCat, evAct, evVal) {
    if (typeof dataLayer !== 'undefined') {
      var gaData;
      gaData = {
        'event': 'flow_visitor_event',
        'eventLabel': evLab,
        'eventCategory': evCat,
        'eventAction': evAct,
        'eventValue': evVal
      };
      dataLayer.push(gaData);
    }
  };

  function initHamburgerMenu(){
    $('.js-hamburger-btn').on('click', function () {
      $('.hamburger-menu-container').toggleClass('hamburger-menu-container--open');
      $('.hamburger-btn').toggleClass('hamburger-btn--open');
    });
  }

  // Clearing local storage when the page loads, so we can have reflected the correct info
  // on the Building report page.
  localStorage.clear();

  ; (function eventHandlers() {
    var $input = $('.js-vin-input');

    // focus input field on page load (desktop only)
    const desktopView = window.matchMedia("(min-width: 992px)");
    if (desktopView.matches) {
      $input.focus();
    }

    // Safari Fix
    // Reload page if back navigation cache -- https://developer.mozilla.org/en-US/docs/Web/API/PageTransitionEvent/persisted
    $(window).on('pageshow', function (event) {
      if (event.persisted || window.performance.navigation.type == 2) {
        window.location.reload();
      }
    });

    // Set data attribute to use for styling label when not a required field
    $input.on('blur', function () {
      $.trim($(this).val()) ? $(this).attr('filled', 'true') : $(this).attr('filled', 'false');
    });

    $('.js-signup-now-link').on('click', function () {
      track('vin landing signup now');
    });
    $('[data-event="dl"]').on('click', function () {
      var evCat = $(this).data('category') ? $(this).data('category') : '';
      var evAct = $(this).data('action') ? $(this).data('action') : '';
      var evLab = $(this).data('label') ? $(this).data('label') : '';
      var evVal = $(this).data('value') ? $(this).data('value') : '';
      track(evLab, evCat, evAct, evVal);
    });
  })();

  // Change header, subheader and footer of section
  var showVinSearchElements = function(){
    if ($('.js-search-type-vin').hasClass('active')) {
      showVinHeaderText();
      showSignUpHeaderButton('VIN');
      hideLicenseHeaderText();
      hideYMMHeaderText();
      hideMarketPlaceHeaderText();
      hideOwnThisCarHeaderButton();
    }

    if ($('.js-search-type-license').hasClass('active')) {
      showLicenseHeaderText();
      showSignUpHeaderButton('license plate');
      hideVinHeaderText();
      hideYMMHeaderText();
      hideMarketPlaceHeaderText();
      hideOwnThisCarHeaderButton();
    }

    if ($('.js-search-type-ymm').hasClass('active')) {
      showYMMHeaderText();
      showOwnThisCarHeaderButton();
      hideVinHeaderText();
      hideLicenseHeaderText();
      hideMarketPlaceHeaderText();
      hideSignUpHeaderButton();
    }

    if ($('.js-search-type-marketplace').hasClass('active')) {
      showMarketPlaceHeaderText();
      hideVinHeaderText();
      hideLicenseHeaderText();
      hideYMMHeaderText();
      hideOwnThisCarHeaderButton();
      hideSignUpHeaderButton()
    }
  }

  function hideVinHeaderText() {
    $('.js-header-vin-searchtype').removeClass('d-block').addClass('d-none');
    $('.js-sub-header-vin-searchtype').removeClass('d-block').addClass('d-none');
  }

  function showVinHeaderText() {
    $('.js-header-vin-searchtype').removeClass('d-none').addClass('d-block');
    $('.js-sub-header-vin-searchtype').removeClass('d-none').addClass('d-block');
  }

  function hideLicenseHeaderText() {
    $('.js-header-license-searchtype').removeClass('d-block').addClass('d-none');
    $('.js-sub-header-license-searchtype').removeClass('d-block').addClass('d-none');
  }

  function showLicenseHeaderText() {
    $('.js-header-license-searchtype').removeClass('d-none').addClass('d-block');
    $('.js-sub-header-license-searchtype').removeClass('d-none').addClass('d-block');
  }

  function hideYMMHeaderText() {
    $('.js-header-ymm-searchtype').removeClass('d-block').addClass('d-none');
    $('.js-sub-header-ymm-searchtype').removeClass('d-block').addClass('d-none');
  }

  function showYMMHeaderText() {
    $('.js-header-ymm-searchtype').removeClass('d-none').addClass('d-block');
    $('.js-sub-header-ymm-searchtype').removeClass('d-none').addClass('d-block');
  }

  function hideMarketPlaceHeaderText() {
    $('.js-sub-header-marketplace-searchtype').removeClass('d-block').addClass('d-none');
    $('.js-header-marketplace-searchtype').removeClass('d-block').addClass('d-none');
    $('.js-marketplace-bottom').addClass('d-none');
  }

  function showMarketPlaceHeaderText() {
    $('.js-sub-header-marketplace-searchtype').removeClass('d-none').addClass('d-block');
    $('.js-header-marketplace-searchtype').removeClass('d-none').addClass('d-block');
    $('.js-marketplace-bottom').removeClass('d-none');
  }

  function hideOwnThisCarHeaderButton() {
    $('.js-own-this-car').removeClass('d-flex justify-content-between').addClass('d-none');
  }

  function showOwnThisCarHeaderButton() {
    $('.js-own-this-car').removeClass('d-none').addClass('d-flex justify-content-between');
  }

  function hideSignUpHeaderButton() {
    $('.js-signup-now').removeClass('d-flex').addClass('d-none');
  }

  function showSignUpHeaderButton(text) {
    $('.js-signup-now').removeClass('d-none').addClass('d-flex');
    $('.js-subline-search-type').text(text);
  }


  ; (function initInputValidations() {
    var STORE_KEY = 'searchData';

    // Search carousel selector
    $('.js-home-carousel-indicator').on('click', function () {
      var currentIndex = $('.js-home-carousel-indicator').index($(this));
      $('.js-home-carousel-indicator').removeClass('active');
      $(this).addClass('active');
      setTimeout(function () {
        if (currentIndex === 4) validateProperties();
      }, 400);
      showVinSearchElements();
    });

    $.validator.addMethod('noEmptySpacesOnly', function (value) {
      return value === '' || value.trim().length !== 0;
    }, 'Empty/blank search not allow');

    $.validator.addMethod('notEmail', function (value, element) {
      return this.optional(element) || !/^[ a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?(?:\.[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?)*$/.test(value);
    }, 'Email addresses are not searchable here');

    $.validator.addMethod('emptyOrletters', function (value) {
      return (value.trim() !== '' && /[a-z]+/i.test(value)) || (value.trim() === '');
    }, 'Alphabetic characters required');

    $.validator.addMethod('noSpecialCharacters', function (value) {
      return !/[$-/:-?{-~!"^_`\[\]]/.test(value);
    }, 'Special characters are not allowed');

    $.validator.addMethod('onlyAlphanumeric', function (value) {
      return /^[a-zA-Z0-9]*$/.test(value.trim());
    }, 'Only alphanumeric values are allowed');

    function storeQuery(formData) {
      var parsedData = formData.reduce(function (prev, item) {
        prev[item.name] = item.value;
        return prev;
      }, amplify.store(STORE_KEY) || {});

      amplify.store(STORE_KEY, parsedData);
    }

    // Filling the Select input for Year Make Model
    function fillingSearchSelects() {
      var yearSelect = document.querySelector('.js-year-search');
      var makeSelect = document.querySelector('.js-make-search');
      var makeSelectMarketPlace = document.querySelector('.js-make-search-marketplace');
      var modelSelect = document.querySelector('.js-model-search');
      var date = new Date();
      var actualYear = date.getFullYear();
      var lastSupportedYear = 1980;

      for (var i = actualYear; i >= lastSupportedYear; i--) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.text = i;
        yearSelect.add(opt, null);
      }

      $.getJSON( 'https://www.bumper.com/hk/dd/vendor/chug/selections', function( data ) {
        for (var i = 0; i < data.selections.makes.length; i++) {
          var makeName = data.selections.makes[i].name;
          var optionYMM = new Option(makeName, makeName);
          var optionMarketplace = new Option(makeName, makeName);
          makeSelect.add(optionYMM, null);
          makeSelectMarketPlace.add(optionMarketplace, null);
        }

        makeSelect.addEventListener("change", function(){
          optValue = makeSelect.value;
          $(".js-model-search .js-modelOption").each(function() {
            $(this).remove();
          });
          for (var i = 0; i < data.selections.makes.length; i++) {
            if (optValue == data.selections.makes[i].name) {
              for (var j = 0; j < data.selections.makes[i].models.length; j++) {
                modelName = data.selections.makes[i].models[j].name;
                var opt = document.createElement("option");
                opt.classList.add("js-modelOption");
                opt.value = modelName;
                opt.text = modelName;
                modelSelect.add(opt, null);
              }
            }
          }
        });
      });
    }

    function validateVin() {
      var $searchVin = $('.js-search-vin');
      $searchVin.validate({
        validClass: 'success',
        rules: {
          vin: {
            required: true,
            notEmail: true,
            noEmptySpacesOnly: true,
            emptyOrletters: true,
            noSpecialCharacters: true,
          },
        },
        errorElement: 'p',
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent('.bp-input-container'));
        },
        messages: {
          vin: {
            required: 'Please enter a VIN',
            notEmail: 'Email addresses are not searchable here',
          }
        },
        onsubmit: true,
        submitHandler: function (form, event) {
          event.preventDefault();
          var vinValueIndex = 1;
          var input = $('.js-vin-input');
          input.val(input.val().toUpperCase());
          track('vin flow click search');
          var data = $(form).serializeArray();
          data[vinValueIndex].value = input.val();
          localStorage.clear();
          storeQuery(data);
          var nextPage = $('body').attr('data-next-page');
          window.location = nextPage;
        }
      });
    }

    function validateLicensePlate() {
      $('.js-license-search-carousel').validate({
        validClass: 'success',
        errorElement: 'p',
        rules: {
          licensePlate: {
            required: true,
            onlyAlphanumeric: true,
          },
          state: {
            required: true,
          },
        },
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent('.bp-input-container'));
        },
        submitHandler: function (form) {
          var licensePlateValueIndex = 0;
          var input = $('.js-plate-input');
          input.val(input.val().toUpperCase());
          var data = $(form).serializeArray();
          data[licensePlateValueIndex].value = input.val().trim();
          localStorage.clear();
          storeQuery(data);
          track('license plate flow click search');
          window.location = $(form).attr('action');
        },
      });
    }

    function validateYearMakeModel() {
      var $searchYMM = $('.js-search-year-make-model');

      $searchYMM.validate({
        validClass: 'success',
        rules: {
          yearSearch: {
            required: true,
            notEmail: true,
            noEmptySpacesOnly: true,
            atLeastOneLetter: true,
          },
          makeSearch: {
            required: true,
            notEmail: true,
            noEmptySpacesOnly: true,
            atLeastOneLetter: true,
          },
          modelSearch: {
            required: true,
            notEmail: true,
            noEmptySpacesOnly: true,
            atLeastOneLetter: true,
          }
        },
        messages: {
          yearSearch: 'Please enter a Year',
          makeSearch: 'Please enter a Make',
          modelSearch: 'Please enter a Model',
        },
        errorElement: 'p',
        onsubmit: true,
        submitHandler: function (form, event) {
          event.preventDefault();
          var data = $(form).serializeArray();
          localStorage.clear();
          storeQuery(data);
          window.location = $(form).attr('action');
        }
      });
    }

    function validateMarketPlace() {
      var $searchMarketPlace = $('.js-search-marketplace');
      $searchMarketPlace.validate({
        validClass: 'success',
        rules: {
          location: {
            maxlength: 5,
            minlength: 5,
            digits: true,
            required: false,
          },
        },
        errorElement: 'p',
        errorPlacement: function (error, element) {
          error.insertAfter(element.parent('.bp-input-container'));
        },
        onsubmit: true,
        submitHandler: function (form, event) {
          event.preventDefault();
          var marketPlaceURL = 'https://www.bumper.com/marketplace/';
          var zipCode = $('.js-location-input').val();
          var makeOption = $('.js-make-search-marketplace').val();
          var urlSearch;

          if (zipCode) {
            urlSearch = '?makes=%5B"'+makeOption+'"%5D&zip='+zipCode;
          } else {
            urlSearch = '?makes=%5B"'+makeOption+'"%5D';
          }

          marketPlaceURL = marketPlaceURL+urlSearch;
          window.location = marketPlaceURL;
        }
      });
    }

    fillingSearchSelects();
    validateVin();
    validateLicensePlate();
    validateYearMakeModel();
    validateMarketPlace();
  })();


  // Pagetypes & searchtypes
  const DYNAMIC_HEADERS_MAP = {
    'vinSearchType': {
      'default': {
        'header': 'Research a Vehicle <span class="d-block d-sm-inline">By <span class="font-weight-bold font-italic">VIN Number</span></span>',
        'subheader': 'Learn more about a vehicle you <span class="d-block d-sm-inline">own or plan to buy.</span>',
      },
      'accident': {
        'header': 'Lookup <strong>accident records</strong> by VIN',
        'subheader': 'Enter a VIN to search for a vehicle’s accident records.',
      },
      'theft': {
        'header': 'Search <strong>theft records</strong> by VIN',
        'subheader': 'Enter a VIN to search for a vehicle’s theft records.',
      },
      'salvage': {
        'header': 'Search <strong>salvage records</strong> by VIN',
        'subheader': 'Enter a VIN to search for a vehicle’s salvage records.',
      },
      'history': {
        'header': 'Lookup a <strong>vehicle history report</strong>',
        'subheader': 'Enter a VIN to search for a vehicle history report.',
      },
      'value': {
        'header': 'Lookup the <strong>value of a vehicle</strong>',
        'subheader': 'Enter a VIN to search for the estimated value of that vehicle.',
      },
      'decoder': {
        'header': '<strong>VIN decoder</strong>',
        'subheader': 'Decode a VIN to search for specifications, equipment, recalls and more.',
      },
      'specs': {
        'header': 'Lookup <strong>vehicle specifications</strong> by VIN',
        'subheader': 'Enter a VIN to lookup 150+ data points that describe the vehicle.',
      },
      'equipt': {
        'header': 'Lookup <strong>vehicle equipment details</strong>',
        'subheader': 'Enter a VIN to search for the vehicle’s equipment details.',
      },
      'owner': {
        'header': '<strong>Search</strong> car <strong>owner</strong> by VIN',
        'subheader': 'Lookup their name, address, phone number and more!',
      },
      'sales': {
        'header': 'Search <strong>sale listings</strong> history by VIN',
        'subheader': 'Enter a VIN to search for a vehicle’s sales listing history.',
      },
      'recall': {
        'header': 'Search <strong>recalls</strong> by VIN',
        'subheader': 'Enter a VIN to look up recalls for that vehicle.',
      },
      'warranty': {
        'header': '<strong>Lookup warranty records</strong> by VIN',
        'subheader': 'Enter a VIN to lookup manufacturer warranties including rust, powertrain and basic warranty.',
      },
      'general_ymm': {
        'header': 'Looking for records on a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong> ?',
        'subheader': 'Enter a VIN to start your search.',
      },
      'accident_ymm': {
        'header': 'Lookup accident records for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for a vehicle’s accident records.',
      },
      'thef_ymm': {
        'header': 'Search theft records for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for a vehicle’s theft records.',
      },
      'salvage_ymm': {
        'header': 'Search salvage records for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for a vehicle’s salvage records.',
      },
      'history_ymm': {
        'header': 'Lookup vehicle history records for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for a vehicle history report.',
      },
      'value_ymm': {
        'header': 'Lookup the value of a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for the estimated value of a <strong> <span class="js-subheadline-year"></span> <span class="js-subheadline-make"></span> <span class="js-subheadline-model"></span> </strong>.',
      },
      'specs_ymm': {
        'header': 'Lookup vehicle specifications for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to lookup 150+ data points that describe the vehicle.',
      },
      'equipt_ymm': {
        'header': 'Lookup vehicle equipment details for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for the vehicle’s equipment details.',
      },
      'sales_ymm': {
        'header': 'Search sale listings history for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to search for a vehicle’s sales listing history.',
      },
      'recall_ymm': {
        'header': 'Search recalls for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to look up recalls for that vehicle.',
      },
      'warranty_ymm': {
        'header': 'Lookup warranty records for a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a VIN to lookup manufacturer warranties including rust, powertrain and basic warranty.',
      },
      'headline': {
        'header': 'Research a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong> by VIN Number.',
        'subheader': 'Learn more about a vehicle you own or plan to buy.',
      },
    },
    'ymmSearchType': {
      'default': {
        'header': 'Learn More About <strong><span class="font-weight-bold font-italic"><br class="d-none d-md-block"> a Vehicle You Plan to Buy or Own</strong>',
        'subheader': 'Enter Year, Make, and Model to search for market value, recalls, specs, <br class="d-none d-lg-block">equipment and more.',
      },
      'general_ymm': {
        'header': 'Looking for records on <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a vehicle to start your search.',
      },
      'value_ymm': {
        'header': 'Lookup the value of a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a vehicle to search for the estimated value of a <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
      },
      'specs_ymm': {
        'header': 'Lookup vehicle specifications for <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a vehicle to lookup 150+ data points that describe the vehicle.',
      },
      'equipt_ymm': {
        'header': 'Lookup vehicle equipment details for <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': "Enter a vehicle to search for the vehicle's equipment details.",
      },
      'recall_ymm': {
        'header': 'Search recalls for <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a vehicle to look up recalls for that vehicle.',
      },
      'warranty_ymm': {
        'header': 'Lookup warranty records for <strong> <span class="js-headline-year"></span> <span class="js-headline-make"></span> <span class="js-headline-model"></span> </strong>',
        'subheader': 'Enter a vehicle to lookup manufacturer warranties including rust, powertrain and basic warranty.',
      },
    },
    'licensePlateSearchType': {
      'default': {
        'header': 'Research a Vehicle By <strong><span class="font-weight-bold font-italic"><br class="d-none d-md-block d-xl-none">License Plate</span></strong>',
        'subheader': 'Enter a license plate to search for vehicle history records.',
      },
    },
  }

  function dynamicHeadline(pageType) {
    if (typeof (segmentRuleQueryParams) !== 'undefined' && segmentRuleQueryParams) {
      var year = segmentRuleQueryParams.cy;
      var make = segmentRuleQueryParams.cma;
      var model = segmentRuleQueryParams.cmo;
    } else {
      var year = getValueFromURLParam('cy');
      var make = getValueFromURLParam('cma').toUpperCase();
      var model = getValueFromURLParam('cmo').toUpperCase();
    }

    if (pageType === 'general_ymm' || pageType === 'accident_ymm' || pageType === 'thef_ymm' || pageType === 'salvage_ymm' || pageType === 'history_ymm' || pageType === 'value_ymm' || pageType === 'specs_ymm' || pageType === 'equipt_ymm' || pageType === 'sales_ymm' || pageType === 'recall_ymm' || pageType === 'warranty_ymm' || pageType === 'headline') {
      if (year || make || model) {
        $('.js-headline-year').html(year);
        $('.js-headline-make').html(make);
        $('.js-headline-model').html(model);
        $('.js-subheadline-year').html(year);
        $('.js-subheadline-make').html(make);
        $('.js-subheadline-model').html(model);
      }
    }
  }

  function setSearchTypeLoad(searchType) {
    if (searchType === 'plate') {
      hideSearchVinHeader();
      showSearchVinHeader();
    }

    if (searchType === 'ymm' || window.pageview_flow_category === 'ymm') {
      hideSearchVinHeader();
      showYMMSearchHeader();
    }

    if (searchType === 'marketplace') {
      hideSearchVinHeader();
      showMarketPlaceSearchHeader();
    }
  }

  function hideSearchVinHeader() {
    $('.js-search-type-vin, .js-vin-search-carousel').removeClass( 'active' );
  }

  function showSearchVinHeader() {
    $('.js-search-type-license, .js-license-search-carousel').addClass( 'active' );
  }

  function showYMMSearchHeader() {
    $('.js-search-type-ymm, .js-ymm-search-carousel').addClass( 'active' );
  }

  function showMarketPlaceSearchHeader() {
    $('.js-search-type-marketplace, .js-marketplace-search-carousel').addClass( 'active' );
  }

  function setMainHeadersTextBasedOnPagetypeURLParam() {

    $('.js-header-vin-pagetype').html(DYNAMIC_HEADERS_MAP.vinSearchType['default'].header);
    $('.js-sub-header-vin-pagetype').html(DYNAMIC_HEADERS_MAP.vinSearchType['default'].subheader);
    $('.js-header-ymm-pagetype').html(DYNAMIC_HEADERS_MAP.ymmSearchType['default'].header);
    $('.js-sub-header-ymm-pagetype').html(DYNAMIC_HEADERS_MAP.ymmSearchType['default'].subheader);
    $('.js-header-license-pagetype').html(DYNAMIC_HEADERS_MAP.licensePlateSearchType['default'].header);
    $('.js-sub-header-license-pagetype').html(DYNAMIC_HEADERS_MAP.licensePlateSearchType['default'].subheader);

    var pageType;
    var searchType;

    if (typeof (segmentRuleQueryParams) !== 'undefined' && segmentRuleQueryParams) {
      pageType = segmentRuleQueryParams.pagetype;
      searchType = segmentRuleQueryParams.searchtype;
    } else {
      pageType = getValueFromURLParam('pagetype');
      searchType = getValueFromURLParam('searchtype');
    }

    if (pageType) {
      if (searchType === 'ymm') {
        var ymmPageType = DYNAMIC_HEADERS_MAP.ymmSearchType[pageType];
        if (ymmPageType) {
          var header = DYNAMIC_HEADERS_MAP.ymmSearchType[pageType].header;
          var subheader = DYNAMIC_HEADERS_MAP.ymmSearchType[pageType].subheader;
          $('.js-header-ymm-pagetype').html(header);
          $('.js-sub-header-ymm-pagetype').html(subheader);
        }
      }
      else if (searchType === 'plate') {
        var licensePageType = DYNAMIC_HEADERS_MAP.licensePlateSearchType[pageType];
        if (licensePageType) {
          var header = DYNAMIC_HEADERS_MAP.licensePlateSearchType[pageType].header;
          var subheader = DYNAMIC_HEADERS_MAP.licensePlateSearchType[pageType].subheader;
          $('.js-header-licence-pagetype').html(header);
          $('.js-sub-header-license-pagetype').html(subheader);
        }
      }
      else{
        var vinPageType = DYNAMIC_HEADERS_MAP.vinSearchType[pageType];
        if (vinPageType) {
          var header = DYNAMIC_HEADERS_MAP.vinSearchType[pageType].header;
          var subheader = DYNAMIC_HEADERS_MAP.vinSearchType[pageType].subheader;
          $('.js-header-vin-pagetype').html(header);
          $('.js-sub-header-vin-pagetype').html(subheader);
        }
      }
      dynamicHeadline(pageType);
    }
    setSearchTypeLoad(searchType);
  }

  var getValueFromURLParam = function (name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  setMainHeadersTextBasedOnPagetypeURLParam();
  showVinSearchElements();
  initHamburgerMenu();

})(jQuery);
