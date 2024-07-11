document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');

    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const responseData = await response.json();

    if (response.ok) {
        localStorage.setItem('token', responseData.token); // Store the token in local storage
        messageElement.textContent = 'Login successful!';
        messageElement.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirect to the home page
        }, 2000); // Redirect to home page after 2 seconds
    } else {
        messageElement.textContent = `Error: ${responseData.error}`;
        messageElement.style.color = 'red';
    }
});
