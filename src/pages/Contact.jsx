import { useState } from "react";

function Contact() {
  const [message, setMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div>
      <h2>Contact</h2>

      <label htmlFor="contact-message">Message</label>
      <input
        id="contact-message"
        type="text"
        placeholder="Enter your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <p>You typed: {message}</p>
      <p>Character count: {message.length}</p>

      <button type="button" onClick={() => setShowHelp((visible) => !visible)}>
        {showHelp ? "Hide help" : "Show help"}
      </button>

      {showHelp && (
        <div>
          <p>
            Use this form to send a quick message. The input is controlled by React
            state and updates without a page reload.
          </p>
        </div>
      )}
    </div>
  );
}

export default Contact;