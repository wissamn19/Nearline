const myInput = document.querySelector('#myInput');

function captureEnterKeyPress() {
   if (!myInput) return;
   myInput.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter') return;

      const inputValue = myInput.value.trim();
      if (!inputValue) return;

      localStorage.setItem('inputValue', JSON.stringify(inputValue));
      const item = classifyInput(inputValue);
      addItem(item.text, item.selector);
      myInput.value = '';
   });
}

function classifyInput(text) {
   if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.')) {
      return { text, selector: '#linksList' };
   }
   if (text.startsWith('!')) {
      return { text: text.slice(1).trim(), selector: '#notesList' };
   }
   return { text, selector: '#tasksList' };
}

captureEnterKeyPress();


function addItem(text, selector) {
   const list = document.querySelector(selector);
   if (!list) return;
   const li = document.createElement('li');
   li.textContent = text;
   list.appendChild(li);
}

