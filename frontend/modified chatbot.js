/*
 * Gallop AI frontend integration.
 *
 * Set window.GALLOP_AI_API_BASE_URL to the Railway public domain (without a
 * trailing slash) before this file runs on GitHub Pages. When unset, requests
 * use the current origin, which is convenient for local/same-origin hosting.
 */
const GALLOP_AI_API_BASE_URL = String(window.GALLOP_AI_API_BASE_URL || '').replace(/\/+$/, '');
const GALLOP_AI_TIMEOUT_MS = 20000;
const GALLOP_AI_MAX_LENGTH = 500;

const gallopAiChatForm = document.querySelector('#ai-chat-form');

if (gallopAiChatForm) {
  const chatMessages = document.querySelector('#ai-chat-messages');
  const chatInput = document.querySelector('#ai-chat-input');
  const sendButton = gallopAiChatForm.querySelector('button[type="submit"]');
  const suggestionButtons = document.querySelectorAll('.ai-chat-suggestions button');
  let requestInProgress = false;

  const scrollChatToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);

  // Markdown is parsed only after HTML escaping. Only safe links are emitted.
  const renderMarkdown = markdown => {
    const codeBlocks = [];
    const links = [];
    let safe = escapeHtml(markdown).replace(/```([\w-]*)\n?([\s\S]*?)```/g, (_match, language, code) => {
      const token = `@@GALLOP_CODE_${codeBlocks.length}@@`;
      codeBlocks.push(`<pre><code${language ? ` class="language-${language}"` : ''}>${code.trim()}</code></pre>`);
      return token;
    });

    safe = safe
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => {
        const token = `@@GALLOP_LINK_${links.length}@@`;
        links.push(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
        return token;
      })
      .replace(/https?:\/\/[^\s<)]+/g, url => {
        const token = `@@GALLOP_LINK_${links.length}@@`;
        links.push(`<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        return token;
      })
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');

    links.forEach((link, index) => {
      safe = safe.replace(`@@GALLOP_LINK_${index}@@`, link);
    });
    codeBlocks.forEach((block, index) => {
      safe = safe.replace(`@@GALLOP_CODE_${index}@@`, block);
    });
    return safe;
  };

  const appendChatMessage = (content, sender) => {
    const message = document.createElement('div');
    message.className = `ai-message ai-message-${sender}`;

    if (sender === 'bot') {
      const avatar = document.createElement('img');
      avatar.src = rootAsset('images/gallop-ai-horse.png');
      avatar.alt = '';
      message.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    const text = document.createElement('p');
    if (sender === 'bot') {
      text.innerHTML = renderMarkdown(content);
    } else {
      text.textContent = content;
    }
    bubble.appendChild(text);
    message.appendChild(bubble);
    chatMessages.appendChild(message);
    scrollChatToBottom();
  };

  const setWaiting = waiting => {
    requestInProgress = waiting;
    sendButton.disabled = waiting;
    suggestionButtons.forEach(button => {
      button.disabled = waiting;
    });
    gallopAiChatForm.setAttribute('aria-busy', String(waiting));
  };

  const createTypingIndicator = () => {
    const typing = document.createElement('div');
    typing.className = 'ai-message ai-message-bot ai-message-typing';
    typing.setAttribute('role', 'status');
    typing.setAttribute('aria-label', 'Gallop AI is typing');
    typing.innerHTML = `<img src="${rootAsset('images/gallop-ai-horse.png')}" alt=""><div><span></span><span></span><span></span></div>`;
    chatMessages.appendChild(typing);
    scrollChatToBottom();
    return typing;
  };

  const sendChatQuestion = async question => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || requestInProgress) return;

    if (trimmedQuestion.length > GALLOP_AI_MAX_LENGTH) {
      appendChatMessage(`Please keep your message to ${GALLOP_AI_MAX_LENGTH} characters or fewer.`, 'bot');
      return;
    }

    appendChatMessage(trimmedQuestion, 'user');
    chatInput.value = '';
    setWaiting(true);
    const typing = createTypingIndicator();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), GALLOP_AI_TIMEOUT_MS);

    try {
      const response = await fetch(`${GALLOP_AI_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedQuestion }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('Gallop AI returned an invalid response.');
      }

      appendChatMessage(data.reply.trim(), 'bot');
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'Gallop AI took too long to respond. Please try again.'
        : 'I could not connect to Gallop AI. Please check your connection and try again.';
      appendChatMessage(message, 'bot');
    } finally {
      window.clearTimeout(timeout);
      typing.remove();
      setWaiting(false);
      chatInput.focus();
      scrollChatToBottom();
    }
  };

  chatInput.maxLength = GALLOP_AI_MAX_LENGTH;

  gallopAiChatForm.addEventListener('submit', event => {
    event.preventDefault();
    sendChatQuestion(chatInput.value);
  });

  chatInput.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      gallopAiChatForm.requestSubmit();
    }
  });

  suggestionButtons.forEach(button => {
    button.addEventListener('click', () => sendChatQuestion(button.textContent));
  });
}
