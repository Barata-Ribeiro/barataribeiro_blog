const formEl = document.querySelector(".register-account__rendered-form")
const buttonEl = document.querySelector(".register-account__button-submit")
const errorMessageEl = document.getElementById("error-message")

buttonEl.addEventListener("click", register)

async function register(event) {
    if (!formEl.checkValidity()) {
        formEl.reportValidity()
        return
    }

    event.preventDefault()

    buttonEl.setAttribute("disabled", true)
    buttonEl.textContent = "Loading..."

    const username = document.getElementById("username").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const data = { username, email, password }

    try {
        const response = await fetch("/api/v1/auth/register", {
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

        window.location = "/auth/login"
    } catch (error) {
        console.error("Register Error: ", error)
        errorMessageEl.textContent = "An unexpected error occurred. Please try again."
        errorMessageEl.style.display = "block"
    } finally {
        buttonEl.removeAttribute("disabled")
        buttonEl.textContent = "Sign Up"
    }
}
