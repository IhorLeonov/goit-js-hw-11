// Создай фронтенд часть приложения поиска и просмотра изображений по ключевому слову.
// Форма изначально есть в HTML документе. Пользователь будет вводить строку для поиска в текстовое поле, а при сабмите формы необходимо выполнять HTTP-запрос.
// В качестве бэкенда используй публичный API сервиса Pixabay.
// ✅ 1. Зарегистрируйся, получи свой уникальный ключ доступа и ознакомься с документацией.
// 3. Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло.
// В таком случае показывай уведомление с текстом "Sorry, there are no images matching your search query. Please try again.".
// 4. При поиске по новому ключевому слову необходимо полностью очищать содержимое галереи, чтобы не смешивать результаты.
// 5. Pixabay API поддерживает пагинацию и предоставляет параметры page и per_page.
// Сделай так, чтобы в каждом ответе приходило 40 объектов(по умолчанию 20).
// 5.1 Изначально значение параметра page должно быть 1.
// 5.2 При каждом последующем запросе, его необходимо увеличить на 1.
// 5.3 При поиске по новому ключевому слову значение page надо вернуть в исходное.
// 6. В HTML документе уже есть разметка кнопки при клике по которой необходимо выполнять
// запрос за следующей группой изображений и добавлять разметку к уже существующим элементам галереи.
// ✅ 6.1 Изначально кнопка должна быть скрыта.
// 6.2 После первого запроса кнопка появляется в интерфейсе под галереей.
// 6.3 При повторном сабмите формы кнопка сначала прячется, а после запроса опять отображается.
// 6.4 В ответе бэкенд возвращает свойство totalHits - общее количество изображений которые подошли под критерий поиска(для бесплатного аккаунта).
// 6.5 Если пользователь дошел до конца коллекции, пряч кнопку и выводи уведомление с текстом: "We're sorry, but you've reached the end of search results.".
// 7. После первого запроса при каждом новом поиске выводить уведомление в котором будет написано сколько всего нашли изображений (свойство totalHits).
// Текст уведомления "Hooray! We found totalHits images."
// 8. Добавить отображение большой версии изображения с библиотекой SimpleLightbox для полноценной галереи.
// 8.1 В разметке необходимо будет обернуть каждую карточку изображения в ссылку, как указано в документации.
// 8.2 У библиотеки есть метод refresh() который обязательно нужно вызывать каждый раз после добавления новой группы карточек изображений.
// 9. Сделать плавную прокрутку страницы после запроса и отрисовки каждой следующей группы изображений.
// 10. Вместо кнопки «Load more» можно сделать бесконечную загрузку изображений при прокрутке страницы.

import axios from 'axios';
import Notiflix from 'notiflix';
import { debounce } from 'lodash';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const galleryBox = document.querySelector('.gallery');

let q = '';

searchForm.addEventListener('submit', onSubmit);

async function pixabayApi() {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '32998270-2baa29d20b34632b2d37a1874';
  const response = await axios.get(
    `${BASE_URL}?key=${KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true`
  );
  return response.data;
}

function onSubmit(evt) {
  evt.preventDefault();

  q = searchForm.searchQuery.value.trim();

  pixabayApi()
    .then(data => {
      createImgMarkup(data.hits);
    })
    .catch(err => console.log(err.message));
}

function createImgMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `
    <div class="photo-card">
    <a class="gallery__item" href="${largeImageURL}">
    <img class="img" src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
    <div class="info">
    <ul class="info-list list">
      <li class="info__item">
        <p><b>Likes</b></p>
        <p>${likes}</p>
      </li>
      <li class="info__item">
        <p><b>Views</b></p>
        <p>${views}</p>
      </li>
      <li class="info__item">
        <p><b>Comments</b></p>
        <p>${comments}</p>
      </li>
      <li class="info__item">
        <p><b>Downloads</b></p>
        <p>${downloads}</p>
      </li>
    </ul>
  </div>
  </div>`
    )
    .join('');

  galleryBox.insertAdjacentHTML('beforeend', markup);
  summonSimpleLightbox();
}

function summonSimpleLightbox() {
  const options = {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  };
  const lightbox = new SimpleLightbox('.gallery a', options);
  lightbox.refresh();
}
