

let startView = document.getElementsByTagName('startView')[0],
    replacement;
replacement = document.createElement('article');
replacement.classList.add('center');
replacement.innerHTML =`<p>Выберите чат</p>`;
startView.parentElement.replaceChild(replacement,startView);


