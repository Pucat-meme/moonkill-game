// Event listener for the Play Now button
document.getElementById('playButton').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById('gameSection').style.display = 'block';
    startGame();
});

// Event listener for the Exit Game button
document.getElementById('exitGame').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById('gameSection').style.display = 'none';
    stopGame();
});
