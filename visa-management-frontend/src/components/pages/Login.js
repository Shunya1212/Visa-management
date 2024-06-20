import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // フォームのデフォルトの送信を防止
    console.log('Login Submitted', { username, password });
    // ここでログインロジックを実装（例：APIへのPOSTリクエスト）
  };

  return (
      <form onSubmit={handleSubmit}>
      <div className="form-field">
          <label className="form-label">
            User Name:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
        </div>
        <div className="form-field">
          <label className="form-label">
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
        <button type="submit">Login</button>
        </div>
        
      </form>
  );
}

export default Login;
