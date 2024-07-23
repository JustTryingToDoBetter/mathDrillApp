// profile.js
async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html'; // Redirect to login if no token
        return;
    }

    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            document.getElementById('username').innerText = `Username: ${user.username}`;
            document.getElementById('email').innerText = `Email: ${user.email}`;
            document.getElementById('bio').value = user.bio;
            document.getElementById('profile-picture').src = user.profile_picture || 'default-profile.png';
            loadProgressChart(user.progress);
        } else {
            console.error('Failed to fetch profile');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
}

function editProfile() {
    document.getElementById('bio').contentEditable = true;
}

async function saveProfile() {
    const token = localStorage.getItem('token');
    const email = document.getElementById('email').innerText.replace('Email: ', '');
    const bio = document.getElementById('bio').value;
    const profile_picture = document.getElementById('profile-picture').src;

    try {
        const response = await fetch('/api/users/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, profile_picture, bio })
        });

        if (response.ok) {
            alert('Profile updated successfully');
        } else {
            alert('Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

function goBack() {
    window.location.href = '/home';
}

function loadProgressChart(progress) {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Addition', 'Multiplication', 'Division'],
            datasets: [{
                label: 'Progress',
                data: progress, // Assuming progress is an array [additionProgress, multiplicationProgress, divisionProgress]
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', fetchProfile);
