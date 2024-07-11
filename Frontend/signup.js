document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('signup-message');

    const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const responseData = await response.json();

    if (response.ok) {
        messageElement.textContent = 'User registered successfully!';
        messageElement.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000); // Redirect to login page after 2 seconds
    } else {
        messageElement.textContent = `Error: ${responseData.error}`;
        messageElement.style.color = 'red';
    }
});
