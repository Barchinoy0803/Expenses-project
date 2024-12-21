const nameInput = document.getElementById("name-input")
const priceInput = document.getElementById("price-input")
const dateInput = document.getElementById("date-input")
const expensesWrapper = document.querySelector(".expenses-wrapper")
const submitButton = document.getElementById("submit-button")
const totalExpenses  = document.getElementById("total-expenses")
const dayOptions = document.getElementById("day-options")
const mainForm = document.querySelector(".main-form")

let expenses = JSON.parse(localStorage.getItem("expenses")) || []
renderExpenses(expenses)


const api = axios.create({
    baseURL: "https://6764655652b2a7619f5c73a2.mockapi.io/api/v1/"
})

calculateTotalExpenses(dayOptions.value)


mainForm.addEventListener("submit", (event) => {
    event.preventDefault()
    const expenses = {
        name: nameInput.value,
        price: priceInput.value,
        date: dateInput.value
    }
    addExpenses(expenses)
})

dayOptions.addEventListener("change", () => {
    calculateTotalExpenses(dayOptions.value)
})


async function addExpenses(expense){
    let response = await api.post("/expenses", expense)
    if (response.status == 201){
        let expenses = getExpenses()
        renderExpenses(expenses)
        calculateTotalExpenses(dayOptions.value)
    }
}


async function getExpenses(){
    expenses = await api.get("/expenses")
    return expenses.data
}


async function renderExpenses(expenses){
    expenses = await expenses
    localStorage.setItem("expenses", JSON.stringify(expenses))
    expensesWrapper.innerHTML = ""
    expenses.forEach((expense) => {
        expensesWrapper.insertAdjacentHTML(
            "beforeend",
            `<div class="expenses">
                <p>📝Name:   ${expense.name}</p>
                <p>💰Price:   ${expense.price}</p>
                <p>📆Date:    ${expense.date}</p>
            </div>`
        )
    })
}


async function calculateTotalExpenses(dayOption){
    let totalExpensesSum = 0
    let today = new Date()
    let expenses = await getExpenses()
    if(dayOption == "last-day"){
        let day = `${today.getDate()}.${today.getMonth()+1}.${today.getFullYear()}`
        console.log(day);
        totalExpensesSum = expenses.filter((expense) => expense.date == day).reduce((a, b) => a + (parseFloat(b.price) || 0), 0)
    }
    else if(dayOption == "last-week"){
        let lastWeek = new Date(today)
        lastWeek.setDate(today.getDate() - 7) 
        let formattedLastWeek = `${lastWeek.getDate().toString().padStart(2, '0')}.${(lastWeek.getMonth() + 1).toString().padStart(2, '0')}.${lastWeek.getFullYear().toString()}`
        let lastWeekExpenses = expenses.filter((expense) => +expense.date.split(".").join("") >= +formattedLastWeek.split(".").join("") && expense.date.split(".")[1] == formattedLastWeek.split(".")[1])
        totalExpensesSum = lastWeekExpenses.reduce((a, b) => a + (parseFloat(b.price) || 0), 0 )
        
    }
    else{
        let lastMonth = `${today.getMonth() + 1}.${today.getFullYear()}`
        totalExpensesSum = expenses.filter((expense) => expense.date.endsWith(lastMonth)).reduce((a, b) => a + (parseFloat(b.price) || 0), 0)
    }
    
    totalExpenses.innerHTML = `Total expenses: ${totalExpensesSum}`
}