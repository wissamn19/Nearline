               const myInput = document.querySelector('#myInput');
               
               const items = JSON.parse(localStorage.getItem('items')) || [];



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
                  const reminder = parseReminder(text);
                  return {
                     id: Date.now() + Math.random(),
                     text: reminder.text,
                     type,
                     status: 'todo',
                     createdAt: Date(),
                     remindAt: reminder.remindAt,
                     reminded: false

                  };


               }
               
                  
                  function renderItem(item) {
                  const list = document.querySelector(item.type);
                  if (!list) return;
                  const li = document.createElement('li');
                  if (item.type === '#tasksList') {
                     const checkbox = document.createElement('input');
                     checkbox.type = "checkbox";
                     checkbox.checked = item.status === 'done';
                     li.classList.toggle('done', checkbox.checked);

                     checkbox.addEventListener('change' , function() {
                     item.status = checkbox.checked ? 'done' : 'todo';
                     li.classList.toggle('done', checkbox.checked);
                     localStorage.setItem('item', JSON.stringify(items));
                     });
                  li.appendChild(checkbox);
               }
                  const deleteButton = document.createElement('button');
                  deleteButton.textContent = 'Delete';
                  deleteButton.type = 'button';
                  

                  deleteButton.addEventListener('click', function(){
                  const index = items.findIndex(entry =>entry.id === item.id);
                  if (index !== -1) {
                     items.splice(index, 1);
                     li.remove();
                     localStorage.setItem('items', JSON.stringify(items));
                  }
                  });
                  li.appendChild(deleteButton);
                  
                  li.appendChild(document.createTextNode(item.text));
                  list.appendChild(li);

                  if (item.remindAt) {
                  const timeLabel = document.createElement('span');
                  timeLabel.textContent = ` @${new Date(item.remindAt).toLocaleTimeString([], {
                   hour: 'numeric',
                   minute: '2-digit'
                  })}`;
                  li.appendChild(timeLabel);
                 }
               }

               function parseReminder(text) {
                  const regex = /@(\d{1,2}):(\d{2})/;
                  const match = text.match(regex); 
                  if (!match) return {
                  text, remindAt: null
                  }
                  const hours = Number(match[1]);
                  const minutes = Number(match[2]);
                  if (hours > 23 || minutes > 59 ) {
                     return {text, remindAt: null
                        
                     }
                  }

                  const d = new Date();
                  d.setHours(hours, minutes, 0, 0);

                  if (d.getTime() <= Date.now()) {
                     d.setDate(d.getDate() + 1);
                     d.getTime();
                  } 
                  return {
                     text: text.replace(regex, '').trim(),
                     remindAt: d.toISOString()
                  }

               }

               function checkReminders () {
                  const now = Date.now();

                  items.forEach(function (item) {
                     if (item.remindAt !== null && Date.parse(item.remindAt) <= now && 
                     item.status !== 'done' && !item.reminded) {
                     notify(item.text);
                     item.reminded = true;
                     localStorage.setItem('items', JSON.stringify(items));
                   }
                  });
                  }

                  checkReminders();                     
                  setInterval(checkReminders, 5000); 


               function notify(text) {
                  if (Notification.permission === 'default') {
  Notification.requestPermission();
}
                  if (Notification.permission === 'granted') {
                     new Notification('Nearline', {body: text });
                  } else {
                     alert('Reminder: ' + text);
                  }

               }

               

               
               


