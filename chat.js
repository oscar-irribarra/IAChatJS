const API_URL = 'https://api.openai.com/v1/chat/completions';
const API_TOKEN = '';
const API_MODEL = 'gpt-4o-mini';
const API_MAX_TOKENS = '40';

const chat = document.getElementById('chat');
const sendButton = document.getElementById('send_button');
const input_message = document.getElementById('input_message');

const buttons = document.querySelectorAll('button');

const createNewChatMessageByRole = (message, role) => {
  const newResponseElement = document.createElement('div');
  newResponseElement.className = `message ${role}`;
  newResponseElement.innerHTML = message;
  chat.appendChild(newResponseElement);
  chat.scrollTop = chat.scrollHeight;
};

(() => {
  createNewChatMessageByRole('Demo', 'received');
})();

const disableControls = () => {
  buttons.forEach((button) => {
    button.setAttribute('disabled', true);
  });

  input_message.setAttribute('disabled', true);
};

const enableControls = () => {
  buttons.forEach((button) => {
    button.removeAttribute('disabled');
  });

  input_message.removeAttribute('disabled');
};

const generateText = async () => {
  const inputValue = input_message.value;

  if (inputValue === '') return;

  createNewChatMessageByRole(inputValue, 'sent');

  input_message.value = '';

  disableControls();

  const response = await sendTextToApi(inputValue);

  createNewChatMessageByRole(response, 'received');

  enableControls();
};

sendButton.addEventListener('click', generateText);

const inputFileButton = document.getElementById('inputFile_button');
const inputFile = document.getElementById('file_input');

inputFileButton.addEventListener('click', () => {
  inputFile.click();
});

inputFile.addEventListener('change', async (e) => {
  const newImageElement = document.createElement('img');
  newImageElement.src = URL.createObjectURL(e.target.files[0]);

  const newDivElement = document.createElement('div');
  newDivElement.className = 'message sent';
  newDivElement.appendChild(newImageElement);

  chat.appendChild(newDivElement);
});

chat.addEventListener('click', async (event) => {
  const clickedElement = event.target;
  if (clickedElement.tagName === 'IMG') {
    disableControls();

    const base64 = await converImageToBase64(clickedElement.src);

    const data = await sendImageToApi(base64);

    createNewChatMessageByRole(data, 'received');

    window.open(
      clickedElement.src,
      'child',
      'left=100,top=100,width=320,height=320'
    );

    enableControls();
  }
});

const convertImageToBase64 = async (image) => {
  const resp = await fetch(image);
  const blob = await resp.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const sendTextToApi = async (message) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      model: API_MODEL,
      messages: [
        {
          role: 'assistant',
          content:
            'You are a helpful assistant. that answers questions on a funniest way, only in a spanish language.'
        },
        {
          role: 'user',
          content: `${message}`
        }
      ],
      store: true,
      max_completion_tokens: Number(API_MAX_TOKENS)
    })
  });

  const data = await response.json();

  return data.choices[0].message.content;
};

const sendImageToApi = async (base64) => {
  const response = await fetch(API_URL, {
    model: API_MODEL,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      model: API_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'What character is in this image?, answer in spanish'
            },
            {
              type: 'image_url',
              image_url: { 'url': `${base64}` }
            }
          ]
        }
      ],
      store: true
    }),
    max_tokens: 300
  });

  const data = await response.json();

  return data.choices[0].message.content;
};
