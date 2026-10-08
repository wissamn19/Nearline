const myInput = document.querySelector('#myInput');
let inputValue = '';

function classifyInput() {
      if (inputValue.startsWith('!') || inputValue.startsWith('http://') || inputValue.startsWith('www.')) {
         console.log('Link marked: ' + inputValue);
       } else {
         console.log('Note marked: ' + inputValue);
       }
        } 



function captureEnterKeyPress() {
   if (!myInput) return;
   myInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
         inputValue = myInput.value.trim();
         localStorage.setItem('inputValue', JSON.stringify(inputValue));
         classifyInput();
      }

   });
}  

captureEnterKeyPress();









