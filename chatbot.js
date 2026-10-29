/**
 * Hostel FAQ Chatbot – fetches answers from /api/faqs/search
 */
(function () {
  const STYLE = `
  #hostel-chatbot-btn {
    position: fixed; bottom: 24px; right: 24px; z-index: 9998;
    width: 56px; height: 56px; border-radius: 50%;
    background: #1f6f78;
    color: #fff; border: none; cursor: pointer;
    box-shadow: 0 4px 20px rgba(31,111,120,0.3);
    font-size: 24px; display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s;
  }
  #hostel-chatbot-btn:hover { transform: scale(1.08); }
  #hostel-chatbot-window {
    position: fixed; bottom: 90px; right: 24px; z-index: 9999;
    width: 360px; max-width: calc(100vw - 32px); height: 480px;
    background: #fff; border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.18);
    display: none; flex-direction: column; overflow: hidden;
    font-family: 'Poppins', 'Inter', sans-serif;
  }
  #hostel-chatbot-window.open { display: flex; }
  .cb-header {
    background: #1f6f78;
    color: #fff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
  }
  .cb-header h4 { margin: 0; font-size: 15px; font-weight: 600; }
  .cb-close { background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer; }
  .cb-messages { flex: 1; overflow-y: auto; padding: 16px; background: #f8fafc; }
  .cb-msg { margin-bottom: 12px; max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.45; }
  .cb-msg.bot { background: #fff; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
  .cb-msg.user { background: #2f8790; color: #fff; margin-left: auto; border-bottom-right-radius: 4px; }
  .cb-suggestions { padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px; background: #fff; border-top: 1px solid #e2e8f0; }
  .cb-chip {
    font-size: 11px; padding: 5px 10px; border-radius: 20px;
    background: #e0f2f1; color: #155e63; border: none; cursor: pointer;
  }
  .cb-chip:hover { background: #c7d2fe; }
  .cb-input-row { display: flex; padding: 10px; gap: 8px; background: #fff; border-top: 1px solid #e2e8f0; }
  .cb-input-row input {
    flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; font-size: 13px; outline: none;
  }
  .cb-input-row button {
    background: #1f6f78; color: #fff; border: none; border-radius: 10px; padding: 0 14px; cursor: pointer; font-weight: 600;
  }
  .cb-loading { font-size: 12px; color: #64748b; padding: 4px 0; }
  @media (max-width: 480px) {
    #hostel-chatbot-window { bottom: 80px; right: 8px; left: 8px; width: auto; height: 70vh; }
  }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  const btn = document.createElement("button");
  btn.id = "hostel-chatbot-btn";
  btn.innerHTML = "💬";
  btn.title = "Hostel FAQ Assistant";
  document.body.appendChild(btn);

  const win = document.createElement("div");
  win.id = "hostel-chatbot-window";
  win.innerHTML = `
    <div class="cb-header">
      <h4>Hostel FAQ Assistant</h4>
      <button class="cb-close" aria-label="Close">&times;</button>
    </div>
    <div class="cb-messages" id="cbMessages">
      <div class="cb-msg bot">Hi! I can answer questions about hostel rules, timings, mess, leave, fees and more. Ask me anything.</div>
    </div>
    <div class="cb-suggestions" id="cbSuggestions">
      <button class="cb-chip" data-q="What time does the hostel gate close?">Gate closing time</button>
      <button class="cb-chip" data-q="What are the mess timings?">Mess timings</button>
      <button class="cb-chip" data-q="How do I apply for leave?">Apply leave</button>
      <button class="cb-chip" data-q="How do I raise a complaint?">Raise complaint</button>
    </div>
    <div class="cb-input-row">
      <input type="text" id="cbInput" placeholder="Ask about hostel..." />
      <button id="cbSend">Send</button>
    </div>
  `;
  document.body.appendChild(win);

  const messages = document.getElementById("cbMessages");
  const input = document.getElementById("cbInput");
  const sendBtn = document.getElementById("cbSend");

  btn.addEventListener("click", () => win.classList.toggle("open"));
  win.querySelector(".cb-close").addEventListener("click", () => win.classList.remove("open"));

  document.getElementById("cbSuggestions").addEventListener("click", (e) => {
    if (e.target.classList.contains("cb-chip")) {
      input.value = e.target.dataset.q;
      sendMessage();
    }
  });

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "cb-msg " + who;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const q = input.value.trim();
    if (!q) return;
    addMsg(q, "user");
    input.value = "";
    const loading = document.createElement("div");
    loading.className = "cb-loading";
    loading.textContent = "Searching...";
    messages.appendChild(loading);

    let result;
    try {
      result = await fetch("http://127.0.0.1:5000/api/faqs/search?q=" + encodeURIComponent(q) + "&limit=3").then((r) => r.json());
    } catch {
      result = { success: false };
    }
    loading.remove();

    if (result.success && result.data && result.data.length > 0) {
      result.data.forEach((faq) => {
        addMsg(faq.answer, "bot");
      });
    } else {
      addMsg("It looks like I don't have information about that. Please contact the hostel warden.", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
