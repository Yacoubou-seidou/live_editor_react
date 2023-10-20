import React, { useEffect, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import io from 'socket.io-client';

const MonacoEditor = () => {
  const [editor, setEditor] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io();
    setSocket(newSocket);

    // Load Monaco Editor
    const editorInstance = monaco.editor.create(document.getElementById('editor'), {
      value: '',
      language: 'javascript',
      theme: 'vs-dark'
    });
    setEditor(editorInstance);

    editorInstance.onDidChangeModelContent(() => {
      const code = editorInstance.getValue();
      newSocket.emit('code-update', code);
    });

    editorInstance.onDidChangeCursorPosition(event => {
      const position = {
        lineNumber: event.position.lineNumber,
        column: event.position.column
      };
      newSocket.emit('cursor-position', position);
    });

    newSocket.on('receive-code', code => {
      editorInstance.setValue(code);
    });

    newSocket.on('receive-cursor-position', position => {
      editorInstance.setPosition(position);
    });

    newSocket.on('console-message', message => {
      displayConsoleMessage(message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const displayConsoleMessage = message => {
    const consoleElement = document.getElementById('console');
    const newMessageElement = document.createElement('div');
    newMessageElement.innerText = message;
    consoleElement.appendChild(newMessageElement);
  };

  const runCode = () => {
    const code = editor.getValue();
    displayConsoleMessage('Running code...');
  };

  const clearConsole = () => {
    const consoleElement = document.getElementById('console');
    consoleElement.innerHTML = '';
  };

  const sendMessage = () => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    console.log(message);
    socket.emit('chat-message', message);
    messageInput.value = '';
    displayChatMessage(message)
  };

  const displayChatMessage = message => {
    const messageContainer = document.getElementById('messageContainer');
    const newMessageElement = document.createElement('div');
    newMessageElement.innerHTML = `<p><span>[User]:</span>${message}</p>`;
    messageContainer.appendChild(newMessageElement);
  };

  return (
    <div className='container'>
      <div className='challenge'>
        <h3 className="title">Challenge title</h3>
        <p className="detail">
          Write a program that show numbers form 1 to 5 in the console.
        </p>
      </div>
      <div className="chatBox">
        <div id="messageContainer" >
          <input type="text"
            id="messageInput"
            placeholder="Type your message" />
          <button onClick={sendMessage}>Send Message</button>
        </div>
      </div>
      <div class="codeContainer">
        <div id="editor" style={{ height: '400px' }} >
          <button onClick={runCode}>Run Code</button>
          <button onClick={clearConsole}>Clear Console</button>
        </div>
        <div id="console" >
        </div >
      </div>
    </div>
  );
};

export default MonacoEditor;
