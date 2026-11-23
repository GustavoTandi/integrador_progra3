const accesoRapido = document.querySelector("#acceso-rapido");
if (accesoRapido) {
    accesoRapido.addEventListener("click", () => {
        document.querySelector("#admin-mail").value = accesoRapido.dataset.mail;
        document.querySelector("#admin-clave").value = accesoRapido.dataset.clave;
        accesoRapido.form.querySelector('button[type="submit"]').focus();
    });
}

const dialogoEstado = document.querySelector("#confirmar-estado");
if (dialogoEstado) {
    let formulario;
    document.querySelectorAll("[data-confirmar]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            formulario = form;
            const { confirmar, producto } = form.dataset;
            dialogoEstado.querySelector("#confirmar-producto").textContent = producto;
            dialogoEstado.querySelector("#confirmar-titulo").textContent = confirmar + " producto";
            dialogoEstado.querySelector("#confirmar-accion").textContent = confirmar;
            dialogoEstado.returnValue = "";
            dialogoEstado.showModal();
        });
    });

    dialogoEstado.addEventListener("close", () => {
        if (dialogoEstado.returnValue === "aceptar") formulario?.submit();
        formulario = null;
    });
}
