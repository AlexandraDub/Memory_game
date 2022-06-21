const mainContainer = document.querySelector('.main_container')
const gameField = document.querySelector('.cards')
const gameOptionsForm = document.querySelector('.game_settings')
const gameOptions = {}

const errorMessage = document.querySelector('#username_error_msg')

const starGameButton = document.querySelector('#save_name_and_start_game')
const startGamePhrase = document.querySelector('.notation')
const openCardsTime = document.querySelector('.time')

let clickedCounter = 0
let pairFound = 0

let firstCardId = ''
let secondCardId = ''
let firstTargetParent = ''
let secondTargetParent = ''

let gamerName = ''

gameOptionsForm.addEventListener('submit', getGameOptions);

starGameButton.addEventListener('click', startGame)

// Получение найстроек игры
function getGameOptions(event) {
    gameField.innerHTML = ''
    event.preventDefault();
    const level = document.querySelector('[name="level_choose"]:checked')
    const images = document.querySelector('[name="img_choose"]:checked')
    gameOptions.level = level.value
    gameOptions.images = images.value
    createGameField();
};

// Отрисовка карточек
function createGameField() {
    gameField.removeEventListener('click', playGame)
    let numberOfCards = 0
    if ((gameOptions.level) === 'easy') {
        numberOfCards = 8
    } else {
        numberOfCards = 12
    }
    const arrayOfImages = []

    for (let i = 1; i <= (numberOfCards / 2); i++) {
        arrayOfImages.push(`${gameOptions.images}_${i}`)
        arrayOfImages.push(`${gameOptions.images}_${i}`)
    }

    for (let n = 0; n < numberOfCards; n++) {
        const cardCell = document.createElement('div')
        const cardShirt = document.createElement('div')
        const cardImage = document.createElement('div')
        let cardName = arrayOfImages.splice(Math.floor(Math.random() * (numberOfCards - n)), 1)
        cardCell.id = cardName
        cardCell.classList.add('card')
        cardShirt.classList.add('card__shirt--front')
        cardShirt.classList.add('card__shirt')
        cardImage.classList.add('card__shirt--back')
        cardImage.classList.add('card__shirt')
        cardImage.style.backgroundImage = `url(images/${gameOptions.images}/${cardName}.png)`;
        cardImage.style.backgroundSize = 'cover';
        gameField.append(cardCell)
        cardCell.append(cardShirt)
        cardCell.append(cardImage)
    }
}

// Валидация имени
function validateUsername() {
    gamerName = (document.querySelector('.input_for_name')).value
    errorMessage.textContent = ''
    if (gamerName === '') {
        errorMessage.textContent = 'Напиши имя!'
        return false
    } else if (gamerName.length < 3) {
        errorMessage.textContent = 'Слишком короткое!'
        return false
    } else if (gamerName.length > 10) {
        errorMessage.textContent = 'Слишком длинное!'
        return false
    }
    return true
}

// запуск игры и сохранение результатов в локал сторидж
function startGame() {
    pairFound = 0
    clickedCounter = 0
    errorMessage.textContent = ''
    if (!validateUsername()) {
        return
    }
    if (!gameOptions.images || !gameOptions.level) {
        errorMessage.textContent = 'Выбери сложность и картиники'
        return
    }
    const cardCell = document.querySelectorAll('.card')
    cardCell.forEach(element => {
        element.classList.add('is-flipped')
    });
    startGamePhrase.style.visibility = 'visible'
    countdown()

}

function countdown() {
    if ((gameOptions.level) === 'easy') {
        x = 5
    } else {
        x = 7
    }
    openCardsTime.innerHTML = x
    let timer = setInterval(() => {
        openCardsTime.innerHTML = x--
        if (x < 0) {
            clearInterval(timer)
            hideCards()
            gameField.addEventListener('click', playGame)
            startGamePhrase.style.visibility = 'hidden'
        }
    }, 1000)
}

function hideCards() {
    const cardTable = document.querySelectorAll('.card')
    cardTable.forEach(element => {
        element.classList.remove('is-flipped')
    });
}

function flipCard(cardCell) {
    cardCell.classList.toggle('is-flipped')
}

function playGame(event) {
    if (event.target.classList.contains('cards')) {
        return
    }
    event.preventDefault()
    clickedCounter++
    let id = event.target.parentElement.id
    if (firstCardId === '') {
        firstTargetParent = event.target.parentElement
        firstCardId = id
        flipCard(firstTargetParent)
        return
    } else if (firstTargetParent === event.target.parentElement) {
        clickedCounter--
        return
    } else {
        secondTargetParent = event.target.parentElement
        flipCard(secondTargetParent)
        setTimeout(function () {
            secondCardId = id
            if (firstCardId === secondCardId) {
                firstTargetParent.style.visibility = 'hidden'
                secondTargetParent.style.visibility = 'hidden'
                pairFound++
                checkWinner()
            } else {
                flipCard(firstTargetParent)
                flipCard(secondTargetParent)
            }
            firstCardId = ''
            secondCardId = ''
            firstTargetParent = ''
            secondTargetParent = ''
        }, 1000)

    }
}

function checkWinner() {
    if (gameOptions.level === 'easy') {
        if (pairFound < 4) {
            return
        }
    } else {
        if (pairFound < 6) {
            return
        }
    }
    let gameResult = {}
    gameResult.result = clickedCounter
    gameResult.level = gameOptions.level
    localStorage.setItem(gamerName, JSON.stringify(gameResult))
    showDialog()
}

function showDialog() {
    const dialogWrapper = document.createElement('div');
    dialogWrapper.classList.add('dialog-wrapper');
    mainContainer.append(dialogWrapper);

    const dialog = document.createElement('div');
    dialog.classList.add('dialog');
    dialogWrapper.append(dialog);

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = 'Поздравляю! Ты выиграл!';
    dialog.append(messageElement);

    const successButton = document.createElement('button');
    successButton.classList.add('ok_button')
    successButton.textContent = 'Прекрасно!';
    dialog.append(successButton);

    successButton.addEventListener('click', gameLeaderBoard);
    successButton.addEventListener('click', close);


    function close() {
        successButton.removeEventListener('click', gameLeaderBoard);
        successButton.removeEventListener('click', close);
        dialogWrapper.remove();
    }
}
function gameLeaderBoard() {
    const leaderBoard = document.querySelector('.winners')
    leaderBoard.innerHTML = 'легко:'
    fillWinner('easy')
    leaderBoard.append('тяжело:')
    fillWinner('hard')

    function fillWinner(level) {
        Object.entries(localStorage)
            .filter(e => JSON.parse(e[1]).level === level)
            .sort((e1, e2) => {
                return parseInt(JSON.parse(e1[1]).result) - parseInt(JSON.parse(e2[1]).result)
            })
            .splice(0, 3)
            .forEach(w => {
                const leader = document.createElement('li')
                leader.textContent = `${w[0]} - ${JSON.parse(w[1]).result}`
                leaderBoard.append(leader)
            })
    }

}