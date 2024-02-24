const formEl = document.querySelector(".login-account__rendered-form")
const buttonEl = document.getElementById("login-account__button-submit")
const errorMessageEl = document.getElementById("error-message")

buttonEl.addEventListener("click", login)

async function login(event) {
    if (!formEl.checkValidity()) {
        formEl.reportValidity()
        return
    }

    event.preventDefault()

    buttonEl.setAttribute("disabled", true)
    buttonEl.textContent = "Loading..."

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const data = { username, password }

    try {
        const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            const error = await response.json()

            errorMessageEl.textContent = error.message
            errorMessageEl.style.display = "block"
            buttonEl.removeAttribute("disabled")
            buttonEl.textContent = "Login"
            return
        }

        await response.json()

        formEl.reset()

        window.location = "/dashboard"
    } catch (error) {
        console.error("Login error:", error)
        errorMessageEl.textContent = "An unexpected error occurred. Please try again."
        errorMessageEl.style.display = "block"
    } finally {
        buttonEl.removeAttribute("disabled")
        buttonEl.textContent = "Login"
    }
}
