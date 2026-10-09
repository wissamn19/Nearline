         const myInput = document.querySelector('#myInput');
         
         const items = [];

         function captureEnterKeyPress() {
            if (!myInput) return;
            myInput.addEventListener('keydown', function(event) {
               if (event.key !== 'Enter') return;

               const inputValue = myInput.value.trim();
               if (!inputValue) return;

               const item = classifyInput(inputValue);
               const newItem = createItem(item.text, item.type);
               items.push(newItem);
               renderItem(newItem);
               myInput.value = '';

               localStorage.setItem('items', JSON.stringify(items));
            });
         }

         function classifyInput(text) {
            if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('www.')) {
               return { text, type: '#linksList' };
            }
            if (text.startsWith('!')) {
               return { text: text.slice(1).trim(), type: '#notesList' };
            }
            return { text, type: '#tasksList' };
         }

         captureEnterKeyPress();
         


         function createItem(text, type) {
            return {
               id: Date.now() + Math.random(),
               text,
               type,
               status: 'todo',
               createdAt: Date(),
               remindAt: ''
            };


         }
         
            
            function renderItem(item) {
            const list = document.querySelector(item.type);
            if (!list) return;
            const li = document.createElement('li');
            li.textContent = item.text;
            list.appendChild(li);
         }

         
         


