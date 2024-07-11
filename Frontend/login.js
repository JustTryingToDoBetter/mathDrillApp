document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store the token in local storage
        alert('Login successful!');
        window.location.href = 'index.html'; // Redirect to the home page
    } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
    }
});
