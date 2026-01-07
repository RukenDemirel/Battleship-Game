const gameBoardsContainer = document.querySelector('#gameboards-container')
const flipButton = document.querySelector('#flip-button')
const optionContainer = document.querySelector('.option-container')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')
flipButton.addEventListener('click', flip)

//Option choosing
let angle = 0
function flip() {
	angle = angle === 0 ? 90 : 0
	const optionships = Array.from(optionContainer.children)
	optionships.forEach(optionship => optionship.style.transform = `rotate(${angle}deg)`)
}

// Creating Boards
const width  = 10

function createboard(color, user) {
	const gameboardContainer = document.createElement('div')
	gameboardContainer.classList.add('game-board')
	gameboardContainer.style.backgroundColor = color
	gameBoardsContainer.append(gameboardContainer)
	gameboardContainer.id = user
	
	for (let i = 0; i < width * width; i++) {
		const block = document.createElement('div')
		block.classList.add('block')
		block.id = i
		gameboardContainer.append(block)
	}
	
}

createboard('#003b61', 'player')
createboard('#003b61', 'bot')

// Creating Ships
class ship {
	constructor(name, length) {
		this.name = name
		this.length = length
	}
	
}

const destroyer = new ship('destroyer', 2)
const submarine = new ship('submarine', 3)
const cruiser = new ship('cruiser', 3)
const battleship = new ship('battleship', 4)
const carrier = new ship('carrier', 5)

const ships = [destroyer, submarine, cruiser, battleship, carrier]
let notDropped

function getValidity(allBoardBlocks, ishoriz, startIndex, Ship) {
	let validstart
	
	validstart = ishoriz ? startIndex <= width * width - Ship.length ? startIndex : width * width - Ship.length : startIndex <= width * width - width * Ship.length ? startIndex : startIndex - Ship.length * width + width 
	
	let shipBlocks = []
	
	for (let i = 0; i < Ship.length; i++) {
		if(ishoriz) {
			shipBlocks.push(allBoardBlocks[Number(validstart) + i])
		} else {
			shipBlocks.push(allBoardBlocks[Number(validstart) + i * width])
		}
	}
	let valid
	
	if (ishoriz) {
		shipBlocks.every((_shipBlock, index) => valid = shipBlocks[0].id % width !== width - (shipBlocks.length - (index + 1)))
		} else {
		shipBlocks.every((_shipBlock, index) => valid = shipBlocks[0].id < 90 + (width * index + 1))
		}
	
	const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))
	
	return {shipBlocks, valid, notTaken}
}


function addShipPiece(user, Ship, startId) {
	const allBoardBlocks = document.querySelectorAll(`#${user} div`)
	let randbool = Math.random() < 0.5
	let ishoriz = user === 'player' ? angle === 0 : randbool
	let randomStartIndex = Math.floor(Math.random() * width * width)
	
	let startIndex = startId ? startId : randomStartIndex
	
		
	const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, ishoriz, startIndex, Ship)
	
	if (valid && notTaken) {
		shipBlocks.forEach(shipBlock => {
		shipBlock.classList.add(Ship.name)
		shipBlock.classList.add('taken')
		})
	} else {
		if (user === 'bot') addShipPiece('bot', Ship)
		if (user === 'player') notDropped = true
	}
	
	
	
}

ships.forEach(sh => addShipPiece('bot', sh))


// drag player ships
let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => {
	optionShip.addEventListener('dragstart', dragstart)
	
})


const allPayerBlocks = document.querySelectorAll('#player div')

allPayerBlocks.forEach(playerBlock => {
	playerBlock.addEventListener('dragover', dragOver)
	playerBlock.addEventListener('dragleave', dragAway)
	playerBlock.addEventListener('drop', dropShip)
})

function dragstart(e) {
	notDropped = false
	draggedShip = e.target
}

function dragOver(e) {
	e.preventDefault()
	highlightArea(e.target.id, ships[draggedShip.id])
}
function dragAway(e) {
	unhighlightArea(e.target.id, ships[draggedShip.id])
}

let notRemoved = [true,true,true,true,true]
function dropShip(e) {
	e.preventDefault()
	const startId = e.target.id
	const Ship = ships[draggedShip.id]
	unhighlightArea(e.target.id, Ship)
	if (notRemoved[draggedShip.id]) addShipPiece('player', Ship, startId)
	if (!notDropped) {
		draggedShip.remove()
		notRemoved[draggedShip.id] = false
	}
}

// Add Highlight
function highlightArea(startIndex, ship) {
	const allBoardBlocks = document.querySelectorAll('#player div')
	let ishoriz  = angle === 0 
	const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, ishoriz, startIndex, ship)
	
	if (valid && notTaken) {
		shipBlocks.forEach( shipBlock => {
			shipBlock.classList.add('hover')
		})
	}
}

// remove Highlight
function unhighlightArea(startIndex, ship) {
	const allBoardBlocks = document.querySelectorAll('#player div')
	let ishoriz  = angle === 0 
	
	const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, ishoriz, startIndex, ship)
	
	if (valid && notTaken) {
		shipBlocks.forEach( shipBlock => {
			setTimeout(() => shipBlock.classList.remove('hover'), 50)
		})
	}
}


let gameOver = false

let playerTurn



// Start Game
function startGame() {
	if (playerTurn === undefined) {
		if (optionContainer.children.length != 0) {
			infoDisplay.textContent = 'You need to place all your ships.'
		} else {
			const allBoardBlocks = document.querySelectorAll('#bot div')
			allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
			playerTurn = true
			turnDisplay.textContent = 'Start the game!'
			infoDisplay.textContent = 'Click on your opponent\'s board to attack!'
		}
		
		
	}
	
}

startButton.addEventListener('click', startGame)

let playerHits = []
let botHits = []
const playerSunkShips = []
const botSunkShips = []

function handleClick(e) {
	if (!gameOver) {
		if (e.target.classList.contains('taken')) {
			e.target.classList.add('boom')
			infoDisplay.textContent = "You have hit one of their ships!"
			let classes = Array.from(e.target.classList)
			classes = classes.filter(className => className !== 'block')
			classes = classes.filter(className => className !== 'boom')
			classes = classes.filter(className => className !== 'taken')
			
			playerHits.push(...classes)
			checkSore('player', playerHits, playerSunkShips) 
		}
		if (!e.target.classList.contains('taken')) {
			infoDisplay.textContent = "Better luck next time!"
			e.target.classList.add('empty')
			
		}
		playerTurn = false
		const allBoardBlocks = document.querySelectorAll('#bot div')
		allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)))
		setTimeout(botGo, 100)
		
	}
}

// Bot's turn
function botGo() {
	if(!gameOver){
		turnDisplay.textContent = "Bot's Turn."
		infoDisplay.textContent = "The bot will make its move!"
		
		setTimeout(() => {
			let randomGo = Math.floor(Math.random() * width * width)
			const allBoardBlocks = document.querySelectorAll('#player div')
			if (allBoardBlocks[randomGo].classList.contains('taken') && allBoardBlocks[randomGo].classList.contains('boom') ) {
				botGo()
				return
			} else if (allBoardBlocks[randomGo].classList.contains('taken') && !allBoardBlocks[randomGo].classList.contains('boom')) {
				allBoardBlocks[randomGo].classList.add('boom')
				infoDisplay.textContent = "You've lost a command post!"
				
				let classes = Array.from(allBoardBlocks[randomGo].classList)
				classes = classes.filter(className => className !== 'block')
				classes = classes.filter(className => className !== 'boom')
				classes = classes.filter(className => className !== 'taken')
				
				botHits.push(...classes)
				checkSore('bot', botHits, botSunkShips) 
			} else{
				infoDisplay.textContent = "You got lucky."
				allBoardBlocks[randomGo].classList.add('empty')
			}
			
		}, 100)
		
		setTimeout(() => {
			playerTurn = true
			turnDisplay.textContent = "Your Move!"
			infoDisplay.textContent = "Click on your opponent's board to attack!"
			const allBoardBlocks = document.querySelectorAll('#bot div')
			allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
		}, 100) 
		
	}
}

function checkSore(user, userHits, UserSS) {
	function checkShip(shipName, shiplen) {
		if (
			userHits.filter(storedShipName => storedShipName === shipName).length === shiplen
			) {
			
			if (user == 'player') {
				infoDisplay.textContent = `The bot's ${shipName} has been sunk!`
				playerHits = userHits.filter(storedShipName => storedShipName !== shipName) 
			} else if (user == 'bot'){
				infoDisplay.textContent = `Your ${shipName} has been sunk :(`
				botHits = userHits.filter(storedShipName => storedShipName !== shipName) 
			}
			UserSS.push(shipName)
		}
	}
	checkShip('destroyer', 2)
	checkShip('submarine', 3)
	checkShip('cruiser', 3)
	checkShip('battleship', 4)
	checkShip('carrier', 5)
	
	if(playerSunkShips.length === 5) {
		infoDisplay.textContent = 'You won!'
		gameOver = true
	}
	if(botSunkShips.length === 5) {
		infoDisplay.textContent = 'You lost!'
		gameOver = true
	}
}
