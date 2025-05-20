// Обработка формы агента
document.getElementById("agentForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    sendFormData("agent");
});

// Обработка формы точки продаж
document.getElementById("salesPointForm")?.addEventListener("submit", function (e) {
    e.preventDefault();
    sendFormData("sales_point");
});

function sendFormData(formType) {
    const form = document.getElementById(`${formType}Form`);
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Отправка данных в Telegram бота
    if (window.Telegram?.WebApp?.sendData) {
        Telegram.WebApp.sendData(JSON.stringify(data));
        Telegram.WebApp.close();
    } else {
        alert("Данные отправлены в бота!");
        console.log("Form data:", data);
    }
}