// import { Picker } from 'emoji-mart';

// async function addEmojiPickerToCommentForm() {
//   const textarea = document.querySelector('.el-textarea__inner');

//   // Create the smiley icon
//   const smileyIcon = document.createElement('span');
//   smileyIcon.classList.add('smiley-icon');
//   smileyIcon.innerHTML = '&#x1F600;'; // Unicode smiley face emoji

//   // Fetch the emoji data
//   const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data');
//   const data = await response.json();

//   // Create a new container for the picker
//   const pickerContainer = document.createElement('div');
//   pickerContainer.classList.add('custom-picker-container');
//   document.body.appendChild(pickerContainer);

//   // Initialize the picker with the fetched data
//   const picker = new Picker({
//     data,
//     onSelect: (emoji) => {
//       const cursorPosition = textarea.selectionStart;
//       const currentValue = textarea.value;
//       const newValue = `${currentValue.substring(0, cursorPosition)}${emoji.native}${currentValue.substring(cursorPosition)}`;
//       textarea.value = newValue;
//       pickerContainer.style.display = 'none';
//     },
//   });

//   // Add the picker to the container
//   pickerContainer.appendChild(picker.element[0]);
//   pickerContainer.style.display = 'none';
//   pickerContainer.style.position = 'absolute';
//   pickerContainer.style.zIndex = 9999;

//   // Add click event listener to the smiley icon to open/close the picker
//   smileyIcon.addEventListener('click', () => {
//     if (pickerContainer.style.display === 'none') {
//       // Get the position of the smiley icon
//       const rect = smileyIcon.getBoundingClientRect();
//       pickerContainer.style.top = `${rect.bottom + window.scrollY}px`;
//       pickerContainer.style.left = `${rect.left + window.scrollX}px`;

//       pickerContainer.style.display = 'block';
//     } else {
//       pickerContainer.style.display = 'none';
//     }
//   });

//   // Add the smiley icon to the page
//   const postForm = document.querySelector('.post-form-textarea');
//   postForm.insertBefore(smileyIcon, postForm.firstChild);
// }

// window.addEventListener('load', () => addEmojiPickerToCommentForm());
