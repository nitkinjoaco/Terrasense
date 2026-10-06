const boton = document.querySelector('.boton5');
const cuadrado = document.querySelector('.cuadrado14');

boton.addEventListener('click', () => {
    if (cuadrado.classList.contains('mostrar')) {
        cuadrado.classList.remove('mostrar');
    } else {
        cuadrado.classList.add('mostrar');
    }
});  
cuadrado.addEventListener('mouseleave', () => {
    cuadrado.classList.remove('mostrar');
});