function selectDifficulty(level){
    difficulty = level;
    const buttons = document.querySelectorAll('.difficultyBtn');
    buttons.forEach(button => button.classList.remove('selected'));
    event.target.classList.add('selected');
}